# AIrWAVE Database Schema Documentation

## Overview

The AIrWAVE database consists of 22 tables that support the complete digital advertising creation workflow. The schema is designed with multi-tenancy, audit trails, and comprehensive analytics in mind.

## Table Categories

### 1. Core Business Entities

#### **clients**
- Central table for client organizations
- Links to most other tables via `client_id`
- Stores branding information (colors, logo)

#### **profiles**
- User profiles with role-based access control
- Stores preferences and permissions
- Linked to auth.users via `id`

#### **user_clients**
- Many-to-many relationship between users and clients
- Controls which users can access which client data

### 2. Content & Assets

#### **assets**
- Media assets (images, videos, audio, text)
- Supports metadata, tags, and dimensions
- Types: `image`, `video`, `text`, `voice`

#### **copy_assets** & **copy_texts**
- Specialized tables for copy/text content
- Both serve similar purposes (may need consolidation)
- Support tags and metadata

#### **templates**
- Design templates for different platforms
- Stores dimensions, structure, and platform info
- Can be client-specific or global

### 3. Strategy & Brief Management

#### **briefs**
- Client briefs with document parsing capabilities
- Stores objectives, target audience, and guidelines
- Parsing status tracking for AI processing

#### **strategies**
- Marketing strategies linked to clients
- Contains goals, key messages, and target audience

#### **motivations**
- Customer motivations (AI-generated or manual)
- Linked to briefs and strategies
- Includes relevance scoring

#### **strategy_motivations**
- Links strategies to motivations
- Supports ordering for priority

#### **selected_motivations**
- Tracks which motivations were selected for use

### 4. Content Generation

#### **generated_content**
- Stores AI-generated content
- Links to selected motivations
- Tracks content types, tone, and style

#### **content_variations**
- Different variations of content
- Performance and compliance scoring
- Platform-specific variations

### 5. Campaign Execution

#### **matrices**
- Campaign asset combination matrices
- Core feature for creating multiple ad variations
- JSON structure for flexible asset combinations

#### **executions**
- Rendered campaign outputs
- Status tracking (draft, rendering, completed)
- Approval workflow integration

### 6. Analytics & Performance

#### **analytics**
- General analytics data
- Flexible JSON structure for metrics

#### **campaign_analytics**
- Detailed campaign performance metrics
- Platform-specific data (impressions, clicks, etc.)
- Financial metrics (spend, ROAS, CPC)

### 7. Approval & Collaboration

#### **approval_workflows**
- Manages approval processes
- Tracks submission, review, and approval times

#### **approvals**
- Individual approval actions
- Version tracking for iterations

#### **approval_comments**
- Comments on assets or workflows
- Position data for visual annotations

### 8. Integration

#### **platform_integrations**
- OAuth tokens for social platforms
- Tracks permissions and sync status
- Supports multiple platforms per client

## Key Relationships

```
clients
  ├── assets (via client_id)
  ├── briefs (via client_id)
  ├── strategies (via client_id)
  ├── templates (via client_id)
  ├── matrices (via client_id)
  ├── executions (via client_id)
  └── user_clients (via client_id) → profiles (via user_id)

briefs
  ├── motivations (via brief_id)
  └── content_variations (via brief_id)

strategies
  └── strategy_motivations → motivations

matrices
  ├── executions (via matrix_id)
  └── templates (via template_id)

executions
  ├── approval_workflows (via execution_id)
  └── campaign_analytics (via execution_id)

approval_workflows
  ├── approvals (via workflow_id)
  └── approval_comments (via workflow_id)
```

## Common Fields

Most tables include these standard fields:

- `id` - UUID primary key (auto-generated)
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update
- `created_by` - User ID who created the record
- `client_id` - Client ownership (for multi-tenancy)

## Data Types

### UUIDs
All primary and foreign keys use UUID type for:
- Global uniqueness
- Better security (non-sequential)
- Easier data migration

### JSONB Fields
Used for flexible data storage:
- `metadata` - Additional properties
- `structure` - Template/matrix configurations
- `goals`, `key_messages` - Strategy details
- `metrics`, `insights` - Analytics data

### Arrays
PostgreSQL arrays for:
- `tags` - Asset categorization
- `platforms` - Multi-platform support
- `motivation_ids` - Multiple motivations

### Enums (via check constraints)
- Asset types: `image`, `video`, `text`, `voice`
- Statuses: `pending`, `active`, `completed`, etc.
- Platforms: `facebook`, `instagram`, `youtube`, `tiktok`

## Security Considerations

1. **Row Level Security (RLS)**
   - All tables should have RLS policies
   - Access based on user_clients relationship

2. **Sensitive Data**
   - OAuth tokens in platform_integrations
   - Should be encrypted at rest

3. **Audit Trail**
   - created_by, created_at for all records
   - updated_at for change tracking
   - approval history for compliance

## Performance Optimizations

1. **Indexes**
   - Primary keys (automatic)
   - Foreign keys for joins
   - client_id for tenant isolation
   - created_at for time-based queries

2. **Partitioning Candidates**
   - campaign_analytics by date
   - assets by client_id (for large deployments)

3. **Archival Strategy**
   - Old executions and analytics
   - Completed approval workflows

## Migration Notes

When adding new features:

1. Always include standard fields (id, timestamps, client_id)
2. Consider multi-tenancy implications
3. Add appropriate RLS policies
4. Create indexes for foreign keys
5. Document the purpose and relationships

## Common Queries

### Get all assets for a user's accessible clients
```sql
SELECT a.* 
FROM assets a
JOIN user_clients uc ON a.client_id = uc.client_id
WHERE uc.user_id = $1
ORDER BY a.created_at DESC;
```

### Get campaign performance
```sql
SELECT 
  e.name as campaign_name,
  ca.platform,
  SUM(ca.impressions) as total_impressions,
  SUM(ca.clicks) as total_clicks,
  AVG(ca.ctr) as avg_ctr,
  SUM(ca.spend) as total_spend,
  AVG(ca.roas) as avg_roas
FROM executions e
JOIN campaign_analytics ca ON e.id = ca.execution_id
WHERE e.client_id = $1
GROUP BY e.name, ca.platform;
```

### Get motivations for a strategy
```sql
SELECT m.*
FROM motivations m
JOIN strategy_motivations sm ON m.id = sm.motivation_id
WHERE sm.strategy_id = $1
ORDER BY sm.order_position;
```

## Future Considerations

1. **Table Consolidation**
   - Merge copy_assets and copy_texts
   - Combine analytics tables

2. **Additional Features**
   - Versioning for templates and briefs
   - Team collaboration features
   - Advanced scheduling capabilities

3. **Performance**
   - Materialized views for analytics
   - Caching layer for frequently accessed data
   - Read replicas for reporting
