import { prisma } from '../prisma';
import { logger } from '../logging';

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  userId: string;
  widgets: any[];
  layout: string;
  createdAt: Date;
}

export class DashboardEngine {
  static async createDashboard(
    name: string,
    userId: string,
    description?: string
  ): Promise<Dashboard | null> {
    try {
      const dashboard = await prisma.dashboard.create({
        data: {
          name,
          description: description || null,
          userId,
          widgets: [],
          layout: 'grid',
          createdAt: new Date(),
        },
      });

      logger.info('Dashboard created', 'DashboardEngine', { dashboardId: dashboard.id });
      return dashboard as any;
    } catch (error) {
      logger.error('Failed to create dashboard', error, 'DashboardEngine');
      return null;
    }
  }

  static async getDashboards(userId: string): Promise<Dashboard[]> {
    try {
      const dashboards = await prisma.dashboard.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return dashboards as any[];
    } catch (error) {
      logger.error('Failed to get dashboards', error, 'DashboardEngine');
      return [];
    }
  }

  static async addWidget(
    dashboardId: string,
    widget: {
      type: string;
      title: string;
      config: any;
      position: { x: number; y: number; width: number; height: number };
    }
  ): Promise<boolean> {
    try {
      const dashboard = await prisma.dashboard.findUnique({
        where: { id: dashboardId },
      });

      if (!dashboard) return false;

      const widgets = Array.isArray(dashboard.widgets) ? dashboard.widgets : [];
      widgets.push({ ...widget, id: `widget-${Date.now()}` });

      await prisma.dashboard.update({
        where: { id: dashboardId },
        data: { widgets },
      });

      logger.info('Widget added', 'DashboardEngine', { dashboardId, widgetType: widget.type });
      return true;
    } catch (error) {
      logger.error('Failed to add widget', error, 'DashboardEngine');
      return false;
    }
  }

  static async updateLayout(dashboardId: string, layout: string): Promise<boolean> {
    try {
      await prisma.dashboard.update({
        where: { id: dashboardId },
        data: { layout },
      });

      return true;
    } catch (error) {
      logger.error('Failed to update layout', error, 'DashboardEngine');
      return false;
    }
  }

  static async deleteDashboard(dashboardId: string): Promise<boolean> {
    try {
      await prisma.dashboard.delete({
        where: { id: dashboardId },
      });

      logger.info('Dashboard deleted', 'DashboardEngine', { dashboardId });
      return true;
    } catch (error) {
      logger.error('Failed to delete dashboard', error, 'DashboardEngine');
      return false;
    }
  }
}
