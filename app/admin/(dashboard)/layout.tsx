import { requireAdmin } from '@/lib/auth-server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()

  return (
    <div className="admin-layout" data-theme="dark">
      <AdminSidebar userName={user.fullName} />
      <div className="admin-main">
        {children}
      </div>
    </div>
  )
}
