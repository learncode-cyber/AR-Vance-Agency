'use client'

import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'

interface TeamMember {
  slug: string
  name: string
  role: string
  bio: string
  avatar: string
  coverImage: string
  emoji: string
  specialization: string
  experience: string
  skills: string[]
  achievements: string
  linkedin: string
  twitter: string
  website: string
  phone: string
  seoTitle: string
  seoDesc: string
}

export default function TeamMemberPage() {
  const params = useParams()
  const slug = params.slug as string
  const [member, setMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`/api/team/${slug}`)
        if (!res.ok) {
          notFound()
        }
        const data = await res.json()
        setMember(data)
      } catch (error) {
        console.error('Failed to load team member:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted">Loading profile...</div>
      </div>
    )
  }

  if (!member) {
    notFound()
  }

  return (
    <main>
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary/20 to-accent/20 overflow-hidden">
        {member.coverImage ? (
          <img src={member.coverImage} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent opacity-10" />
        )}
      </div>

      {/* Main Content */}
      <div className="container relative -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="team-profile-card">
              {/* Avatar */}
              <div className="team-profile-avatar">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-7xl flex items-center justify-center">{member.emoji}</div>
                )}
              </div>

              {/* Info */}
              <div className="team-profile-info">
                <h1 className="team-profile-name">{member.name}</h1>
                <p className="team-profile-role">{member.role}</p>

                {member.specialization && (
                  <p className="team-profile-spec">{member.specialization}</p>
                )}

                {member.experience && (
                  <div className="team-profile-exp">
                    <span className="text-sm text-muted">Experience:</span>
                    <span className="text-sm font-medium">{member.experience}</span>
                  </div>
                )}

                {/* Social Links */}
                {(member.linkedin || member.twitter || member.website) && (
                  <div className="team-profile-socials">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="team-social-btn"
                        title="LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.5 3c1.38 0 2.5 1.12 2.5 2.5v8c0 1.38-1.12 2.5-2.5 2.5h-13C2.12 16 1 14.88 1 13.5v-8C1 4.12 2.12 3 3.5 3h13zm-.9 7.8v3.4h-2.1V10.6c0-.92-.3-1.54-1.1-1.54-.6 0-.95.4-1.1.8-.06.13-.06.31-.06.49v3.6h-2.1V7.2h2.1v.62h-.03c.3-.46.94-1.12 2.29-1.12 1.67 0 2.93 1.09 2.93 3.43zM4.2 6.1c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z" />
                        </svg>
                      </a>
                    )}
                    {member.twitter && (
                      <a
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="team-social-btn"
                        title="Twitter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M19.45 4.26c-.73.33-1.52.55-2.36.65.85-.5 1.5-1.29 1.81-2.24-.8.47-1.69.81-2.63.99-.75-.8-1.82-1.3-3-1.3-2.27 0-4.1 1.83-4.1 4.1 0 .32.04.64.12.95-3.41-.17-6.43-1.8-8.46-4.28-.35.61-.56 1.32-.56 2.08 0 1.42.73 2.68 1.83 3.42-.68-.02-1.32-.2-1.88-.51v.05c0 1.98 1.41 3.64 3.29 4.02-.34.09-.71.14-1.08.14-.26 0-.53-.02-.78-.08.53 1.65 2.06 2.85 3.88 2.88-1.4 1.1-3.16 1.75-5.08 1.75-.33 0-.66-.02-.98-.07 1.83 1.17 4 1.85 6.33 1.85 7.59 0 11.73-6.29 11.73-11.73 0-.18 0-.35-.01-.52.8-.58 1.51-1.31 2.07-2.14z" />
                        </svg>
                      </a>
                    )}
                    {member.website && (
                      <a
                        href={member.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="team-social-btn"
                        title="Website"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                {/* Contact Button */}
                <a href="/contact" className="team-profile-cta">
                  Get In Touch
                </a>
              </div>

              {/* Skills */}
              {member.skills && member.skills.length > 0 && (
                <div className="team-profile-section">
                  <h3 className="team-profile-section-title">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, idx) => (
                      <span key={idx} className="team-skill-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back Link */}
            <Link href="/team" className="mt-6 inline-flex items-center gap-2 text-primary hover:text-primary-mid transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Team
            </Link>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Section */}
            {member.bio && (
              <section className="team-profile-section">
                <h2 className="team-profile-section-title">About</h2>
                <div className="team-profile-bio">
                  {member.bio}
                </div>
              </section>
            )}

            {/* Achievements Section */}
            {member.achievements && (
              <section className="team-profile-section">
                <h2 className="team-profile-section-title">Achievements</h2>
                <div
                  className="team-profile-achievements"
                  dangerouslySetInnerHTML={{ __html: member.achievements }}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
