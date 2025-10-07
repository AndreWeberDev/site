// Sistema 2FA Simples - Sem Email Real
class Simple2FA {
  constructor() {
    this.codes = new Map();
  }

  // Gerar código
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Enviar código (mostra na tela)
  async sendCode(email) {
    const code = this.generateCode();
    
    // Armazenar código
    this.codes.set(email, {
      code,
      expiresAt: Date.now() + (5 * 60 * 1000),
      attempts: 0
    });

    // Mostrar código na tela
    this.showCode(code);
    
    return { success: true, message: 'Código gerado!' };
  }

  // Mostrar código na tela
  showCode(code) {
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                  z-index: 9999; text-align: center; border: 2px solid #5865f2;">
        <h3 style="color: #5865f2; margin: 0 0 20px 0;">🔐 Código 2FA</h3>
        <div style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px; 
                    background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666; margin: 10px 0;">Expira em 5 minutos</p>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #5865f2; color: white; border: none; padding: 10px 20px; 
                       border-radius: 5px; cursor: pointer;">OK</button>
      </div>
    `;
    document.body.appendChild(popup);
  }

  // Verificar código
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
      return { success: false, error: 'Muitas tentativas' };
    }
    
    if (stored.code !== inputCode) {
      return { success: false, error: 'Código incorreto' };
    }
    
    this.codes.delete(email);
    return { success: true, message: 'Código verificado!' };
  }
}

window.simple2FA = new Simple2FA();