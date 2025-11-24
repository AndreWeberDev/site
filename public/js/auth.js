// Sistema de autenticação simples usando localStorage
class AuthSystem {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users')) || [];
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    this.initializeAdmin();
  }

  initializeAdmin() {
    // Forçar recriação do admin para garantir que existe
    const adminUser = {
      id: 1,
      name: 'André Junior',
      email: 'andre@admin.com',
      password: 'Naui2742',
      isAdmin: true,
      verified: true
    };
    
    // Remover admin existente se houver
    this.users = this.users.filter(user => user.email !== 'andre@admin.com');
    
    // Adicionar admin atualizado
    this.users.unshift(adminUser); // Adiciona no início
    localStorage.setItem('users', JSON.stringify(this.users));
    
    console.log('Admin inicializado:', adminUser);
    console.log('Todos os usuários:', this.users);
  }
  
  // Função para resetar o sistema (para debug)
  resetSystem() {
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    this.users = [];
    this.currentUser = null;
    this.initializeAdmin();
    console.log('Sistema resetado!');
  }

  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Senha é obrigatória');
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const minLength = password.length >= 8;
    const maxLength = password.length <= 128;
    
    if (!minLength) {
      throw new Error('Senha deve ter pelo menos 8 caracteres');
    }
    if (!maxLength) {
      throw new Error('Senha deve ter no máximo 128 caracteres');
    }
    if (!hasUpperCase) {
      throw new Error('Senha deve ter pelo menos 1 letra maiúscula');
    }
    if (!hasSpecialChar) {
      throw new Error('Senha deve ter pelo menos 1 número ou símbolo');
    }
  }

  updateUserProfile(userId, profileData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...profileData };
      localStorage.setItem('users', JSON.stringify(users));
      
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...profileData };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }
      
      return users[userIndex];
    }
    return null;
  }

  register(name, email, password) {
    if (!name || !email || !password) {
      throw new Error('Todos os campos são obrigatórios');
    }
    
    if (typeof name !== 'string' || name.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
    
    if (this.users.find(user => user.email === email)) {
      throw new Error('Email já cadastrado');
    }

    this.validatePassword(password);

    const user = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      isAdmin: false,
      verified: true
    };

    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
    
    return user;
  }

  login(email, password) {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }
    
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new Error('Dados inválidos');
    }
    
    console.log('Tentativa de login:', { email });
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = this.users.find(u => u.email === normalizedEmail && u.password === password);
    
    if (!user) {
      const emailExists = this.users.find(u => u.email === normalizedEmail);
      if (emailExists) {
        throw new Error('Senha incorreta');
      } else {
        throw new Error('Email não encontrado');
      }
    }

    if (!user.verified && !user.isAdmin) {
      throw new Error('Email não verificado. Verifique sua caixa de entrada.');
    }

    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('Login bem-sucedido');
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.isAdmin;
  }

  verifyEmail(email) {
    const user = this.users.find(u => u.email === email);
    if (user) {
      user.verified = true;
      localStorage.setItem('users', JSON.stringify(this.users));
    }
  }
}

const auth = new AuthSystem();

// Funções globais para debug
window.debugAuth = {
  resetSystem: () => auth.resetSystem(),
  showUsers: () => console.table(auth.users),
  testLogin: (email = 'andre@admin.com', password = 'Naui2742') => {
    try {
      const result = auth.login(email, password);
      console.log('✅ Login bem-sucedido:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      return null;
    }
  },
  createTestUser: () => {
    try {
      const result = auth.register('Teste User', 'teste@teste.com', 'Teste123!');
      console.log('✅ Usuário de teste criado:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      return null;
    }
  }
};

console.log('🔧 Debug disponível em window.debugAuth');
console.log('Comandos: resetSystem(), showUsers(), testLogin(), createTestUser()');

// Event listeners para formulários
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const submitButton = loginForm.querySelector('button[type="submit"]');

      try {
        // Limpar mensagens anteriores
        const existingError = document.querySelector('.error');
        if (existingError) existingError.remove();
        
        // Animação de loading
        submitButton.textContent = 'Entrando...';
        submitButton.disabled = true;
        submitButton.style.background = 'linear-gradient(135deg, #9aa0a6, #666)';
        
        // Pequeno delay para mostrar o loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Tentar usar banco real primeiro
        let user;
        try {
          const response = await fetch('http://localhost:5487/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          if (response.ok) {
            const data = await response.json();
            user = data.user;
            localStorage.setItem('auth_token', data.token);
            console.log('✅ Login com banco real!');
          } else {
            throw new Error('Servidor offline');
          }
        } catch (error) {
          // Fallback para localStorage
          user = auth.login(email, password);
          console.log('⚠️ Usando localStorage como backup');
        }
        
        // Animação de sucesso aprimorada
        const form = document.querySelector('.auth-form');
        const container = document.querySelector('.auth-container');
        
        // Efeito de sucesso no botão
        submitButton.textContent = '✓ Sucesso!';
        submitButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        submitButton.style.transform = 'scale(1.05)';
        
        // Animação do formulário
        form.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        form.style.transform = 'scale(1.02)';
        form.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(69, 160, 73, 0.1))';
        form.style.border = '2px solid #4CAF50';
        form.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.3)';
        
        // Animação do container
        container.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        container.style.transform = 'scale(0.95) translateY(-10px)';
        container.style.opacity = '0.9';
        
        // Mostrar mensagem de sucesso
        showSuccess('Login realizado com sucesso! Redirecionando...');
        
        setTimeout(() => {
          // Animação de saída
          container.style.transform = 'scale(0.8) translateY(-50px)';
          container.style.opacity = '0';
          
          setTimeout(() => {
            if (typeof refreshSidebar === 'function') {
              refreshSidebar();
            }
            // Redirecionamento corrigido
            if (user && user.isAdmin) {
              window.location.href = './admin.html';
            } else {
              window.location.href = './index.html';
            }
          }, 400);
        }, 1200);
        
      } catch (error) {
        // Reset do botão em caso de erro
        submitButton.textContent = 'Entrar';
        submitButton.disabled = false;
        submitButton.style.background = '#667eea';
        submitButton.style.transform = 'scale(1)';
        
        // Animação de erro
        const form = document.querySelector('.auth-form');
        form.style.transition = 'all 0.3s ease';
        form.style.transform = 'translateX(-10px)';
        form.style.border = '2px solid #e74c3c';
        
        setTimeout(() => {
          form.style.transform = 'translateX(10px)';
        }, 150);
        
        setTimeout(() => {
          form.style.transform = 'translateX(0)';
          form.style.border = '1px solid #ddd';
        }, 300);
        
        showError(error.message);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const submitButton = registerForm.querySelector('button[type="submit"]');

      if (password !== confirmPassword) {
        const passwordFields = [document.getElementById('password'), document.getElementById('confirmPassword')];
        passwordFields.forEach(field => {
          field.style.border = '2px solid #e74c3c';
          field.style.transform = 'translateX(-5px)';
          setTimeout(() => field.style.transform = 'translateX(5px)', 100);
          setTimeout(() => {
            field.style.transform = 'translateX(0)';
            field.style.border = '1px solid #ddd';
          }, 200);
        });
        showError('Senhas não coincidem');
        return;
      }

      try {
        submitButton.textContent = 'Cadastrando...';
        submitButton.disabled = true;
        submitButton.style.background = 'linear-gradient(135deg, #9aa0a6, #666)';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const response = await fetch('http://localhost:5487/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          
          if (response.ok) {
            console.log('✅ Cadastro com banco real!');
          } else {
            const error = await response.json();
            throw new Error(error.error);
          }
        } catch (error) {
          auth.register(name, email, password);
          console.log('⚠️ Usando localStorage como backup');
        }
        
        // Animação de sucesso aprimorada
        const form = document.querySelector('.auth-form');
        const container = document.querySelector('.auth-container');
        
        // Efeito de sucesso no botão
        submitButton.textContent = '✓ Cadastrado!';
        submitButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        submitButton.style.transform = 'scale(1.05)';
        
        // Animação do formulário
        form.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        form.style.transform = 'scale(1.02)';
        form.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(69, 160, 73, 0.1))';
        form.style.border = '2px solid #4CAF50';
        form.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.3)';
        
        showSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
        
        setTimeout(() => {
          // Animação de saída
          container.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          container.style.transform = 'scale(0.8) translateY(-50px)';
          container.style.opacity = '0';
          
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 400);
        }, 1500);
        
      } catch (error) {
        // Reset do botão em caso de erro
        submitButton.textContent = 'Cadastrar';
        submitButton.disabled = false;
        submitButton.style.background = '#667eea';
        submitButton.style.transform = 'scale(1)';
        
        // Animação de erro
        const form = document.querySelector('.auth-form');
        form.style.transition = 'all 0.3s ease';
        form.style.transform = 'translateX(-10px)';
        form.style.border = '2px solid #e74c3c';
        
        setTimeout(() => {
          form.style.transform = 'translateX(10px)';
        }, 150);
        
        setTimeout(() => {
          form.style.transform = 'translateX(0)';
          form.style.border = '1px solid #ddd';
        }, 300);
        
        showError(error.message);
      }
    });
  }
});

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.textContent = message;
  
  const form = document.querySelector('.auth-form');
  const existingError = form.querySelector('.error');
  if (existingError) {
    existingError.remove();
  }
  
  form.insertBefore(errorDiv, form.firstChild);
  
  // Adicionar classe de erro ao formulário para animação
  form.classList.add('error');
  
  // Remover classe após animação
  setTimeout(() => {
    form.classList.remove('error');
  }, 500);
  
  // Remover mensagem de erro após 5 segundos
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.style.transition = 'all 0.3s ease';
      errorDiv.style.opacity = '0';
      errorDiv.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 300);
    }
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.className = 'success';
  successDiv.textContent = message;
  
  const form = document.querySelector('.auth-form');
  const existingSuccess = form.querySelector('.success');
  if (existingSuccess) {
    existingSuccess.remove();
  }
  
  form.insertBefore(successDiv, form.firstChild);
  
  // Adicionar efeito de partículas
  createSuccessParticles(form);
}

// Criar efeito de partículas de sucesso
function createSuccessParticles(container) {
  const particleCount = 12;
  const containerRect = container.getBoundingClientRect();
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'success-particles';
    
    // Posição aleatória dentro do container
    const x = Math.random() * containerRect.width;
    const y = Math.random() * containerRect.height;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.animationDelay = (Math.random() * 0.5) + 's';
    
    container.appendChild(particle);
    
    // Remover partícula após animação
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1500);
  }
}

async function logout() {
  // Animação de logout
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.style.transform = 'scale(0.95)';
    mainContent.style.opacity = '0.7';
  }
  
  setTimeout(() => {
    auth.logout();
    if (typeof refreshSidebar === 'function') {
      refreshSidebar();
    }
    window.location.href = 'index.html';
  }, 300);
}

// Verificar autenticação em páginas protegidas
function checkAuth() {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function checkAdminAuth() {
  if (!auth.isLoggedIn() || !auth.isAdmin()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}