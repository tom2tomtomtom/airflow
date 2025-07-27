# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-07-27-service-layer-extraction/spec.md

> Created: 2025-07-27
> Version: 1.0.0

## Service APIs

This specification focuses on the service layer APIs that will be created to extract business logic from components. These are TypeScript service classes, not HTTP endpoints.

### ClientService API

**Purpose:** Centralize all client-related business logic currently scattered across ClientContext and related components

```typescript
class ClientService {
  // Core CRUD operations
  async getClients(options?: ClientQueryOptions): Promise<Client[]>;
  async getClient(id: string): Promise<Client | null>;
  async createClient(data: CreateClientData): Promise<Client>;
  async updateClient(id: string, data: UpdateClientData): Promise<Client>;
  async deleteClient(id: string): Promise<void>;

  // Business logic operations
  async searchClients(query: string, filters?: ClientFilters): Promise<Client[]>;
  async getRecentClients(limit?: number): Promise<Client[]>;
  async validateClientData(data: Partial<Client>): Promise<ValidationResult>;
  async setActiveClient(client: Client | null): Promise<void>;
  async getActiveClient(): Promise<Client | null>;
}
```

**Key Features:**

- Extracted from ClientContext.tsx
- Handles all client data operations
- Manages active client state
- Provides search and filtering capabilities

### AssetService API

**Purpose:** Manage all asset operations currently embedded in asset-related components

```typescript
class AssetService {
  // Asset management
  async uploadAsset(file: File, metadata: AssetMetadata): Promise<Asset>;
  async getAssets(options?: AssetQueryOptions): Promise<Asset[]>;
  async getAsset(id: string): Promise<Asset | null>;
  async updateAsset(id: string, data: UpdateAssetData): Promise<Asset>;
  async deleteAsset(id: string): Promise<void>;

  // Organization and search
  async searchAssets(query: string, filters?: AssetFilters): Promise<Asset[]>;
  async tagAsset(id: string, tags: string[]): Promise<Asset>;
  async organizeAssetsByFolder(folderId: string, assetIds: string[]): Promise<void>;
  async generateAssetPreview(id: string): Promise<string>;
}
```

**Key Features:**

- Handles file upload processing
- Manages asset metadata and organization
- Provides search and filtering
- Generates previews and thumbnails

### CampaignService API

**Purpose:** Handle campaign lifecycle and business rules

```typescript
class CampaignService {
  // Campaign lifecycle
  async createCampaign(data: CreateCampaignData): Promise<Campaign>;
  async getCampaigns(options?: CampaignQueryOptions): Promise<Campaign[]>;
  async getCampaign(id: string): Promise<Campaign | null>;
  async updateCampaign(id: string, data: UpdateCampaignData): Promise<Campaign>;
  async deleteCampaign(id: string): Promise<void>;

  // Business logic
  async validateCampaignData(data: Partial<Campaign>): Promise<ValidationResult>;
  async generateCampaignMatrix(campaignId: string): Promise<CampaignMatrix>;
  async exportCampaign(id: string, format: ExportFormat): Promise<ExportResult>;
  async duplicateCampaign(id: string, options?: DuplicateOptions): Promise<Campaign>;
}
```

### AuthService API

**Purpose:** Centralize authentication logic from AuthContext

```typescript
class AuthService {
  // Authentication state
  async getCurrentUser(): Promise<User | null>;
  async login(credentials: LoginCredentials): Promise<AuthResult>;
  async logout(): Promise<void>;
  async refreshToken(): Promise<string | null>;

  // Session management
  async validateSession(): Promise<boolean>;
  async getAuthToken(): Promise<string | null>;
  async setAuthToken(token: string): Promise<void>;
  async clearAuthData(): Promise<void>;
}
```

### APIService API

**Purpose:** Unified HTTP client for all backend interactions

```typescript
class APIService {
  // HTTP methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>;
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>;
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;

  // Specialized methods
  async uploadFile(endpoint: string, file: File, options?: UploadOptions): Promise<any>;
  async downloadFile(endpoint: string, options?: DownloadOptions): Promise<Blob>;

  // Configuration
  setAuthToken(token: string): void;
  setBaseURL(url: string): void;
  addInterceptor(interceptor: RequestInterceptor): void;
}
```

## Custom Hooks API

Custom hooks will serve as the bridge between React components and services:

### useClientService Hook

```typescript
function useClientService() {
  return {
    clients: Client[],
    activeClient: Client | null,
    loading: boolean,
    error: string | null,

    // Actions that wrap service methods
    loadClients: () => Promise<void>,
    setActiveClient: (client: Client | null) => Promise<void>,
    createClient: (data: CreateClientData) => Promise<Client>,
    updateClient: (id: string, data: UpdateClientData) => Promise<Client>,
    deleteClient: (id: string) => Promise<void>,
    searchClients: (query: string) => Promise<void>
  }
}
```

### useAssetService Hook

```typescript
function useAssetService() {
  return {
    assets: Asset[],
    loading: boolean,
    error: string | null,
    uploadProgress: number,

    // Actions
    loadAssets: (options?: AssetQueryOptions) => Promise<void>,
    uploadAsset: (file: File, metadata: AssetMetadata) => Promise<Asset>,
    deleteAsset: (id: string) => Promise<void>,
    searchAssets: (query: string, filters?: AssetFilters) => Promise<void>
  }
}
```

## Error Handling

All services will implement consistent error handling:

```typescript
interface ServiceError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
}

// Standard error responses from services
type ServiceResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: ServiceError;
    };
```

## Integration Points

- Services will integrate with existing error classification system
- Services will use existing caching infrastructure
- Services will follow existing logging patterns
- Services will work with existing authentication system
- Services will be testable in isolation from React components
