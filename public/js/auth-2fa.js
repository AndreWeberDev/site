// 🎓 AULA: Integração 2FA no Login

// Função para mostrar interface de código 2FA
function show2FAInterface(email, user) {
  const container = document.querySelector('.auth-container');
  
  // Substituir formulário por interface 2FA
  container.innerHTML = `
    <div class="auth-form">
      <h2>🔐 Verificação em 2 Etapas</h2>
      <p style="text-align: center; color: #9aa0a6; margin-bottom: 20px;">
        Enviamos um código de 6 dígitos para seu email
      </p>
      
      <div class="code-input-container">
        <input type="text" class="code-input" maxlength="1" data-index="0">
        <input type="text" class="code-input" maxlength="1" data-index="1">
        <input type="text" class="code-input" maxlength="1" data-index="2">
        <input type="text" class="code-input" maxlength="1" data-index="3">
        <input type="text" class="code-input" maxlength="1" data-index="4">
        <input type="text" class="code-input" maxlength="1" data-index="5">
      </div>
      
      <button type="button" id="verify2FA">Verificar Código</button>
      <button type="button" id="resend2FA" class="resend-btn">Reenviar Código</button>
      
      <p><a href="login.html">← Voltar ao Login</a></p>
    </div>
  `;
  
  // Configurar inputs de código
  setup2FAInputs();
  
  // Event listeners
  document.getElementById('verify2FA').addEventListener('click', () => verify2FACode(email, user));
  document.getElementById('resend2FA').addEventListener('click', () => resend2FACode(email));
}

// Configurar comportamento dos inputs de código
function setup2FAInputs() {
  const inputs = document.querySelectorAll('.code-input');
  
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      
      if (value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      
      // Verificar se todos os campos estão preenchidos
      const allFilled = Array.from(inputs).every(inp => inp.value.length === 1);
      if (allFilled) {
        document.getElementById('verify2FA').style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
  
  // Focar no primeiro input
  inputs[0].focus();
}

// Verificar código 2FA
async function verify2FACode(email, user) {
  const inputs = document.querySelectorAll('.code-input');
  const code = Array.from(inputs).map(input => input.value).join('');
  
  if (code.length !== 6) {
    showError('Digite o código completo de 6 dígitos');
    return;
  }
  
  const result = twoFA.verifyCode(email, code);
  
  if (result.success) {
    showSuccess('✅ Código verificado! Entrando...');
    
    setTimeout(() => {
      completeLogin(user);
    }, 1000);
  } else {
    showError(result.error);
    
    // Limpar inputs em caso de erro
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('filled');
    });
    inputs[0].focus();
  }
}

// Reenviar código 2FA
async function resend2FACode(email) {
  const button = document.getElementById('resend2FA');
  button.disabled = true;
  button.textContent = 'Enviando...';
  
  await twoFA.sendCode(email, 'email');
  
  showSuccess('📱 Novo código enviado!');
  
  // Countdown de 30 segundos
  let countdown = 30;
  const interval = setInterval(() => {
    button.textContent = `Reenviar (${countdown}s)`;
    countdown--;
    
    if (countdown < 0) {
      clearInterval(interval);
      button.disabled = false;
      button.textContent = 'Reenviar Código';
    }
  }, 1000);
}

// Completar login após verificação
function completeLogin(user, submitButton = null) {
  if (submitButton) {
    submitButton.textContent = '✓ Sucesso!';
    submitButton.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
  }
  
  const container = document.querySelector('.auth-container');
  container.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
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
  }, 800);
}

// Função para ativar/desativar 2FA (para configurações)
function toggle2FA(email, enable) {
  if (enable) {
    twoFA.enable2FA(email);
    showSuccess('🔐 Autenticação de 2 fatores ativada!');
  } else {
    twoFA.disable2FA(email);
    showSuccess('🔓 Autenticação de 2 fatores desativada!');
  }
}

// Exportar funções
window.show2FAInterface = show2FAInterface;
window.toggle2FA = toggle2FA;