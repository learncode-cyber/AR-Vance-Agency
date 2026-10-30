"use client";

import { useState, useRef } from "react";
import FileUploadComponent from "./file-upload";

interface ApplicationFormData {
  companyLegalName: string;
  registrationNumber: string;
  websiteUrl: string;
  authorizedRepName: string;
  contactEmail: string;
  contactPhone: string;
  idFile: File | null;
  agreementConsent: boolean;
}

export default function CompanyApplicationPortal() {
  const [formData, setFormData] = useState<ApplicationFormData>({
    companyLegalName: "",
    registrationNumber: "",
    websiteUrl: "",
    authorizedRepName: "",
    contactEmail: "",
    contactPhone: "",
    idFile: null,
    agreementConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyLegalName?.trim())
      newErrors.companyLegalName = "Company legal name required";
    if (!formData.registrationNumber?.trim())
      newErrors.registrationNumber = "Registration number required";
    if (!formData.authorizedRepName?.trim())
      newErrors.authorizedRepName = "Authorized representative name required";
    if (!formData.contactEmail?.trim()) newErrors.contactEmail = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail))
      newErrors.contactEmail = "Invalid email format";
    if (!formData.contactPhone?.trim())
      newErrors.contactPhone = "Phone number required";
    if (!formData.idFile) newErrors.idFile = "ID verification file required";
    if (!formData.agreementConsent)
      newErrors.agreementConsent = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData({ ...formData, idFile: file });
    if (errors.idFile) {
      setErrors({ ...errors, idFile: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("companyLegalName", formData.companyLegalName);
      formDataToSend.append("registrationNumber", formData.registrationNumber);
      formDataToSend.append("websiteUrl", formData.websiteUrl || "");
      formDataToSend.append("authorizedRepName", formData.authorizedRepName);
      formDataToSend.append("contactEmail", formData.contactEmail);
      formDataToSend.append("contactPhone", formData.contactPhone);
      if (formData.idFile) {
        formDataToSend.append("idFile", formData.idFile);
      }

      // Track with GA4
      if (window.gtag) {
        window.gtag("event", "company_application_submit", {
          company_name: formData.companyLegalName,
        });
      }

      // Track with Meta Pixel
      if (window.fbq) {
        window.fbq("track", "Lead", {
          value: "company_application",
        });
      }

      const response = await fetch("/api/company/apply", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Application submission failed");

      setSuccess(true);
      setFormData({
        companyLegalName: "",
        registrationNumber: "",
        websiteUrl: "",
        authorizedRepName: "",
        contactEmail: "",
        contactPhone: "",
        idFile: null,
        agreementConsent: false,
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-2 text-gray-900">
        Company Application Portal
      </h2>
      <p className="text-gray-600 mb-6">
        Submit your company information for verification and onboarding.
      </p>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900">✅ Application Submitted!</h3>
          <p className="text-green-800 text-sm">
            Thank you for applying. We'll review your application and contact you within 48 hours.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900">⚠️ Error</h3>
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Legal Information Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Legal Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Company Legal Name *
              </label>
              <input
                type="text"
                name="companyLegalName"
                value={formData.companyLegalName}
                onChange={handleChange}
                placeholder="Your Company Legal Name"
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                  errors.companyLegalName
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.companyLegalName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.companyLegalName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Registration / Trade License Number *
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="ABC123456789"
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                  errors.registrationNumber
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.registrationNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.registrationNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Website URL
              </label>
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Authorized Representative Name *
              </label>
              <input
                type="text"
                name="authorizedRepName"
                value={formData.authorizedRepName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                  errors.authorizedRepName
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.authorizedRepName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.authorizedRepName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="john@company.com"
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                  errors.contactEmail ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactEmail}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                  errors.contactPhone ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.contactPhone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ID Verification Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ID Verification
          </h3>
          <FileUploadComponent
            onFileChange={handleFileChange}
            error={errors.idFile}
          />
        </div>

        {/* Agreement */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreementConsent"
              checked={formData.agreementConsent}
              onChange={handleChange}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              I agree to the terms and conditions and authorize AR Vance to verify
              the submitted information *
            </span>
          </label>
          {errors.agreementConsent && (
            <p className="text-red-500 text-sm mt-1">{errors.agreementConsent}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Submitting...
            </span>
          ) : (
            "Submit Application"
          )}
        </button>
      </form>
    </div>
  );
}
