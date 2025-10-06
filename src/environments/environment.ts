export const environment = {
  production: false,
  development: false,
  baseUrl: 'https://pledeg.tappih.com/',
  apiUrl: 'https://pledeg.tappih.com/api/v1', 
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