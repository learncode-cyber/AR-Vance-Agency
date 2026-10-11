"use client";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

const services: Service[] = [
  {
    id: "process-automation",
    title: "Process Automation",
    description: "Automate repetitive tasks and workflows to boost productivity and reduce manual errors.",
    icon: "⚙️",
    features: ["Workflow Optimization", "Task Automation", "Error Reduction"],
  },
  {
    id: "data-integration",
    title: "Data Integration",
    description: "Seamlessly integrate data across multiple systems and platforms.",
    icon: "🔗",
    features: ["Multi-Source Integration", "Real-time Sync", "Data Mapping"],
  },
  {
    id: "api-development",
    title: "API Development",
    description: "Custom API development and integration for your business needs.",
    icon: "🛠️",
    features: ["RESTful APIs", "Webhooks", "Rate Limiting"],
  },
  {
    id: "workflow-design",
    title: "Workflow Design",
    description: "Design and implement efficient workflows tailored to your organization.",
    icon: "📊",
    features: ["Custom Workflows", "Process Mapping", "Optimization"],
  },
  {
    id: "bot-development",
    title: "Bot Development",
    description: "Build intelligent bots for customer service, support, and automation.",
    icon: "🤖",
    features: ["Chatbots", "AI Integration", "24/7 Support"],
  },
  {
    id: "monitoring-analytics",
    title: "Monitoring & Analytics",
    description: "Real-time monitoring and analytics for your automated systems.",
    icon: "📈",
    features: ["Real-time Dashboards", "Performance Tracking", "Alerts"],
  },
];

interface ServicesGridProps {
  onBookService: (serviceId: string) => void;
}

export default function AutomationServicesGrid({
  onBookService,
}: ServicesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onBook={() => onBookService(service.id)}
        />
      ))}
    </div>
  );
}

function ServiceCard({
  service,
  onBook,
}: {
  service: Service;
  onBook: () => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      {/* Card Header with Icon */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 text-center">
        <div className="text-5xl mb-4">{service.icon}</div>
        <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Features List */}
        <ul className="space-y-2 mb-6">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-blue-600">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onBook}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Book Service
          </button>
          <button
            className="w-full text-blue-600 font-semibold py-2 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Learn More →
          </button>
        </div>
      </div>
    </div>
  );
}
