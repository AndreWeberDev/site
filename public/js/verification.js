// Sistema de verificação de email
class EmailVerification {
  constructor() {
    this.pendingUser = JSON.parse(localStorage.getItem('pendingUser')) || null;
    this.verificationCode = localStorage.getItem('verificationCode') || null;
    this.codeExpiry = localStorage.getItem('codeExpiry') || null;
  }

  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(email, name) {
    const code = this.generateCode();
    const expiry = Date.now() + (10 * 60 * 1000); // 10 minutos
    
    // Salvar código temporariamente
    localStorage.setItem('verificationCode', code);
    localStorage.setItem('codeExpiry', expiry);
    
    // Simular envio de email
    console.log(`Código de verificação para ${email}: ${code}`);
    
    // Mostrar código na tela (apenas para demonstração)
    this.showCodeInConsole(code, email, name);
    
    return true;
  }

  showCodeInConsole(code, email, name) {
    // Simular email enviado
    const emailContent = `
    ═══════════════════════════════════════
    📧 EMAIL DE VERIFICAÇÃO ENVIADO
    ═══════════════════════════════════════
    
    Para: ${email}
    Assunto: Código de Verificação - Site do Junin
    
    Olá ${name}!
    
    Seu código de verificação é:
    
    🔐 ${code}
    
    Este código expira em 10 minutos.
    
    Se você não solicitou este código, ignore este email.
    
    ═══════════════════════════════════════
    `;
    
    console.log(emailContent);
    
    // Mostrar alerta com o código (apenas para demonstração)
    setTimeout(() => {
      alert(`CÓDIGO DE VERIFICAÇÃO (Demo):\n\n${code}\n\nEm um sistema real, este código seria enviado por email.`);
    }, 1000);
  }

  verifyCode(inputCode) {
    const storedCode = localStorage.getItem('verificationCode');
    const expiry = localStorage.getItem('codeExpiry');
    
    if (!storedCode || !expiry) {
      throw new Error('Código não encontrado. Solicite um novo código.');
    }
    
    if (Date.now() > parseInt(expiry)) {
      this.clearVerificationData();
      throw new Error('Código expirado. Solicite um novo código.');
    }
    
    if (inputCode !== storedCode) {
      throw new Error('Código incorreto. Tente novamente.');
    }
    
    return true;
  }

  async completeVerification() {
    const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
    
    if (!pendingUser) {
      throw new Error('Usuário não encontrado.');
    }
    
    // Marcar usuário como verificado
    pendingUser.verified = true;
    
    // Completar registro no sistema de autenticação
    const user = auth.completeRegistration(pendingUser);
    
    // Limpar dados temporários
    this.clearVerificationData();
    
    return user;
  }

  clearVerificationData() {
    localStorage.removeItem('verificationCode');
    localStorage.removeItem('codeExpiry');
    localStorage.removeItem('pendingUser');
  }

  async resendCode() {
    const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
    
    if (!pendingUser) {
      throw new Error('Usuário não encontrado.');
    }
    
    return await this.sendVerificationCode(pendingUser.email, pendingUser.name);
  }
}

// Instância global
const emailVerification = new EmailVerification();

// Funcionalidades da página de verificação
document.addEventListener('DOMContentLoaded', function() {
  const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
  
  if (!pendingUser) {
    window.location.href = 'register.html';
    return;
  }
  
  // Mostrar email do usuário
  const userEmailElement = document.getElementById('userEmail');
  if (userEmailElement) {
    userEmailElement.textContent = pendingUser.email;
  }
  
  // Configurar inputs de código
  setupCodeInputs();
  
  // Configurar formulário
  const verifyForm = document.getElementById('verifyForm');
  if (verifyForm) {
    verifyForm.addEventListener('submit', handleVerification);
  }
});

function setupCodeInputs() {
  const inputs = document.querySelectorAll('.code-input');
  
  inputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      const value = e.target.value;
      
      // Apenas números
      if (!/^\d$/.test(value)) {
        e.target.value = '';
        return;
      }
      
      // Marcar como preenchido
      e.target.classList.add('filled');
      
      // Mover para próximo input
      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });
    
    input.addEventListener('keydown', function(e) {
      // Backspace - voltar para input anterior
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
        inputs[index - 1].classList.remove('filled');
      }
    });
    
    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const paste = e.clipboardData.getData('text');
      const digits = paste.replace(/\D/g, '').slice(0, 6);
      
      digits.split('').forEach((digit, i) => {
        if (inputs[i]) {
          inputs[i].value = digit;
          inputs[i].classList.add('filled');
        }
      });
      
      if (digits.length === 6) {
        inputs[5].focus();
      }
    });
  });
}

async function handleVerification(e) {
  e.preventDefault();
  
  const inputs = document.querySelectorAll('.code-input');
  const code = Array.from(inputs).map(input => input.value).join('');
  
  if (code.length !== 6) {
    showError('Digite o código completo de 6 dígitos');
    return;
  }
  
  try {
    // Verificar código
    emailVerification.verifyCode(code);
    
    // Completar verificação
    const user = await emailVerification.completeVerification();
    
    // Animação de sucesso
    const form = document.querySelector('.auth-form');
    form.style.transform = 'scale(1.05)';
    form.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    
    showSuccess('Email verificado com sucesso!');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    
  } catch (error) {
    showError(error.message);
    
    // Limpar inputs em caso de erro
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('filled');
    });
    inputs[0].focus();
  }
}

async function resendCode() {
  const resendBtn = document.querySelector('.resend-btn');
  
  try {
    resendBtn.disabled = true;
    resendBtn.textContent = 'Enviando...';
    
    await emailVerification.resendCode();
    
    showSuccess('Código reenviado com sucesso!');
    
    // Countdown de 60 segundos
    let countdown = 60;
    const interval = setInterval(() => {
      resendBtn.textContent = `Reenviar em ${countdown}s`;
      countdown--;
      
      if (countdown < 0) {
        clearInterval(interval);
        resendBtn.disabled = false;
        resendBtn.textContent = 'Reenviar código';
      }
    }, 1000);
    
  } catch (error) {
    showError(error.message);
    resendBtn.disabled = false;
    resendBtn.textContent = 'Reenviar código';
  }
}

// Criar efeito de partículas de sucesso
function createSuccessParticles(container) {
  const particleCount = 20;
  const containerRect = container.getBoundingClientRect();
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'success-particles';
    
    const x = Math.random() * containerRect.width;
    const y = Math.random() * containerRect.height;
    const size = Math.random() * 6 + 4;
    const duration = Math.random() * 1000 + 1500;
    
    particle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #4CAF50, #45a049);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      animation: particleFloat ${duration}ms ease-out forwards;
      animation-delay: ${Math.random() * 500}ms;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
    `;
    
    container.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, duration + 500);
  }
  
  if (!document.getElementById('particle-animation-css')) {
    const style = document.createElement('style');
    style.id = 'particle-animation-css';
    style.textContent = `
      @keyframes particleFloat {
        0% {
          opacity: 1;
          transform: translateY(0) scale(0);
        }
        10% {
          transform: translateY(-10px) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-100px) scale(0.5);
        }
      }
    `;
    document.head.appendChild(style);
  }
}