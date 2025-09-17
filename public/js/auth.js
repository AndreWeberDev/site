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

  register(name, email, password) {
    if (this.users.find(user => user.email === email)) {
      throw new Error('Email já cadastrado');
    }

    const user = {
      id: Date.now(),
      name,
      email,
      password,
      isAdmin: false,
      verified: false
    };

    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
    
    // Simular envio de email de verificação
    alert('Cadastro realizado! Verifique seu email para ativar a conta.');
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
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const user = auth.login(email, password);
        if (user.isAdmin) {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'contatos.html';
        }
      } catch (error) {
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

      if (password !== confirmPassword) {
        showError('Senhas não coincidem');
        return;
      }

      try {
        auth.register(name, email, password);
        showSuccess('Cadastro realizado com sucesso!');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } catch (error) {
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
}

function logout() {
  auth.logout();
  window.location.href = 'index.html';
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