// Manual OpenAPI specification without swagger-jsdoc to avoid webpack issues
const swaggerSpec = {
  openapi: '3.0.0',
    info: {
      title: 'AIRWAVE API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for AIRWAVE - AI-powered content generation and campaign management platform',
      contact: {
        name: 'AIRWAVE Support',
        email: 'support@airwave.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://airwave-complete.netlify.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth-token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Invalid input data',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
        Client: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'Acme Corporation',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'contact@acme.com',
            },
            industry: {
              type: 'string',
              example: 'Technology',
            },
            brandGuidelines: {
              type: 'object',
              properties: {
                colors: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['#FF0000', '#00FF00'],
                },
                fonts: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['Arial', 'Helvetica'],
                },
                tone: {
                  type: 'string',
                  example: 'Professional and friendly',
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Asset: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Product Hero Image',
            },
            type: {
              type: 'string',
              enum: ['image', 'video', 'audio', 'document'],
              example: 'image',
            },
            url: {
              type: 'string',
              format: 'uri',
              example: 'https://cdn.airwave.app/assets/hero-image.jpg',
            },
            thumbnailUrl: {
              type: 'string',
              format: 'uri',
            },
            size: {
              type: 'integer',
              example: 1024000,
            },
            mimeType: {
              type: 'string',
              example: 'image/jpeg',
            },
            clientId: {
              type: 'string',
              format: 'uuid',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['hero', 'product', 'marketing'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Campaign: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Summer Product Launch',
            },
            description: {
              type: 'string',
              example: 'Comprehensive campaign for new product launch',
            },
            clientId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'paused', 'completed'],
              example: 'active',
            },
            platforms: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok'],
              },
              example: ['instagram', 'facebook'],
            },
            budget: {
              type: 'number',
              example: 10000,
            },
            startDate: {
              type: 'string',
              format: 'date',
            },
            endDate: {
              type: 'string',
              format: 'date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  },
  paths: {
    '/api/clients': {
      get: {
        summary: 'List all clients',
        description: 'Retrieve a paginated list of clients with optional filtering and sorting',
        tags: ['Clients'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Search term to filter clients by name, description, or industry'
          },
          {
            in: 'query',
            name: 'industry',
            schema: { type: 'string' },
            description: 'Filter clients by industry'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            description: 'Number of clients to return per page'
          },
          {
            in: 'query',
            name: 'offset',
            schema: { type: 'integer', minimum: 0, default: 0 },
            description: 'Number of clients to skip'
          }
        ],
        responses: {
          200: {
            description: 'Successfully retrieved clients',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/Success' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Client' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new client',
        description: 'Create a new client with brand guidelines and contact information',
        tags: ['Clients'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'industry'],
                properties: {
                  name: { type: 'string', example: 'Acme Corporation' },
                  industry: { type: 'string', example: 'Technology' },
                  description: { type: 'string', example: 'Leading technology company' },
                  website: { type: 'string', format: 'uri', example: 'https://acme.com' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Client created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/Success' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/Client' }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/assets': {
      get: {
        summary: 'List all assets',
        description: 'Retrieve a paginated list of assets with filtering and sorting options',
        tags: ['Assets'],
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Page number for pagination'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            description: 'Number of assets per page'
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Search term to filter assets by name'
          },
          {
            in: 'query',
            name: 'type',
            schema: { type: 'string', enum: ['image', 'video', 'text', 'voice'] },
            description: 'Filter assets by type'
          }
        ],
        responses: {
          200: {
            description: 'Successfully retrieved assets',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/Success' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Asset' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  }
};

export { swaggerSpec };
