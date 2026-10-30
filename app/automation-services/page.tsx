"use client";

import { useState, useRef } from "react";
import AutomationServicesGrid from "@/components/automation-services/services-grid";
import ServiceBookingForm from "@/components/automation-services/booking-form";
import CompanyApplicationPortal from "@/components/automation-services/company-application";

export default function AutomationServicesPage() {
  const bookingFormRef = useRef<HTMLDivElement>(null);
  const applicationPortalRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<string>("");
  const [showApplicationPortal, setShowApplicationPortal] = useState(false);

  const scrollToBooking = (serviceId: string) => {
    setSelectedService(serviceId);
    bookingFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToApplication = () => {
    setShowApplicationPortal(true);
    applicationPortalRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Automation Services by AR Vance
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-blue-100">
            Transform your business with cutting-edge automation solutions. Streamline operations, reduce costs, and scale effortlessly.
          </p>
          <button
            onClick={scrollToApplication}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors text-lg"
          >
            🚀 Join Now
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-900">
          Our Services
        </h2>
        <AutomationServicesGrid onBookService={scrollToBooking} />
      </section>

      {/* Booking Form */}
      <section
        ref={bookingFormRef}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 w-full"
      >
        <div className="max-w-3xl mx-auto">
          <ServiceBookingForm selectedService={selectedService} />
        </div>
      </section>

      {/* Company Application Portal */}
      {showApplicationPortal && (
        <section
          ref={applicationPortalRef}
          className="py-16 px-4 sm:px-6 lg:px-8 bg-white w-full"
        >
          <div className="max-w-3xl mx-auto">
            <CompanyApplicationPortal />
          </div>
        </section>
      )}

      {/* Floating Join Now Button */}
      {!showApplicationPortal && (
        <div className="fixed bottom-8 right-8 z-40">
          <button
            onClick={scrollToApplication}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            ✨ Join Now
          </button>
        </div>
      )}
    </>
  );
}
