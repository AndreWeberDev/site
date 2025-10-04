// Sistema de autenticação simples usando localStorage
class AuthSystem {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users')) || [];
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    this.initializeAdmin();
  }

  initializeAdmin() {
    // Criar conta admin se não existir
    const adminExists = this.users.find(user => user.email === 'andre@admin.com');
    if (!adminExists) {
      this.users.push({
        id: 1,
        name: 'André Junior',
        email: 'andre@admin.com',
        password: 'Naui2742',
        isAdmin: true,
        verified: true
      });
      localStorage.setItem('users', JSON.stringify(this.users));
    }
  }

  validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const minLength = password.length >= 8;
    
    if (!minLength) {
      throw new Error('Senha deve ter pelo menos 8 caracteres');
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

  async register(name, email, password) {
    if (this.users.find(user => user.email === email)) {
      throw new Error('Email já cadastrado');
    }

    this.validatePassword(password);

    const user = {
      id: Date.now(),
      name,
      email,
      password,
      isAdmin: false,
      verified: false
    };

    // Salvar usuário como pendente
    localStorage.setItem('pendingUser', JSON.stringify(user));
    
    // Enviar código de verificação
    const verification = new EmailVerification();
    await verification.sendVerificationCode(email, name);
    
    return user;
  }

  completeRegistration(user) {
    // Adicionar usuário verificado ao banco
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
    
    // Limpar dados pendentes
    localStorage.removeItem('pendingUser');
    
    return user;
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    if (!user.verified && !user.isAdmin) {
      throw new Error('Email não verificado. Verifique sua caixa de entrada.');
    }

    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
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
        // Animação de loading
        submitButton.textContent = 'Entrando...';
        submitButton.disabled = true;
        submitButton.style.background = 'linear-gradient(135deg, #9aa0a6, #666)';
        
        const rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;
        const user = auth.login(email, password);
        
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
            if (user.isAdmin) {
              window.location.href = 'admin.html';
            } else {
              window.location.href = 'index.html';
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
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const submitButton = registerForm.querySelector('button[type="submit"]');

      if (password !== confirmPassword) {
        // Animação de erro para senhas diferentes
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
        // Animação de loading
        submitButton.textContent = 'Cadastrando...';
        submitButton.disabled = true;
        submitButton.style.background = 'linear-gradient(135deg, #9aa0a6, #666)';
        
        await auth.register(name, email, password);
        
        // Animação de sucesso aprimorada
        const form = document.querySelector('.auth-form');
        const container = document.querySelector('.auth-container');
        
        // Efeito de sucesso no botão
        submitButton.textContent = '✓ Código Enviado!';
        submitButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        submitButton.style.transform = 'scale(1.05)';
        
        // Animação do formulário
        form.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        form.style.transform = 'scale(1.02)';
        form.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(69, 160, 73, 0.1))';
        form.style.border = '2px solid #4CAF50';
        form.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.3)';
        
        showSuccess('Código de verificação enviado! Redirecionando...');
        
        setTimeout(() => {
          // Animação de saída
          container.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          container.style.transform = 'scale(0.8) translateY(-50px)';
          container.style.opacity = '0';
          
          setTimeout(() => {
            window.location.href = 'verify-email.html';
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