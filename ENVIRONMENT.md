# Environment Configuration

This project supports multiple environments for development and production deployments.

## Environment Files

### Base Environment (`src/environments/environment.ts`)
- Default environment configuration
- Used as fallback when no specific environment is specified

### Development Environment (`src/environments/environment.development.ts`)
- Development-specific settings
- Debug mode enabled
- Local API endpoints
- Console logging enabled

### Production Environment (`src/environments/environment.production.ts`)
- Production-specific settings
- Debug mode disabled
- Production API endpoints
- Performance monitoring enabled

## Configuration Properties

### API Configuration
```typescript
apiUrl: string // Base API URL for all services
```

### Feature Flags
```typescript
features: {
  enableAnalytics: boolean
  enableDebugMode: boolean
  enableFileUpload: boolean
  enableLogging: boolean
}
```

### Debug Configuration
```typescript
debug: {
  enableConsoleLogs: boolean
  enableNetworkLogs: boolean
  enablePerformanceMonitoring: boolean
}
```

### Cloudinary Configuration
```typescript
cloudinary: {
  cloudName: string
  uploadPreset: string
}
```

## Usage

### Development
```bash
# Start development server
npm run start:dev

# Build for development
npm run build:dev
```

### Production
```bash
# Start production server
npm run start:prod

# Build for production
npm run build:prod
```

### Default
```bash
# Start with default configuration
npm start

# Build with default configuration
npm run build
```

## Environment Variables

### Development
- API URL: `http://localhost:3000/api/v1`
- Debug Mode: Enabled
- Console Logs: Enabled
- Source Maps: Enabled

### Production
- API URL: `https://your-production-api.com/api/v1`
- Debug Mode: Disabled
- Console Logs: Disabled
- Source Maps: Disabled
- Optimization: Enabled

## Customization

To customize environment settings:

1. Edit the appropriate environment file
2. Update the `apiUrl` to point to your API server
3. Configure Cloudinary settings if using file uploads
4. Adjust feature flags as needed

## Service Integration

All services automatically use the environment configuration:

```typescript
import { environment } from '../../environments/environment';

@Injectable()
export class MyService {
  private apiUrl = `${environment.apiUrl}/my-endpoint`;
}
```

## Deployment

### Development Deployment
- Use `npm run build:dev` for development builds
- Deploy to development server
- Debug features enabled

### Production Deployment
- Use `npm run build:prod` for production builds
- Deploy to production server
- Optimized for performance
- Debug features disabled 