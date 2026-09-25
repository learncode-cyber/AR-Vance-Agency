'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Calendar } from 'lucide-react'

interface ProjectCardProps {
  id: string
  title: string
  slug: string
  description: string
  status: 'proposal' | 'active' | 'completed' | 'archived'
  image?: string
  client?: { name: string; logo?: string }
  technologies?: string[]
  budget?: number
  actualCost?: number
  startDate?: string
  endDate?: string
}

export function ProjectCard({
  id,
  title,
  slug,
  description,
  status,
  image,
  client,
  technologies = [],
  budget = 0,
  actualCost = 0,
  startDate,
  endDate,
}: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    proposal: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  }

  const profitability = budget - actualCost
  const profitabilityPercent = budget > 0 ? (profitability / budget) * 100 : 0

  return (
    <Link href={`/admin/agency/projects/${slug}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Image */}
        {image && (
          <div className="relative h-48 w-full bg-gray-200 overflow-hidden group">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex-1">{title}</h3>
            <Badge className={statusColors[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>

          {/* Client */}
          {client && (
            <div className="flex items-center gap-2 mb-3">
              {client.logo && (
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={24}
                  height={24}
                  className="rounded"
                />
              )}
              <span className="text-sm text-gray-600">{client.name}</span>
            </div>
          )}

          {/* Technologies */}
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {technologies.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {technologies.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{technologies.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Budget & Profitability */}
          {budget > 0 && (
            <div className="bg-gray-50 p-3 rounded mb-3 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Budget</span>
                <span className="font-semibold">${budget.toLocaleString()}</span>
              </div>
              {actualCost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profitability</span>
                  <div className="flex items-center gap-2">
                    <span className={profitability > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      ${profitability.toLocaleString()}
                    </span>
                    <span className={profitabilityPercent > 0 ? 'text-green-600 text-xs' : 'text-red-600 text-xs'}>
                      {profitabilityPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          {(startDate || endDate) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Calendar size={14} />
              {startDate && <span>{new Date(startDate).toLocaleDateString()}</span>}
              {startDate && endDate && <span>-</span>}
              {endDate && <span>{new Date(endDate).toLocaleDateString()}</span>}
            </div>
          )}

          {/* Action */}
          <Button variant="outline" className="w-full text-xs">
            View Details <TrendingUp size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </Link>
  )
}
