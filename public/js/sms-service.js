// 🎓 AULA: Serviço de SMS Real para 2FA

class SMSService {
  constructor() {
    // Configuração do Twilio (pago, mas confiável)
    this.accountSid = 'seu_account_sid';
    this.authToken = 'seu_auth_token';
    this.fromNumber = '+1234567890'; // Número Twilio
  }

  // ENVIAR SMS REAL
  async sendSMS(phoneNumber, code) {
    try {
      const message = `Seu código de verificação é: ${code}. Expira em 5 minutos.`;
      
      // Chamada para API do Twilio
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + this.accountSid + '/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(this.accountSid + ':' + this.authToken),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: this.fromNumber,
          To: phoneNumber,
          Body: message
        })
      });

      if (response.ok) {
        return { success: true, message: 'SMS enviado!' };
      } else {
        throw new Error('Falha na API');
      }
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      return { success: false, error: 'Falha no envio' };
    }
  }

  // VALIDAR NÚMERO DE TELEFONE
  validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }
}

// ALTERNATIVA GRATUITA: WhatsApp Business API
class WhatsAppService {
  constructor() {
    this.apiUrl = 'https://graph.facebook.com/v17.0/';
    this.accessToken = 'seu_whatsapp_token';
    this.phoneNumberId = 'seu_phone_number_id';
  }

  async sendWhatsApp(phoneNumber, code) {
    try {
      const message = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: 'verification_code',
          language: { code: 'pt_BR' },
          components: [{
            type: 'body',
            parameters: [{ type: 'text', text: code }]
          }]
        }
      };

      const response = await fetch(`${this.apiUrl}${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      return response.ok ? 
        { success: true, message: 'WhatsApp enviado!' } : 
        { success: false, error: 'Falha no envio' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}