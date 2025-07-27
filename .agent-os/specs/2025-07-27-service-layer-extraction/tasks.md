# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-07-27-service-layer-extraction/spec.md

> Created: 2025-07-27
> Status: Ready for Implementation

## Tasks

- [x] 1. Create Core Service Infrastructure
  - [x] 1.1 Write tests for base service class and shared service utilities
  - [x] 1.2 Create BaseService class with common functionality (logging, error handling, caching)
  - [x] 1.3 Create service type definitions and interfaces in types/services.ts
  - [x] 1.4 Create service factory pattern for dependency injection
  - [x] 1.5 Set up service registration and configuration system
  - [x] 1.6 Verify all tests pass and infrastructure is ready

- [ ] 2. Extract ClientService from ClientContext
  - [ ] 2.1 Write comprehensive tests for ClientService covering all CRUD operations
  - [ ] 2.2 Create ClientService class with all client management functionality
  - [ ] 2.3 Extract API calls and business logic from ClientContext.tsx
  - [ ] 2.4 Create useClientService hook as bridge between components and service
  - [ ] 2.5 Update EnhancedClientSelector to use service through hook
  - [ ] 2.6 Update any other client-related components to use new service
  - [ ] 2.7 Verify all tests pass and client functionality works unchanged

- [ ] 3. Extract AuthService from AuthContext
  - [ ] 3.1 Write tests for AuthService covering authentication, token management, and session handling
  - [ ] 3.2 Create AuthService class extracting logic from AuthContext.tsx
  - [ ] 3.3 Implement token refresh, session validation, and auth state management
  - [ ] 3.4 Create useAuthService hook for React integration
  - [ ] 3.5 Update AuthContext to use AuthService internally
  - [ ] 3.6 Update components that directly access auth logic to use service
  - [ ] 3.7 Verify all tests pass and authentication works unchanged

- [ ] 4. Create APIService for Unified HTTP Client
  - [ ] 4.1 Write tests for APIService covering HTTP methods, interceptors, and error handling
  - [ ] 4.2 Create APIService class with consistent HTTP client interface
  - [ ] 4.3 Implement request/response interceptors for auth and error handling
  - [ ] 4.4 Add file upload/download capabilities
  - [ ] 4.5 Integrate with existing error classification system
  - [ ] 4.6 Update existing services to use APIService for HTTP calls
  - [ ] 4.7 Verify all tests pass and API calls work consistently

- [ ] 5. Extract AssetService from Asset Components
  - [ ] 5.1 Write tests for AssetService covering upload, organization, and metadata management
  - [ ] 5.2 Create AssetService class extracting logic from asset-related components
  - [ ] 5.3 Implement file upload processing, tagging, and search functionality
  - [ ] 5.4 Create useAssetService hook with upload progress and state management
  - [ ] 5.5 Update asset management components to use service
  - [ ] 5.6 Update asset browser and selector components to use service
  - [ ] 5.7 Verify all tests pass and asset management works unchanged

- [ ] 6. Extract CampaignService from Campaign Components
  - [ ] 6.1 Write tests for CampaignService covering campaign lifecycle and business rules
  - [ ] 6.2 Create CampaignService class extracting campaign management logic
  - [ ] 6.3 Implement campaign validation, matrix generation, and export functionality
  - [ ] 6.4 Create useCampaignService hook for React integration
  - [ ] 6.5 Update campaign builder components to use service
  - [ ] 6.6 Update campaign management and listing components to use service
  - [ ] 6.7 Verify all tests pass and campaign functionality works unchanged

- [ ] 7. Integration Testing and Cleanup
  - [ ] 7.1 Write integration tests for cross-service interactions
  - [ ] 7.2 Run comprehensive test suite to ensure no regressions
  - [ ] 7.3 Remove unused code from old context implementations
  - [ ] 7.4 Update documentation and add service usage examples
  - [ ] 7.5 Verify bundle size impact and optimize if necessary
  - [ ] 7.6 Run E2E tests to verify complete user workflows
  - [ ] 7.7 Verify all tests pass and service layer extraction is complete
