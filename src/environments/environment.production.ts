export const environment = {
  production: true,
  development: false,
  baseUrl: 'https://api.pledgestores.com',
  apiUrl: 'https://api.pledgestores.com/api/v1', 
  appName: 'Online Store Admin',
  version: '1.0.0',
  // Production specific settings
  cloudinary: {
    cloudName: 'your-production-cloud-name',
    uploadPreset: 'your-production-upload-preset'
  },
  // Feature flags for production
  features: {
    enableAnalytics: true,
    enableDebugMode: false,
    enableFileUpload: true,
    enableLogging: false
  },
  // Production specific configurations
  debug: {
    enableConsoleLogs: false,
    enableNetworkLogs: false,
    enablePerformanceMonitoring: true
  }
}; 