import { logger } from '../logging';

interface VerificationToken {
  token: string;
  affiliateId: string;
  email: string;
  expiresAt: Date;
  verified: boolean;
}

export class EmailVerificationService {
  private static tokens = new Map<string, VerificationToken>();

  static async generateVerificationToken(
    affiliateId: string,
    email: string
  ): Promise<string | null> {
    try {
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const verificationToken: VerificationToken = {
        token,
        affiliateId,
        email,
        expiresAt,
        verified: false,
      };

      this.tokens.set(token, verificationToken);
      logger.info('Verification token generated', 'EmailVerificationService', { email });
      return token;
    } catch (error) {
      logger.error('Failed to generate verification token', error, 'EmailVerificationService');
      return null;
    }
  }

  static async verifyToken(token: string): Promise<boolean> {
    try {
      const verToken = this.tokens.get(token);
      if (!verToken) return false;

      if (new Date() > verToken.expiresAt) {
        logger.warning('Token expired', 'EmailVerificationService', { token });
        return false;
      }

      verToken.verified = true;
      logger.info('Email verified', 'EmailVerificationService', { email: verToken.email });
      return true;
    } catch (error) {
      logger.error('Failed to verify token', error, 'EmailVerificationService');
      return false;
    }
  }

  static async sendVerificationEmail(
    email: string,
    verificationLink: string
  ): Promise<boolean> {
    try {
      logger.info('Verification email sent', 'EmailVerificationService', { email });
      // In production, this would use actual email service
      return true;
    } catch (error) {
      logger.error('Failed to send verification email', error, 'EmailVerificationService');
      return false;
    }
  }

  private static generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
