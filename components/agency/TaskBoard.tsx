'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, X, Clock, AlertCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  dueDate?: string
  createdAt: string
}

interface TaskBoardProps {
  projectId: string
  tasks: Task[]
  onTaskMove?: (taskId: string, newStatus: Task['status']) => Promise<void>
  onTaskCreate?: () => void
}

export function TaskBoard({
  projectId,
  tasks,
  onTaskMove,
  onTaskCreate
}: TaskBoardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const statusColumns = ['todo', 'in-progress', 'review', 'done'] as const
  const statusLabels: Record<string, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'Review',
    done: 'Done'
  }

  const priorityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  const getTasksByStatus = (status: typeof statusColumns[number]) => {
    return tasks.filter(task => task.status === status)
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (status: typeof statusColumns[number]) => {
    if (!draggedTask || !onTaskMove) return

    try {
      setIsLoading(true)
      await onTaskMove(draggedTask.id, status)
    } catch (error) {
      console.error('Failed to move task:', error)
    } finally {
      setIsLoading(false)
      setDraggedTask(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Project Tasks</h3>
        {onTaskCreate && (
          <Button size="sm" onClick={onTaskCreate}>
            <Plus size={16} className="mr-1" />
            Add Task
          </Button>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((status) => (
          <div
            key={status}
            className="bg-gray-50 rounded-lg p-4 min-h-96"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                {statusLabels[status]}
              </h4>
              <Badge variant="secondary" className="text-xs">
                {getTasksByStatus(status as any).length}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {getTasksByStatus(status as any).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
                >
                  {/* Title */}
                  <h5 className="font-semibold text-sm text-gray-900 mb-2">
                    {task.title}
                  </h5>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Priority */}
                  <Badge className={`${priorityColors[task.priority]} text-xs mb-2`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    {task.dueDate && (
                      <div className={`flex items-center gap-1 ${
                        isOverdue(task.dueDate) ? 'text-red-600' : ''
                      }`}>
                        {isOverdue(task.dueDate) ? (
                          <AlertCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.assignedTo && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        {task.assignedTo.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {getTasksByStatus(status as any).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
