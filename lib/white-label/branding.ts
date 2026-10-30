import { logger } from '../logging';

interface BrandingData {
  tenantId: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  brandName: string;
  tagline?: string;
  fontFamily: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BrandingService {
  private static brandings = new Map<string, BrandingData>();

  static async createBranding(data: Omit<BrandingData, 'createdAt' | 'updatedAt'>): Promise<BrandingData | null> {
    try {
      const branding: BrandingData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.brandings.set(data.tenantId, branding);
      logger.info('Branding created', 'BrandingService', { tenantId: data.tenantId });
      return branding;
    } catch (error) {
      logger.error('Failed to create branding', error, 'BrandingService');
      return null;
    }
  }

  static async getBranding(tenantId: string): Promise<BrandingData | null> {
    try {
      return this.brandings.get(tenantId) || null;
    } catch (error) {
      logger.error('Failed to get branding', error, 'BrandingService');
      return null;
    }
  }

  static async updateBranding(tenantId: string, data: Partial<BrandingData>): Promise<boolean> {
    try {
      const existing = this.brandings.get(tenantId);
      if (!existing) return false;

      const updated = {
        ...existing,
        ...data,
        tenantId, // Don't allow changing tenant ID
        createdAt: existing.createdAt, // Don't change creation date
        updatedAt: new Date(),
      };

      this.brandings.set(tenantId, updated);
      logger.info('Branding updated', 'BrandingService', { tenantId });
      return true;
    } catch (error) {
      logger.error('Failed to update branding', error, 'BrandingService');
      return false;
    }
  }

  static getCSSVariables(branding: BrandingData): string {
    return `
      :root {
        --brand-primary: ${branding.primaryColor};
        --brand-secondary: ${branding.secondaryColor};
        --brand-font: ${branding.fontFamily};
        --brand-name: "${branding.brandName}";
      }
    `;
  }
}
