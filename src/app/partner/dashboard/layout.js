export const metadata = {
  title: 'Partner Dashboard | GRD',
  description: 'Partner dashboard for managing customer reports and viewing assigned units in the GRD system.',
}

export default function PartnerDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {children}
    </div>
  );
} 