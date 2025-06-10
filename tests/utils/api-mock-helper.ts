/**
 * API mocking helper for AIrWAVE testing
 * Handles external API mocking for Creatomate, OpenAI, ElevenLabs
 */

import { Page, Route } from '@playwright/test';

export interface MockResponse {
  status: number;
  body: any;
  headers?: Record<string, string>;
  delay?: number;
}

export interface MockScenario {
  name: string;
  description: string;
  mocks: Record<string, MockResponse>;
}

export class APIMockHelper {
  private page: Page;
  private activeMocks: Map<string, MockResponse> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  // Setup default mocks for all external APIs
  async setupDefaultMocks(): Promise<void> {
    await this.setupCreatomateDefaults();
    await this.setupOpenAIDefaults();
    await this.setupElevenLabsDefaults();
    
    console.log('✅ Default API mocks set up');
  }

  // Creatomate API mocking
  async setupCreatomateDefaults(): Promise<void> {
    // Mock render creation
    await this.mockAPI(/.*api\.creatomate\.com\/v1\/renders.*/, {
      status: 200,
      body: {
        id: 'mock-render-id-' + Date.now(),
        status: 'queued',
        template_id: 'mock-template-id',
        output_format: 'mp4',
        created_at: new Date().toISOString()
      }
    });

    // Mock render status polling
    await this.mockAPI(/.*api\.creatomate\.com\/v1\/renders\/.*\/status.*/, {
      status: 200,
      body: {
        id: 'mock-render-id',
        status: 'succeeded',
        output_url: 'https://mock-output-url.com/video.mp4',
        progress: 100,
        completed_at: new Date().toISOString()
      }
    });

    // Mock template listing
    await this.mockAPI(/.*api\.creatomate\.com\/v1\/templates.*/, {
      status: 200,
      body: {
        data: [
          {
            id: 'template-1',
            name: 'Instagram Square',
            width: 1080,
            height: 1080,
            platform: 'instagram'
          },
          {
            id: 'template-2', 
            name: 'Facebook Video',
            width: 1920,
            height: 1080,
            platform: 'facebook'
          }
        ]
      }
    });

    // Mock webhook endpoint
    await this.mockAPI(/.*api\.creatomate\.com\/v1\/webhooks.*/, {
      status: 200,
      body: { success: true }
    });
  }

  // OpenAI API mocking
  async setupOpenAIDefaults(): Promise<void> {
    // Mock chat completions for copy generation
    await this.mockAPI(/.*api\.openai\.com\/v1\/chat\/completions.*/, {
      status: 200,
      body: {
        id: 'chatcmpl-mock',
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify({
                headlines: [
                  'Innovative Solutions for Modern Challenges',
                  'Transform Your Business Today',
                  'Excellence in Every Detail'
                ],
                descriptions: [
                  'Discover cutting-edge technology that drives results.',
                  'Professional solutions tailored to your needs.',
                  'Quality and innovation combined for success.'
                ],
                calls_to_action: [
                  'Get Started Now',
                  'Learn More',
                  'Contact Us Today'
                ]
              })
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 150,
          total_tokens: 250
        }
      }
    });

    // Mock strategic motivations generation
    await this.mockAPI(/.*api\.openai\.com\/v1\/chat\/completions.*strategic.*/, {
      status: 200,
      body: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                motivations: [
                  {
                    category: 'Innovation',
                    description: 'Leading technological advancement',
                    score: 0.9
                  },
                  {
                    category: 'Quality', 
                    description: 'Uncompromising excellence',
                    score: 0.8
                  },
                  {
                    category: 'Customer Focus',
                    description: 'Client satisfaction first',
                    score: 0.85
                  }
                ]
              })
            }
          }
        ]
      }
    });
  }

  // ElevenLabs API mocking
  async setupElevenLabsDefaults(): Promise<void> {
    // Mock voice list
    await this.mockAPI(/.*api\.elevenlabs\.io\/v1\/voices.*/, {
      status: 200,
      body: {
        voices: [
          {
            voice_id: 'voice-1',
            name: 'Professional Male',
            description: 'Clear professional voice'
          },
          {
            voice_id: 'voice-2',
            name: 'Friendly Female',
            description: 'Warm conversational voice'
          }
        ]
      }
    });

    // Mock text-to-speech generation
    await this.mockAPI(/.*api\.elevenlabs\.io\/v1\/text-to-speech.*/, {
      status: 200,
      body: Buffer.from('mock-audio-data'),
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    });
  }

  // Generic API mocking utility
  async mockAPI(urlPattern: RegExp | string, response: MockResponse): Promise<void> {
    const routeHandler = async (route: Route) => {
      // Add delay if specified
      if (response.delay) {
        await new Promise(resolve => setTimeout(resolve, response.delay));
      }

      await route.fulfill({
        status: response.status,
        body: typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          ...response.headers
        }
      });
    };

    await this.page.route(urlPattern, routeHandler);
    
    const key = urlPattern.toString();
    this.activeMocks.set(key, response);
  }

  // Scenario-based mocking
  async applyScenario(scenario: MockScenario): Promise<void> {
    console.log(`🎭 Applying mock scenario: ${scenario.name}`);
    
    for (const [url, response] of Object.entries(scenario.mocks)) {
      await this.mockAPI(new RegExp(url), response);
    }
  }

  // Predefined test scenarios
  getScenarios(): Record<string, MockScenario> {
    return {
      // Happy path - everything works
      success: {
        name: 'Success Path',
        description: 'All APIs return success responses',
        mocks: {
          '.*api\\.creatomate\\.com.*': {
            status: 200,
            body: { status: 'succeeded', output_url: 'mock-video.mp4' }
          },
          '.*api\\.openai\\.com.*': {
            status: 200,
            body: { choices: [{ message: { content: 'Mock response' } }] }
          }
        }
      },

      // Network failures
      networkError: {
        name: 'Network Errors',
        description: 'APIs return network errors',
        mocks: {
          '.*api\\.creatomate\\.com.*': {
            status: 500,
            body: { error: 'Internal server error' }
          },
          '.*api\\.openai\\.com.*': {
            status: 503,
            body: { error: 'Service unavailable' }
          }
        }
      },

      // Rate limiting
      rateLimited: {
        name: 'Rate Limited',
        description: 'APIs return rate limit errors',
        mocks: {
          '.*api\\.creatomate\\.com.*': {
            status: 429,
            body: { error: 'Rate limit exceeded' },
            headers: { 'Retry-After': '60' }
          },
          '.*api\\.openai\\.com.*': {
            status: 429,
            body: { error: 'Rate limit exceeded' }
          }
        }
      },

      // Slow responses
      slowResponse: {
        name: 'Slow Responses',
        description: 'APIs respond slowly',
        mocks: {
          '.*api\\.creatomate\\.com.*': {
            status: 200,
            body: { status: 'processing' },
            delay: 5000 // 5 second delay
          },
          '.*api\\.openai\\.com.*': {
            status: 200,
            body: { choices: [{ message: { content: 'Slow response' } }] },
            delay: 3000 // 3 second delay
          }
        }
      },

      // Rendering failure
      renderFailure: {
        name: 'Render Failure',
        description: 'Video rendering fails',
        mocks: {
          '.*api\\.creatomate\\.com.*renders.*': {
            status: 200,
            body: { 
              status: 'failed', 
              error: 'Template processing failed',
              error_code: 'TEMPLATE_ERROR'
            }
          }
        }
      },

      // Partial failures
      partialFailure: {
        name: 'Partial Failures',
        description: 'Some APIs fail, others succeed',
        mocks: {
          '.*api\\.creatomate\\.com.*': {
            status: 200,
            body: { status: 'succeeded', output_url: 'mock-video.mp4' }
          },
          '.*api\\.openai\\.com.*': {
            status: 500,
            body: { error: 'OpenAI service error' }
          },
          '.*api\\.elevenlabs\\.io.*': {
            status: 200,
            body: Buffer.from('mock-audio')
          }
        }
      }
    };
  }

  // Mock WebSocket connections for real-time updates
  async mockWebSocket(): Promise<void> {
    await this.page.addInitScript(() => {
      // Mock WebSocket for render progress updates
      (window as any).WebSocket = class MockWebSocket {
        url: string;
        onopen: ((event: any) => void) | null = null;
        onmessage: ((event: any) => void) | null = null;
        onclose: ((event: any) => void) | null = null;
        onerror: ((event: any) => void) | null = null;

        constructor(url: string) {
          this.url = url;
          
          // Simulate connection opening
          setTimeout(() => {
            if (this.onopen) {
              this.onopen({ type: 'open' });
            }
            
            // Send mock progress updates
            this.simulateProgress();
          }, 100);
        }

        simulateProgress() {
          const progressValues = [10, 25, 50, 75, 90, 100];
          let index = 0;
          
          const interval = setInterval(() => {
            if (index >= progressValues.length) {
              clearInterval(interval);
              
              // Send completion message
              if (this.onmessage) {
                this.onmessage({
                  data: JSON.stringify({
                    type: 'render_complete',
                    render_id: 'mock-render-id',
                    output_url: 'https://mock-output.com/video.mp4',
                    status: 'succeeded'
                  })
                });
              }
              return;
            }
            
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'render_progress',
                  render_id: 'mock-render-id',
                  progress: progressValues[index],
                  status: 'processing'
                })
              });
            }
            
            index++;
          }, 1000);
        }

        send(data: string) {
          console.log('Mock WebSocket send:', data);
        }

        close() {
          if (this.onclose) {
            this.onclose({ type: 'close', code: 1000 });
          }
        }
      };
    });
  }

  // Clear all mocks
  async clearMocks(): Promise<void> {
    await this.page.unrouteAll();
    this.activeMocks.clear();
    console.log('🧹 API mocks cleared');
  }

  // Get active mocks (for debugging)
  getActiveMocks(): Map<string, MockResponse> {
    return this.activeMocks;
  }

  // Mock authentication endpoints
  async mockAuthEndpoints(): Promise<void> {
    // Mock successful login
    await this.mockAPI(/.*\/api\/auth\/login.*/, {
      status: 200,
      body: {
        success: true,
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'user'
        },
        token: 'mock-jwt-token'
      }
    });

    // Mock token refresh
    await this.mockAPI(/.*\/api\/auth\/refresh.*/, {
      status: 200,
      body: {
        success: true,
        token: 'refreshed-mock-jwt-token'
      }
    });

    // Mock logout
    await this.mockAPI(/.*\/api\/auth\/logout.*/, {
      status: 200,
      body: { success: true }
    });
  }
}