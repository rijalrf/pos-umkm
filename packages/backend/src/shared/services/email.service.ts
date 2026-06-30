import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.util';

export class EmailService {
  private transporter;

  constructor() {
    const host = process.env.EMAIL_SMTP_HOST || 'smtp.mailtrap.io';
    const port = parseInt(process.env.EMAIL_SMTP_PORT || '2525', 10);
    const user = process.env.EMAIL_SMTP_USER || '';
    const pass = process.env.EMAIL_SMTP_PASS || '';

    const auth = user && pass ? { user, pass } : undefined;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendVerificationEmail(to: string, name: string, token: string) {
    const from = process.env.EMAIL_FROM || 'noreply@pos-umkm.com';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"MarketNest Support" <${from}>`,
      to,
      subject: 'Verifikasi Akun Pelanggan MarketNest',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E7E5E4; border-radius: 8px; background-color: #FFFBF5;">
          <h2 style="color: #C2410C; text-align: center;">Selamat Datang di MarketNest!</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Terima kasih telah mendaftar sebagai pelanggan member di MarketNest. Silakan verifikasi akun email Anda dengan mengklik tombol di bawah ini:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #C2410C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verifikasi Email Saya</a>
          </div>
          <p style="font-size: 12px; color: #57534E;">Atau salin tautan berikut ke browser Anda:</p>
          <p style="font-size: 12px; word-break: break-all; color: #C2410C;"><a href="${verificationUrl}">${verificationUrl}</a></p>
          <div style="margin-top: 30px; border-top: 1px solid #E7E5E4; padding-top: 20px; font-size: 12px; color: #8C8A87; text-align: center;">
            &copy; 2026 MarketNest. Semua hak dilindungi.
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent successfully: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw error;
    }
  }
}
