export const environment = {
  production: false,
  development: true,
  baseUrl: 'http://localhost:3001',
  apiUrl: 'http://localhost:3001/api/v1', 
  appName: 'Online Store Admin (Dev)',
  version: '1.0.0',
  // Development specific settings
  cloudinary: {
    cloudName: 'your-cloud-name',
    uploadPreset: 'your-upload-preset'
  },
  // Feature flags for development
  features: {
    enableAnalytics: false,
    enableDebugMode: true,
    enableFileUpload: true,
    enableLogging: true
  },
  // Development specific configurations
  debug: {
    enableConsoleLogs: true,
    enableNetworkLogs: true,
    enablePerformanceMonitoring: true
  }
}; 