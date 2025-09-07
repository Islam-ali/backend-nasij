export const environment = {
  production: true,
  development: false,
  apiUrl: 'https://pledge-backend-sigma.vercel.app/api/v1', // Replace with your production API URL
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