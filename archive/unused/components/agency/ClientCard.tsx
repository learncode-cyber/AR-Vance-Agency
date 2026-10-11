'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin } from 'lucide-react'

interface ClientCardProps {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  logo?: string
  city?: string
  country?: string
  totalSpent: number
  projectCount: number
  status: 'active' | 'inactive' | 'archived'
}

export function ClientCard({
  id,
  name,
  email,
  phone,
  company,
  logo,
  city,
  country,
  totalSpent,
  projectCount,
  status
}: ClientCardProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    archived: 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {logo ? (
            <Image
              src={logo}
              alt={company || name}
              width={48}
              height={48}
              className="rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900">{name}</h3>
            {company && <p className="text-sm text-gray-600">{company}</p>}
          </div>
        </div>
        <Badge className={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={16} />
          <a href={`mailto:${email}`} className="hover:text-blue-600">
            {email}
          </a>
        </div>
        {phone && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} />
            <a href={`tel:${phone}`} className="hover:text-blue-600">
              {phone}
            </a>
          </div>
        )}
        {(city || country) && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} />
            <span>
              {city}{city && country ? ', ' : ''}{country}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b">
        <div>
          <p className="text-xs text-gray-500">Total Spent</p>
          <p className="font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Projects</p>
          <p className="font-bold text-gray-900">{projectCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/admin/agency/clients/${id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
        <Button variant="outline" size="icon">
          ✎
        </Button>
      </div>
    </div>
  )
}
