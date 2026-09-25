import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, any>;
  error?: string;
}

class Logger {
  private logDir = path.join(process.cwd(), "logs");

  constructor() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, data, error } = entry;
    
    let log = `[${timestamp}] [${level}]`;
    if (context) log += ` [${context}]`;
    log += ` ${message}`;
    
    if (data) {
      log += ` ${JSON.stringify(data)}`;
    }
    
    if (error) {
      log += ` ERROR: ${error}`;
    }
    
    return log;
  }

  private async writeToFile(entry: LogEntry, fileName: string) {
    try {
      const filePath = path.join(this.logDir, fileName);
      const formattedLog = this.formatLog(entry);
      
      fs.appendFileSync(filePath, formattedLog + "\n", "utf-8");
    } catch (error) {
      console.error("Failed to write log:", error);
    }
  }

  private async saveToDatabase(entry: LogEntry) {
    try {
      await prisma.systemLog.create({
        data: {
          level: entry.level,
          message: entry.message,
          context: entry.context || null,
          data: entry.data ? JSON.stringify(entry.data) : null,
          error: entry.error || null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to save log to database:", error);
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: Record<string, any>, error?: string) {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = { timestamp, level, message, context, data, error };

    // Console output
    console.log(this.formatLog(entry));

    // File output (in production)
    if (process.env.NODE_ENV === "production") {
      const fileName = `${level.toLowerCase()}-${new Date().toISOString().split("T")[0]}.log`;
      this.writeToFile(entry, fileName);
    }

    // Database output (for important logs)
    if ([LogLevel.ERROR, LogLevel.CRITICAL, LogLevel.WARNING].includes(level)) {
      this.saveToDatabase(entry);
    }
  }

  debug(message: string, context?: string, data?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context, data);
  }

  warning(message: string, context?: string, data?: Record<string, any>) {
    this.log(LogLevel.WARNING, message, context, data);
  }

  error(message: string, error: Error | string, context?: string, data?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : error;
    this.log(LogLevel.ERROR, message, context, data, errorMessage);
  }

  critical(message: string, error: Error | string, context?: string, data?: Record<string, any>) {
    const errorMessage = error instanceof Error ? error.message : error;
    this.log(LogLevel.CRITICAL, message, context, data, errorMessage);
  }
}

export const logger = new Logger();
