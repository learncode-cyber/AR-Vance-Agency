'use client'

import { useEffect, useState } from 'react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinedAt: string
}

interface Role {
  id: string
  name: string
  slug: string
  description: string
  permissions: string[]
}

export default function AdminTeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [membersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
      ])

      if (membersRes.ok) {
        const data = await membersRes.json()
        setMembers(data.data || [])
      }

      if (rolesRes.ok) {
        const data = await rolesRes.json()
        setRoles(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Team Management & Roles</h1>
        <button className="admin-btn admin-btn-primary">+ Invite Member</button>
      </div>

      <div className="admin-content">
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setActiveTab('members')}
            style={{
              padding: '0.75rem 1rem',
              background: activeTab === 'members' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'members' ? '#fff' : 'var(--text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderRadius: '4px 4px 0 0',
            }}
          >
            👥 Team Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            style={{
              padding: '0.75rem 1rem',
              background: activeTab === 'roles' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'roles' ? '#fff' : 'var(--text)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              borderRadius: '4px 4px 0 0',
            }}
          >
            🔑 Roles ({roles.length})
          </button>
        </div>

        {/* Team Members Tab */}
        {activeTab === 'members' && (
          <div className="admin-card">
            {loading ? (
              <p style={{ color: 'var(--muted)' }}>Loading...</p>
            ) : members.length === 0 ? (
              <p style={{ color: 'var(--muted)' }}>No team members yet</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="font-medium">{member.name}</td>
                      <td className="font-mono text-sm">{member.email}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                          }}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            color: member.status === 'active' ? '#10B981' : '#F59E0B',
                          }}
                        >
                          {member.status === 'active' ? '✓' : '⏳'} {member.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn admin-btn-secondary" style={{ fontSize: '0.8rem' }}>
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {roles.map((role) => (
              <div key={role.id} className="admin-card">
                <h4 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>{role.name}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                  {role.description}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>Permissions:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {role.permissions && role.permissions.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {role.permissions.slice(0, 3).map((perm) => (
                          <span
                            key={perm}
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              background: 'var(--primary)',
                              color: '#fff',
                              borderRadius: '3px',
                              fontSize: '0.75rem',
                            }}
                          >
                            {perm}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--muted)' }}>No permissions</p>
                    )}
                  </div>
                </div>

                <button className="admin-btn admin-btn-secondary" style={{ width: '100%' }}>
                  Edit Role
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="admin-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Role-Based Access Control</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Manage team members and assign roles with specific permissions:
          </p>
          <ul style={{ color: 'var(--muted)', paddingLeft: '1.5rem' }}>
            <li>
              <strong>Admin:</strong> Full access to all features
            </li>
            <li>
              <strong>Sub-Admin:</strong> Can manage team and content
            </li>
            <li>
              <strong>Editor:</strong> Can create and edit content
            </li>
            <li>
              <strong>Member:</strong> Can view and edit assigned content
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
