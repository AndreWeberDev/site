// 🎓 AULA: Sistema de Autenticação de 2 Fatores (2FA)

class TwoFactorAuth {
  constructor() {
    this.codes = new Map(); // Armazena códigos temporários
  }

  // 1. GERAR CÓDIGO DE 6 DÍGITOS
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 2. ENVIAR CÓDIGO SIMPLES
  async sendCode(email, method = 'email') {
    const code = this.generateCode();
    
    // Armazenar código
    this.codes.set(email, {
      code,
      expiresAt: Date.now() + (5 * 60 * 1000),
      attempts: 0
    });

    // Mostrar código na tela
    this.showCodeInUI(code, method);
    
    return {
      success: true,
      message: 'Código gerado!',
      expiresIn: 300
    };
  }

  // 3. VERIFICAR CÓDIGO
  verifyCode(email, inputCode) {
    const stored = this.codes.get(email);
    
    if (!stored) {
      return { success: false, error: 'Código não encontrado' };
    }
    
    if (Date.now() > stored.expiresAt) {
      this.codes.delete(email);
      return { success: false, error: 'Código expirado' };
    }
    
    stored.attempts++;
    
    if (stored.attempts > 3) {
      this.codes.delete(email);
      return { success: false, error: 'Muitas tentativas. Solicite novo código' };
    }
    
    if (stored.code !== inputCode) {
      return { success: false, error: 'Código incorreto' };
    }
    
    // Código correto - limpar
    this.codes.delete(email);
    return { success: true, message: 'Código verificado com sucesso!' };
  }

  // 4. MOSTRAR CÓDIGO NA INTERFACE (DEMO)
  showCodeInUI(code, method) {
    // Criar notificação visual
    const notification = document.createElement('div');
    notification.className = 'two-factor-demo';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4285f4, #8ab4f8);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 2000;
        max-width: 300px;
        animation: slideInRight 0.5s ease;
      ">
        <h4 style="margin: 0 0 10px 0;">📱 Código 2FA (DEMO)</h4>
        <p style="margin: 0 0 10px 0; font-size: 14px;">
          Enviado via ${method === 'email' ? '📧 Email' : '📱 SMS'}
        </p>
        <div style="
          background: rgba(255,255,255,0.2);
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 3px;
          margin: 10px 0;
        ">${code}</div>
        <p style="margin: 0; font-size: 12px; opacity: 0.8;">
          ⏰ Expira em 5 minutos
        </p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 10 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.5s ease';
        setTimeout(() => notification.remove(), 500);
      }
    }, 10000);
  }

  // 5. HABILITAR 2FA PARA USUÁRIO
  enable2FA(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].twoFactorEnabled = true;
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    }
    return false;
  }

  // 6. DESABILITAR 2FA
  disable2FA(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
      users[userIndex].twoFactorEnabled = false;
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    }
    return false;
  }

  // 7. VERIFICAR SE USUÁRIO TEM 2FA ATIVO
  has2FA(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    return user && user.twoFactorEnabled;
  }
}

// Instância global
const twoFA = new TwoFactorAuth();

// CSS para animações
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Exportar para uso global
window.twoFA = twoFA;