import { logger } from '../logging';

interface CustomCodeData {
  tenantId: string;
  type: 'css' | 'javascript' | 'html';
  code: string;
  version: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CustomCodeService {
  private static codeStore = new Map<string, CustomCodeData>();

  static async saveCode(data: Omit<CustomCodeData, 'version' | 'createdAt' | 'updatedAt'>): Promise<CustomCodeData | null> {
    try {
      const existing = this.codeStore.get(`${data.tenantId}-${data.type}`);
      const version = (existing?.version || 0) + 1;

      const customCode: CustomCodeData = {
        ...data,
        version,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      this.codeStore.set(`${data.tenantId}-${data.type}`, customCode);
      logger.info('Custom code saved', 'CustomCodeService', { tenantId: data.tenantId, type: data.type });
      return customCode;
    } catch (error) {
      logger.error('Failed to save custom code', error, 'CustomCodeService');
      return null;
    }
  }

  static async getCode(tenantId: string, type: 'css' | 'javascript' | 'html'): Promise<CustomCodeData | null> {
    try {
      return this.codeStore.get(`${tenantId}-${type}`) || null;
    } catch (error) {
      logger.error('Failed to get custom code', error, 'CustomCodeService');
      return null;
    }
  }

  static async validateCode(code: string, type: string): Promise<boolean> {
    try {
      // Basic validation
      if (!code || code.length === 0) return false;
      if (code.length > 50000) return false; // Max 50KB

      // Type-specific validation
      if (type === 'javascript' && code.includes('eval')) return false;

      return true;
    } catch (error) {
      logger.error('Code validation failed', error, 'CustomCodeService');
      return false;
    }
  }

  static injectCode(html: string, css: CustomCodeData | null, js: CustomCodeData | null): string {
    let result = html;

    if (css?.enabled) {
      result = result.replace('</head>', `<style>${css.code}</style></head>`);
    }

    if (js?.enabled) {
      result = result.replace('</body>', `<script>${js.code}</script></body>`);
    }

    return result;
  }
}
