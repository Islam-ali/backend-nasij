// Import the development environment as the default
import { environment as devEnvironment } from './environment.development';

// Export the appropriate environment based on the build configuration
// This ensures that the app always has a valid environment configuration
export const environment = devEnvironment;