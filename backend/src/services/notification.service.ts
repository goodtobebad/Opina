import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

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
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: destinataire,
      subject: sujet,
      text: texte
    });
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
