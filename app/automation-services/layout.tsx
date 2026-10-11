import CorporateFooter from "@/components/layout/corporate-footer";

export default function AutomationServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <CorporateFooter />
    </div>
  );
}
