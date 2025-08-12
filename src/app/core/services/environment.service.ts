import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  /**
   * Get the current environment configuration
   */
  getEnvironment() {
    return environment;
  }

  /**
   * Check if running in production mode
   */
  isProduction(): boolean {
    return environment.production;
  }

  /**
   * Check if running in development mode
   */
  isDevelopment(): boolean {
    return environment.development;
  }

  /**
   * Get the API base URL
   */
  getApiUrl(): string {
    return environment.apiUrl;
  }

  /**
   * Get the application name
   */
  getAppName(): string {
    return environment.appName;
  }

  /**
   * Get the application version
   */
  getVersion(): string {
    return environment.version;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof typeof environment.features): boolean {
    return environment.features[feature];
  }

  /**
   * Get debug configuration
   */
  getDebugConfig() {
    return environment.debug;
  }

  /**
   * Get Cloudinary configuration
   */
  getCloudinaryConfig() {
    return environment.cloudinary;
  }

  /**
   * Check if console logs are enabled
   */
  isConsoleLoggingEnabled(): boolean {
    return environment.debug?.enableConsoleLogs || false;
  }

  /**
   * Check if network logs are enabled
   */
  isNetworkLoggingEnabled(): boolean {
    return environment.debug?.enableNetworkLogs || false;
  }

  /**
   * Check if performance monitoring is enabled
   */
  isPerformanceMonitoringEnabled(): boolean {
    return environment.debug?.enablePerformanceMonitoring || false;
  }
} 