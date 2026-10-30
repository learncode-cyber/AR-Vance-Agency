import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { organizationSchema, websiteSchema, jsonLdScriptProps } from '@/lib/seo/schema'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [orgSchema, siteSchema] = await Promise.all([organizationSchema(), websiteSchema()])

  return (
    <>
      <script {...jsonLdScriptProps(orgSchema)} />
      <script {...jsonLdScriptProps(siteSchema)} />
      <Navbar />
      <div style={{ paddingTop: '64px' }}>{children}</div>
      <Footer />
    </>
  )
}
