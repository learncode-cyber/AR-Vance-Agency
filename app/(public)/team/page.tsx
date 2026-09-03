'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSettings } from '@/lib/settings'

interface TeamMember {
  id: string
  slug: string
  name: string
  role: string
  shortBio: string
  avatar: string
  emoji: string
  specialization: string
  linkedin: string
  twitter: string
  website: string
  featured: boolean
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, settingsData] = await Promise.all([
          fetch('/api/team?limit=100'),
          getSettings(),
        ])

        const teamData = await teamRes.json()
        setMembers(teamData.data || [])
        setSettings(settingsData)
      } catch (error) {
        console.error('Failed to load team:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Loading team...</div>
      </div>
    )
  }

  return (
    <main className="section-py">
      {/* Page Header */}
      <section className="container mb-12 text-center">
        <div className="page-banner-title">Meet Our Team</div>
        <p className="text-muted max-w-2xl mx-auto mt-4">
          Talented professionals dedicated to delivering exceptional results for every project.
        </p>
      </section>

      {/* Team Grid */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <Link key={member.id} href={`/team/${member.slug}`}>
              <div className="team-card group">
                {/* Card Header */}
                <div className="team-card__header">
                  <div className="team-card__avatar">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-4xl flex items-center justify-center">{member.emoji}</div>
                    )}
                  </div>
                  {member.featured && (
                    <div className="team-card__featured">⭐</div>
                  )}
                </div>

                {/* Card Body */}
                <div className="team-card__body">
                  <h3 className="team-card__name">{member.name}</h3>
                  <p className="team-card__role">{member.role}</p>
                  
                  {member.specialization && (
                    <p className="team-card__spec">{member.specialization}</p>
                  )}

                  {member.shortBio && (
                    <p className="team-card__bio">{member.shortBio}</p>
                  )}

                  {/* Social Links */}
                  {(member.linkedin || member.twitter || member.website) && (
                    <div className="team-card__socials">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="team-card__social-link"
                          title="LinkedIn"
                          onClick={(e) => e.preventDefault()}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M16.5 3c1.38 0 2.5 1.12 2.5 2.5v8c0 1.38-1.12 2.5-2.5 2.5h-13C2.12 16 1 14.88 1 13.5v-8C1 4.12 2.12 3 3.5 3h13zm-.9 7.8v3.4h-2.1V10.6c0-.92-.3-1.54-1.1-1.54-.6 0-.95.4-1.1.8-.06.13-.06.31-.06.49v3.6h-2.1V7.2h2.1v.62h-.03c.3-.46.94-1.12 2.29-1.12 1.67 0 2.93 1.09 2.93 3.43zM4.2 6.1c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z" />
                          </svg>
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="team-card__social-link"
                          title="Twitter"
                          onClick={(e) => e.preventDefault()}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M19.45 4.26c-.73.33-1.52.55-2.36.65.85-.5 1.5-1.29 1.81-2.24-.8.47-1.69.81-2.63.99-.75-.8-1.82-1.3-3-1.3-2.27 0-4.1 1.83-4.1 4.1 0 .32.04.64.12.95-3.41-.17-6.43-1.8-8.46-4.28-.35.61-.56 1.32-.56 2.08 0 1.42.73 2.68 1.83 3.42-.68-.02-1.32-.2-1.88-.51v.05c0 1.98 1.41 3.64 3.29 4.02-.34.09-.71.14-1.08.14-.26 0-.53-.02-.78-.08.53 1.65 2.06 2.85 3.88 2.88-1.4 1.1-3.16 1.75-5.08 1.75-.33 0-.66-.02-.98-.07 1.83 1.17 4 1.85 6.33 1.85 7.59 0 11.73-6.29 11.73-11.73 0-.18 0-.35-.01-.52.8-.58 1.51-1.31 2.07-2.14z" />
                          </svg>
                        </a>
                      )}
                      {member.website && (
                        <a
                          href={member.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="team-card__social-link"
                          title="Website"
                          onClick={(e) => e.preventDefault()}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="team-card__cta">
                    View Profile →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">No team members found.</p>
          </div>
        )}
      </section>
    </main>
  )
}
