// 🎓 AULA: Frontend conectado ao Banco Real
class DatabaseAuth {
  constructor() {
    this.baseURL = 'http://localhost:5487/api';
    this.token = localStorage.getItem('auth_token');
    this.currentUser = JSON.parse(localStorage.getItem('current_user')) || null;
  }

  // CADASTRO com banco real
  async register(name, email, password) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // LOGIN com banco real
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Salvar token e usuário
      this.token = data.token;
      this.currentUser = data.user;
      
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('current_user', JSON.stringify(this.currentUser));

      return data.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // LOGOUT
  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  // Verificar se está logado
  isLoggedIn() {
    return this.token !== null && this.currentUser !== null;
  }

  // Verificar se é admin
  isAdmin() {
    return this.currentUser && this.currentUser.isAdmin;
  }

  // Fazer requisições autenticadas
  async authenticatedRequest(url, options = {}) {
    if (!this.token) {
      throw new Error('Token não encontrado');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };

    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expirado, fazer logout
      this.logout();
      window.location.href = 'login.html';
      return;
    }

    return response;
  }
}

// Substituir o sistema antigo
const dbAuth = new DatabaseAuth();

// Função para testar conexão
async function testConnection() {
  try {
    const response = await fetch('http://localhost:5487/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test', password: 'test' })
    });
    
    console.log('✅ Servidor conectado!');
    return true;
  } catch (error) {
    console.log('❌ Servidor offline - usando localStorage');
    return false;
  }
}

// Sistema híbrido: tenta banco, se falhar usa localStorage
window.hybridAuth = {
  async login(email, password) {
    const serverOnline = await testConnection();
    
    if (serverOnline) {
      return await dbAuth.login(email, password);
    } else {
      return auth.login(email, password); // Sistema antigo
    }
  },
  
  async register(name, email, password) {
    const serverOnline = await testConnection();
    
    if (serverOnline) {
      return await dbAuth.register(name, email, password);
    } else {
      return auth.register(name, email, password); // Sistema antigo
    }
  },
  
  logout() {
    dbAuth.logout();
    auth.logout();
  },
  
  isLoggedIn() {
    return dbAuth.isLoggedIn() || auth.isLoggedIn();
  },
  
  isAdmin() {
    return dbAuth.isAdmin() || auth.isAdmin();
  }
};