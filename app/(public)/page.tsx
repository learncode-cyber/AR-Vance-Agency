import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { getActiveTestimonials } from '@/lib/data';

export default async function HomePage() {
  const testimonials = await getActiveTestimonials()
  const agents = [
    { name: 'Lead Intelligence', desc: 'Smart lead scoring & qualification' },
    { name: 'Prospecting Agent', desc: 'Automated prospect research' },
    { name: 'SEO Intelligence', desc: 'Search optimization analysis' },
    { name: 'Content Generation', desc: 'AI-powered content creation' },
    { name: 'Sales Assistant', desc: 'Sales call preparation' },
    { name: 'Analytics Intelligence', desc: 'Data-driven insights' },
  ];

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold text-navy-900 dark:text-white mb-6 leading-tight">
                Premium AI-Powered Agency Platform
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Automate your entire agency workflow with 24 intelligent AI agents. Lead scoring, client management, content generation, and more—all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact"><Button size="lg">Get Started</Button></Link>
                <Link href="/services"><Button variant="secondary" size="lg">Learn More</Button></Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-navy-900 dark:text-white mb-16">
              24 Intelligent AI Agents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent, idx) => (
                <Card key={idx}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-navy-900 dark:text-white mb-2">
                        {agent.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {agent.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-navy-50 dark:bg-slate-900 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gold-500 mb-2">24</div>
                <p className="text-slate-600 dark:text-slate-400">AI Agents</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gold-500 mb-2">60+</div>
                <p className="text-slate-600 dark:text-slate-400">Database Models</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gold-500 mb-2">240+</div>
                <p className="text-slate-600 dark:text-slate-400">API Routes</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gold-500 mb-2">100%</div>
                <p className="text-slate-600 dark:text-slate-400">Type Safe</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-navy-900 dark:text-white mb-16">
              Premium Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <h3 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">Lead Management</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Intelligent lead scoring, qualification, and automated follow-ups with AI-powered insights.
                </p>
                <Link href="/services" className="text-gold-500 font-medium hover:text-gold-600 transition">
                  Learn more →
                </Link>
              </Card>
              <Card>
                <h3 className="text-2xl font-bold text-navy-900 dark:text-white mb-4">Content Creation</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Generate high-quality marketing content, blog posts, and campaigns with AI agents.
                </p>
                <Link href="/services" className="text-gold-500 font-medium hover:text-gold-600 transition">
                  Learn more →
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials (trust signal, ahead of the final CTA) */}
        {testimonials.length > 0 && (
          <section className="bg-navy-50 dark:bg-slate-900 py-20 md:py-32">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center text-navy-900 dark:text-white mb-16">
                What Our Clients Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.slice(0, 3).map((t) => (
                  <Card key={t.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-navy-900 font-bold">
                        {t.initials}
                      </div>
                      <div>
                        <div className="font-bold text-navy-900 dark:text-white">{t.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{t.role}</div>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">&ldquo;{t.text}&rdquo;</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-navy-900 to-navy-700 py-20 md:py-32 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Agency?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Get started with AR Vance Agency OS today and automate your entire workflow.
            </p>
            {/* NOTE: "Start Free Trial" copy kept as-is (not my call to
                rewrite marketing language), but this app has no self-serve
                signup/trial system anywhere — it's a lead-gen agency site.
                Routed to /contact (the real conversion path) so it's at
                least functional; whether the copy itself should change is
                a content decision for the site owner. */}
            <Link href="/contact">
              <Button size="lg" className="bg-gold-500 text-navy-900 hover:bg-gold-600">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
