"use client";

import { getBrandingConfig } from "@/lib/branding/corporate-config";

export default function CorporateFooter() {
  const config = getBrandingConfig();
  const disableBranding = process.env.NEXT_PUBLIC_DISABLE_AGENCY_BRANDING === "true";

  if (disableBranding) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Product Info */}
          <div>
            <h3 className="font-bold text-white mb-4">{config.productName}</h3>
            <p className="text-sm text-gray-400">
              {config.ownershipLabel} {config.parentCompany}
            </p>
          </div>

          {/* Corporate Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Corporate</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={config.parentCompanyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  {config.parentCompany}
                </a>
              </li>
              <li>
                <a
                  href={config.developerCompanyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
                >
                  {config.developerCompany}
                </a>
              </li>
            </ul>
          </div>

          {/* Attribution */}
          <div>
            <h3 className="font-bold text-white mb-4">Attribution</h3>
            <p className="text-sm text-gray-400">
              © {config.currentYear} {config.productName}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {config.ownershipLabel} {config.parentCompany}
              {config.developmentLabel && (
                <>
                  <br />
                  {config.developmentLabel} {config.developerCompany}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Copyright Line */}
        <div className="border-t border-gray-800 pt-8 text-sm text-gray-400 text-center">
          <p>
            © {config.currentYear} {config.productName}
            {" • "}
            <a
              href={config.parentCompanyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              {config.parentCompany}
            </a>
            {" • "}
            <a
              href={config.developerCompanyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              {config.developerCompany}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
