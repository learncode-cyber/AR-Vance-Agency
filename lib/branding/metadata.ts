/**
 * AR Qudrix Corporate Metadata & Schema
 * 
 * SEO and semantic markup for corporate branding
 */

import { getBrandingConfig } from "./corporate-config";

export function getCorprateBrandingMetadata() {
  const config = getBrandingConfig();
  
  return {
    author: `${config.developerCompany} - A Digital & Technology Company by ${config.parentCompany}`,
    creator: config.developerCompany,
    publisher: config.parentCompany,
    description: `${config.productName} - ${config.ownershipLabel} ${config.parentCompany}`,
  };
}

export function getCorporateBrandingSchema() {
  const config = getBrandingConfig();
  
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: config.productName,
    creator: {
      "@type": "Organization",
      name: config.parentCompany,
      url: config.parentCompanyUrl,
    },
    author: {
      "@type": "Organization",
      name: config.developerCompany,
      url: config.developerCompanyUrl,
    },
    publisher: {
      "@type": "Organization",
      name: config.parentCompany,
      url: config.parentCompanyUrl,
    },
  };
}
