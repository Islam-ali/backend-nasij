export const environment = {
  production: false,
  development: false,
  baseUrl: 'https://api.pledgestores.com',
  apiUrl: 'https://api.pledgestores.com/api/v1', 
  appName: 'Online Store Admin',
  version: '1.0.0',
  // Add other environment variables as needed
  cloudinary: {
    cloudName: 'your-cloud-name',
    uploadPreset: 'your-upload-preset'
  },
  // Feature flags
  features: {
    enableAnalytics: false,
    enableDebugMode: true,
    enableFileUpload: true
  }
}; 