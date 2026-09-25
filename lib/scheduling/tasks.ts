import { logger } from '../logging';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdAt: Date;
}

export class TaskService {
  private static tasks = new Map<string, Task>();

  static async createTask(data: {
    title: string;
    description?: string;
    assignedTo: string;
    dueDate: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<Task | null> {
    try {
      const task: Task = {
        id: `task-${Date.now()}`,
        title: data.title,
        description: data.description,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate,
        priority: data.priority,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
      };

      this.tasks.set(task.id, task);
      logger.info('Task created', 'TaskService', { taskId: task.id, title: data.title });
      return task;
    } catch (error) {
      logger.error('Failed to create task', error, 'TaskService');
      return null;
    }
  }

  static async getTask(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) || null;
  }

  static async updateProgress(taskId: string, progress: number): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.progress = Math.min(progress, 100);
    if (progress === 100) task.status = 'completed';
    logger.info('Task progress updated', 'TaskService', { taskId, progress });
    return true;
  }

  static async getTasksByAssignee(assignedTo: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.assignedTo === assignedTo);
  }

  static getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
}
