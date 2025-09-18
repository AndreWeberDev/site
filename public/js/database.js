// Sistema de banco de dados local com IndexedDB
class LocalDatabase {
  constructor() {
    this.dbName = 'PortfolioDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store para usuários
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }
        
        // Store para sessões
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'userId' });
        }
        
        // Store para projetos
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
      };
    });
  }

  async saveUser(user) {
    const transaction = this.db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    return store.put(user);
  }

  async getUser(id) {
    const transaction = this.db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email) {
    const transaction = this.db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const index = store.index('email');
    return new Promise((resolve, reject) => {
      const request = index.get(email);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSession(userId, token, expiresAt) {
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    return store.put({ userId, token, expiresAt, createdAt: Date.now() });
  }

  async getSession(userId) {
    const transaction = this.db.transaction(['sessions'], 'readonly');
    const store = transaction.objectStore('sessions');
    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSession(userId) {
    const transaction = this.db.transaction(['sessions'], 'readwrite');
    const store = transaction.objectStore('sessions');
    return store.delete(userId);
  }
}

// Sistema de autenticação persistente
class PersistentAuth {
  constructor() {
    this.db = new LocalDatabase();
    this.currentUser = null;
    this.sessionToken = null;
  }

  async init() {
    await this.db.init();
    await this.initializeAdmin();
    await this.checkExistingSession();
  }

  async initializeAdmin() {
    const adminExists = await this.db.getUserByEmail('andre@admin.com');
    if (!adminExists) {
      const admin = {
        id: 1,
        name: 'André Junior',
        email: 'andre@admin.com',
        password: 'Naui2742',
        isAdmin: true,
        verified: true,
        createdAt: Date.now()
      };
      await this.db.saveUser(admin);
    }
  }

  generateToken() {
    return btoa(Math.random().toString(36).substr(2) + Date.now().toString(36));
  }

  async login(email, password, rememberMe = true) {
    const user = await this.db.getUserByEmail(email);
    
    if (!user || user.password !== password) {
      throw new Error('Email ou senha incorretos');
    }

    if (!user.verified && !user.isAdmin) {
      throw new Error('Email não verificado');
    }

    this.currentUser = user;
    
    if (rememberMe) {
      this.sessionToken = this.generateToken();
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 dias
      await this.db.saveSession(user.id, this.sessionToken, expiresAt);
      
      // Salvar token no localStorage também
      localStorage.setItem('sessionToken', this.sessionToken);
      localStorage.setItem('userId', user.id);
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  async checkExistingSession() {
    const sessionToken = localStorage.getItem('sessionToken');
    const userId = localStorage.getItem('userId');
    
    if (!sessionToken || !userId) return false;

    try {
      const session = await this.db.getSession(parseInt(userId));
      
      if (!session || session.token !== sessionToken) {
        this.clearLocalSession();
        return false;
      }

      if (Date.now() > session.expiresAt) {
        await this.db.clearSession(parseInt(userId));
        this.clearLocalSession();
        return false;
      }

      const user = await this.db.getUser(parseInt(userId));
      if (user) {
        this.currentUser = user;
        this.sessionToken = sessionToken;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      this.clearLocalSession();
    }
    
    return false;
  }

  clearLocalSession() {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUser');
  }

  async logout() {
    if (this.currentUser && this.sessionToken) {
      await this.db.clearSession(this.currentUser.id);
    }
    
    this.currentUser = null;
    this.sessionToken = null;
    this.clearLocalSession();
  }

  async register(name, email, password) {
    const existingUser = await this.db.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    this.validatePassword(password);

    const user = {
      id: Date.now(),
      name,
      email,
      password,
      isAdmin: false,
      verified: false,
      createdAt: Date.now()
    };

    await this.db.saveUser(user);
    return user;
  }

  validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const minLength = password.length >= 8;
    
    if (!minLength) throw new Error('Senha deve ter pelo menos 8 caracteres');
    if (!hasUpperCase) throw new Error('Senha deve ter pelo menos 1 letra maiúscula');
    if (!hasSpecialChar) throw new Error('Senha deve ter pelo menos 1 número ou símbolo');
  }

  async updateUserProfile(userId, profileData) {
    const user = await this.db.getUser(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...profileData };
    await this.db.saveUser(updatedUser);
    
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = updatedUser;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    return updatedUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.isAdmin;
  }
}

// Instância global
const persistentAuth = new PersistentAuth();

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', async function() {
  try {
    await persistentAuth.init();
    
    // Atualizar referência global para compatibilidade
    window.auth = persistentAuth;
    
    // Atualizar sidebar se usuário estiver logado
    if (typeof updateSidebar === 'function') {
      updateSidebar();
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    // Fallback para localStorage se IndexedDB falhar
    window.auth = new AuthSystem();
  }
});