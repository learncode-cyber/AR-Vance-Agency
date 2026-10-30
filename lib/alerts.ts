import { prisma } from "./prisma";
import { logger } from "./logging";
import axios from "axios";

export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum AlertType {
  ERROR_RATE = "error_rate",
  PERFORMANCE_DEGRADATION = "performance_degradation",
  API_DOWN = "api_down",
  DEPLOYMENT_FAILED = "deployment_failed",
  SECURITY_ISSUE = "security_issue",
  QUOTA_EXCEEDED = "quota_exceeded",
}

interface AlertConfig {
  type: AlertType;
  severity: AlertSeverity;
  threshold?: number;
  message: string;
  metadata?: Record<string, any>;
}

class AlertSystem {
  private slackWebhook = process.env.SLACK_WEBHOOK_URL;
  private emailService = process.env.ALERT_EMAIL_SERVICE;

  async sendAlert(config: AlertConfig) {
    try {
      // Log the alert
      logger.warning(`Alert triggered: ${config.type}`, "AlertSystem", config.metadata);

      // Save to database
      const alert = await prisma.alert.create({
        data: {
          type: config.type,
          severity: config.severity,
          title: config.message,
          description: JSON.stringify(config.metadata || {}),
          resolved: false,
          createdAt: new Date(),
        },
      });

      // Send notifications
      await Promise.all([
        this.sendSlackNotification(config),
        this.sendEmailNotification(config),
      ]);

      return alert;
    } catch (error) {
      logger.error("Failed to send alert", error, "AlertSystem");
      throw error;
    }
  }

  private async sendSlackNotification(config: AlertConfig) {
    if (!this.slackWebhook) return;

    try {
      const colors: Record<AlertSeverity, string> = {
        [AlertSeverity.LOW]: "#36a64f",
        [AlertSeverity.MEDIUM]: "#ff9900",
        [AlertSeverity.HIGH]: "#ff3333",
        [AlertSeverity.CRITICAL]: "#ff0000",
      };

      await axios.post(this.slackWebhook, {
        attachments: [
          {
            color: colors[config.severity],
            title: config.message,
            text: JSON.stringify(config.metadata || {}),
            footer: "Alert System",
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      });

      logger.info("Slack notification sent", "AlertSystem");
    } catch (error) {
      logger.error("Failed to send Slack notification", error, "AlertSystem");
    }
  }

  private async sendEmailNotification(config: AlertConfig) {
    // Email implementation would go here
    logger.info(`Email alert would be sent: ${config.message}`, "AlertSystem");
  }

  async checkErrorRate() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const errorCount = await prisma.systemLog.count({
        where: {
          level: "ERROR",
          timestamp: {
            gte: thirtyMinutesAgo,
          },
        },
      });

      const threshold = 10;

      if (errorCount > threshold) {
        await this.sendAlert({
          type: AlertType.ERROR_RATE,
          severity: AlertSeverity.HIGH,
          threshold,
          message: `High error rate detected: ${errorCount} errors in last 30 minutes`,
          metadata: { errorCount, threshold },
        });
      }
    } catch (error) {
      logger.error("Failed to check error rate", error, "AlertSystem");
    }
  }

  async checkPerformance() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const slowRequests = await prisma.apiLog.count({
        where: {
          duration: { gt: 2000 }, // > 2 seconds
          timestamp: { gte: oneHourAgo },
        },
      });

      const threshold = 5;

      if (slowRequests > threshold) {
        await this.sendAlert({
          type: AlertType.PERFORMANCE_DEGRADATION,
          severity: AlertSeverity.MEDIUM,
          threshold,
          message: `Performance degradation: ${slowRequests} slow requests in last hour`,
          metadata: { slowRequests, threshold },
        });
      }
    } catch (error) {
      logger.error("Failed to check performance", error, "AlertSystem");
    }
  }
}

export const alertSystem = new AlertSystem();
