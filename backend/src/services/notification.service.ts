import * as brevo from '@getbrevo/brevo';
import twilio from 'twilio';

// Configuration de Brevo (anciennement Sendinblue)
const brevoApi = new brevo.TransactionalEmailsApi();
brevoApi.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ''
);

// Configuration de Twilio pour les SMS (lazy initialization)
let twilioClient: ReturnType<typeof twilio> | null = null;

const getTwilioClient = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    // Only initialize if credentials are properly configured
    if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }
  return twilioClient;
};

export const envoyerEmail = async (destinataire: string, sujet: string, texte: string) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Opina',
      email: process.env.BREVO_SENDER_EMAIL || ''
    };
    sendSmtpEmail.to = [{ email: destinataire }];
    sendSmtpEmail.subject = sujet;
    sendSmtpEmail.textContent = texte;
    sendSmtpEmail.htmlContent = `<p>${texte.replace(/\n/g, '<br>')}</p>`;

    await brevoApi.sendTransacEmail(sendSmtpEmail);
    console.log('Email envoyé avec succès à:', destinataire);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

export const envoyerSMS = async (destinataire: string, message: string) => {
  try {
    const client = getTwilioClient();
    if (!client) {
      throw new Error('Twilio n\'est pas configuré. Veuillez configurer TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN dans .env');
    }
    
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: destinataire
    });
    console.log('SMS envoyé avec succès à:', destinataire);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    throw error;
  }
};
