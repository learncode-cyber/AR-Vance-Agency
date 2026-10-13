/**
 * AR Qudrix Corporate Branding Configuration System
 * 
 * This configuration system maintains consistent corporate attribution
 * across all AR Qudrix products and AR Vance Agency client projects.
 * 
 * Reference: AR Qudrix Corporate Product Branding System
 */

export type EntityType = 'product' | 'company' | 'brand' | 'client_project';

export interface CorporateBrandingConfig {
  // Product/Entity Information
  productName: string;
  entityType: EntityType;
  
  // Corporate Structure
  parentCompany: string;
  parentCompanyUrl: string;
  developerCompany: string;
  developerCompanyUrl: string;
  
  // Attribution Labels
  ownershipLabel: string;
  developmentLabel: string;
  
  // Current Year (auto-updated)
  currentYear: number;
  
  // Optional
  productUrl?: string;
  description?: string;
}

/**
 * Default AR Qudrix Product Configuration
 */
export const DEFAULT_AR_QUDRIX_PRODUCT: CorporateBrandingConfig = {
  productName: 'Automation Services Platform',
  entityType: 'product',
  
  parentCompany: 'AR Qudrix',
  parentCompanyUrl: 'https://arqudrix.com',
  
  developerCompany: 'AR Vance Agency',
  developerCompanyUrl: 'https://arvanceagency.com',
  
  ownershipLabel: 'A Product by',
  developmentLabel: 'Developed by',
  
  currentYear: new Date().getFullYear(),
};

/**
 * Generate attribution text based on entity type
 */
export function generateAttributionText(config: CorporateBrandingConfig): string {
  const year = config.currentYear;
  const productName = config.productName;
  
  switch (config.entityType) {
    case 'product':
      return `© ${year} ${productName}\n${config.ownershipLabel} ${config.parentCompany}\n${config.developmentLabel} ${config.developerCompany}`;
    
    case 'company':
      return `© ${year} ${productName}\nA Company by ${config.parentCompany}`;
    
    case 'brand':
      return `© ${year} ${productName}\nA Brand by ${config.parentCompany}`;
    
    case 'client_project':
      return `Designed & Developed by ${config.developerCompany}\nA Digital & Technology Company by ${config.parentCompany}`;
    
    default:
      return '';
  }
}

/**
 * Get current branding configuration
 */
export function getBrandingConfig(): CorporateBrandingConfig {
  return {
    ...DEFAULT_AR_QUDRIX_PRODUCT,
    currentYear: new Date().getFullYear(),
  };
}

/**
 * Validate branding configuration
 */
export function validateBrandingConfig(config: CorporateBrandingConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!config.productName?.trim()) errors.push('productName is required');
  if (!config.parentCompany?.trim()) errors.push('parentCompany is required');
  if (!config.parentCompanyUrl?.trim()) errors.push('parentCompanyUrl is required');
  if (!config.developerCompany?.trim()) errors.push('developerCompany is required');
  if (!config.developerCompanyUrl?.trim()) errors.push('developerCompanyUrl is required');
  
  try {
    new URL(config.parentCompanyUrl);
  } catch (e) {
    errors.push('parentCompanyUrl is not a valid URL');
  }
  
  try {
    new URL(config.developerCompanyUrl);
  } catch (e) {
    errors.push('developerCompanyUrl is not a valid URL');
  }
  
  const validEntityTypes: EntityType[] = ['product', 'company', 'brand', 'client_project'];
  if (!validEntityTypes.includes(config.entityType)) {
    errors.push(`entityType must be one of: ${validEntityTypes.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
