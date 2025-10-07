// 🎓 AULA: Serviço de Email Real para 2FA

class EmailService {
  constructor() {
    // Configuração para NOREPLY@ANDREJUNIOR.COM
    this.fromEmail = 'noreply@andrejunior.com';
    this.fromName = 'André Junior - Segurança';
    this.serviceId = 'service_andrejunior';
    this.templateId = 'template_2fa_code';
    this.publicKey = 'sua_chave_emailjs';
  }

  // ENVIAR EMAIL REAL
  async sendEmail(email, code) {
    try {
      // Usando EmailJS (serviço gratuito)
      const templateParams = {
        to_email: email,
        from_email: 'noreply@andrejunior.com',
        from_name: 'André Junior - Segurança',
        verification_code: code,
        expires_in: '5 minutos',
        user_name: email.split('@')[0]
      };

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      return { success: true, message: 'Email enviado!' };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return { success: false, error: 'Falha no envio' };
    }
  }

  // TEMPLATE DO EMAIL
  getEmailTemplate(code) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #5865f2; margin: 0;">🔐 André Junior</h1>
          <p style="color: #666; margin: 5px 0;">Segurança da Conta</p>
        </div>
        
        <h2 style="color: #333;">Código de Verificação</h2>
        <p>Olá! Alguém tentou acessar sua conta. Use o código abaixo para continuar:</p>
        
        <div style="background: linear-gradient(135deg, #5865f2, #8ab4f8); color: white; padding: 25px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 30px 0; border-radius: 10px; box-shadow: 0 4px 15px rgba(88,101,242,0.3);">
          ${code}
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            ⚠️ <strong>Importante:</strong> Este código expira em <strong>5 minutos</strong>
          </p>
        </div>
        
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #0c5460;">
            🛡️ Se você não solicitou este código, ignore este email ou entre em contato conosco.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center; color: #666; font-size: 12px;">
          <p>Este email foi enviado automaticamente por <strong>noreply@andrejunior.com</strong></p>
          <p>Portfólio André Junior © 2025</p>
        </div>
      </div>
    `;
  }
}

// Para usar EMAIL real, substitua no two-factor.js:
/*
async sendCode(email, method = 'email') {
  const code = this.generateCode();
  
  if (method === 'email') {
    const emailService = new EmailService();
    const result = await emailService.sendEmail(email, code);
    
    if (result.success) {
      // Armazenar código
      this.codes.set(email, {
        code,
        expiresAt: Date.now() + (5 * 60 * 1000),
        attempts: 0
      });
      
      return { success: true, message: 'Código enviado para seu email!' };
    }
  }
  
  // Fallback para demo
  return this.showCodeInUI(code, method);
}
*/