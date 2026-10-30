export default function Footer() {
  const disableAgencyBranding = process.env.NEXT_PUBLIC_DISABLE_AGENCY_BRANDING === "true";

  if (disableAgencyBranding) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-white mb-4">AR Vance Agency</h3>
            <p className="text-sm text-gray-400">
              A Digital & Technology Company by AR Qudrix
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://arvanceagency.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  AR Vance Agency
                </a>
              </li>
              <li>
                <a
                  href="https://arqudrix.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  AR Qudrix
                </a>
              </li>
            </ul>
          </div>

          {/* Attribution */}
          <div>
            <h3 className="font-bold text-white mb-4">Designed & Developed</h3>
            <p className="text-sm text-gray-400">
              <a
                href="https://arvanceagency.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                AR Vance Agency
              </a>
              {" • A Digital & Technology Company by "}
              <a
                href="https://arqudrix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                AR Qudrix
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-sm text-gray-400 text-center">
          <p>
            &copy; {new Date().getFullYear()} AR Vance Agency. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
