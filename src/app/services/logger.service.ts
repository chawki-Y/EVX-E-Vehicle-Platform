import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private currentLogLevel = environment.production ? LogLevel.ERROR : LogLevel.DEBUG;

  error(message: string, error?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
      // In production, you might want to send this to a logging service
      if (environment.production) {
        this.sendToLoggingService('error', message, error);
      }
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${new Date().toISOString()}: ${message}`, data);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, data);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.currentLogLevel;
  }

  private sendToLoggingService(level: string, message: string, error?: any): void {
    // Implement your logging service integration here
    // Example: send to Sentry, LogRocket, or custom API
  }
}