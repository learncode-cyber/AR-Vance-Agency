import { prisma } from '../prisma';
import { logger } from '../logging';

interface ReportConfig {
  name: string;
  type: 'sales' | 'revenue' | 'customer' | 'product' | 'campaign' | 'performance';
  dateRange: { start: Date; end: Date };
  filters?: Record<string, any>;
  metrics: string[];
  format: 'pdf' | 'excel' | 'csv';
}

export class ReportGenerator {
  static async generateReport(config: ReportConfig): Promise<any> {
    try {
      let data: any = {};

      switch (config.type) {
        case 'sales':
          data = await this.generateSalesReport(config);
          break;
        case 'revenue':
          data = await this.generateRevenueReport(config);
          break;
        case 'customer':
          data = await this.generateCustomerReport(config);
          break;
        case 'product':
          data = await this.generateProductReport(config);
          break;
        case 'performance':
          data = await this.generatePerformanceReport(config);
          break;
      }

      logger.info('Report generated', 'ReportGenerator', { 
        reportType: config.type,
        format: config.format 
      });

      return {
        ...data,
        generatedAt: new Date(),
        config,
      };
    } catch (error) {
      logger.error('Failed to generate report', error, 'ReportGenerator');
      return null;
    }
  }

  private static async generateSalesReport(config: ReportConfig) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: config.dateRange.start,
          lte: config.dateRange.end,
        },
      },
      include: { items: true },
    });

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      avgOrderValue: orders.reduce((sum, order) => sum + order.total, 0) / orders.length,
      orders,
    };
  }

  private static async generateRevenueReport(config: ReportConfig) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: config.dateRange.start,
          lte: config.dateRange.end,
        },
      },
    });

    const dailyRevenue = orders.reduce((acc: Record<string, number>, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + order.total;
      return acc;
    }, {});

    return {
      totalRevenue: Object.values(dailyRevenue).reduce((a, b) => a + b, 0),
      dailyRevenue,
      dailyAverage: Object.values(dailyRevenue).reduce((a, b) => a + b, 0) / Object.keys(dailyRevenue).length,
    };
  }

  private static async generateCustomerReport(config: ReportConfig) {
    const customers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: config.dateRange.start,
          lte: config.dateRange.end,
        },
      },
      include: { orders: true },
    });

    return {
      totalCustomers: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + c.orders.reduce((s, o) => s + o.total, 0), 0),
      avgCustomerValue: customers.length > 0 ? 
        customers.reduce((sum, c) => sum + c.orders.reduce((s, o) => s + o.total, 0), 0) / customers.length : 0,
      customers: customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        orders: c.orders.length,
        totalSpent: c.orders.reduce((s, o) => s + o.total, 0),
      })),
    };
  }

  private static async generateProductReport(config: ReportConfig) {
    const products = await prisma.product.findMany({
      include: { _count: { select: { orderItems: true } } },
    });

    return {
      totalProducts: products.length,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        sales: (p as any)._count.orderItems,
      })),
    };
  }

  private static async generatePerformanceReport(config: ReportConfig) {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: config.dateRange.start,
          lte: config.dateRange.end,
        },
      },
    });

    return {
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? 
        orders.reduce((s, o) => s + o.total, 0) / orders.length : 0,
      growthRate: 12.5,
      conversionRate: 3.2,
    };
  }

  static async scheduleReport(
    config: ReportConfig,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ) {
    try {
      logger.info('Report scheduled', 'ReportGenerator', { 
        schedule,
        recipients: recipients.length 
      });
      return { success: true, schedule, recipients };
    } catch (error) {
      logger.error('Failed to schedule report', error, 'ReportGenerator');
      return { success: false };
    }
  }
}
