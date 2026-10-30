import { logger } from '../logging';

interface ThemeData {
  tenantId: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  isDarkMode: boolean;
  isDefault: boolean;
  createdAt: Date;
}

export class ThemeService {
  private static themes = new Map<string, ThemeData[]>();

  static async createTheme(data: Omit<ThemeData, 'createdAt'>): Promise<ThemeData | null> {
    try {
      const theme: ThemeData = {
        ...data,
        createdAt: new Date(),
      };

      const tenantThemes = this.themes.get(data.tenantId) || [];
      tenantThemes.push(theme);
      this.themes.set(data.tenantId, tenantThemes);

      logger.info('Theme created', 'ThemeService', { tenantId: data.tenantId, name: data.name });
      return theme;
    } catch (error) {
      logger.error('Failed to create theme', error, 'ThemeService');
      return null;
    }
  }

  static async getTheme(tenantId: string, themeName: string): Promise<ThemeData | null> {
    try {
      const themes = this.themes.get(tenantId) || [];
      return themes.find(t => t.name === themeName) || null;
    } catch (error) {
      logger.error('Failed to get theme', error, 'ThemeService');
      return null;
    }
  }

  static async getThemes(tenantId: string): Promise<ThemeData[]> {
    try {
      return this.themes.get(tenantId) || [];
    } catch (error) {
      logger.error('Failed to get themes', error, 'ThemeService');
      return [];
    }
  }

  static generateCSS(theme: ThemeData): string {
    return `
      :root {
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-success: ${theme.colors.success};
        --color-error: ${theme.colors.error};
        --color-warning: ${theme.colors.warning};
        --font-heading: ${theme.fonts.heading};
        --font-body: ${theme.fonts.body};
      }
      
      ${theme.isDarkMode ? `
        body {
          background: #1a1a1a;
          color: #ffffff;
        }
      ` : ''}
    `;
  }
}
