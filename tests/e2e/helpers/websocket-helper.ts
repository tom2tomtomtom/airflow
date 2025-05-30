import { Page, expect } from '@playwright/test';

export class WebSocketHelper {
  private wsMessages: any[] = [];
  private wsConnected = false;

  constructor(private page: Page) {}

  async setupWebSocketListeners() {
    // Listen for WebSocket events
    await this.page.evaluate(() => {
      // Store original WebSocket constructor
      const OriginalWebSocket = window.WebSocket;
      
      // Override WebSocket to capture events
      window.WebSocket = class extends OriginalWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          super(url, protocols);
          
          this.addEventListener('open', (event) => {
            (window as any).testWsConnected = true;
            console.log('WebSocket connected:', url);
          });
          
          this.addEventListener('message', (event) => {
            if (!(window as any).testWsMessages) {
              (window as any).testWsMessages = [];
            }
            (window as any).testWsMessages.push({
              timestamp: Date.now(),
              data: event.data
            });
            console.log('WebSocket message received:', event.data);
          });
          
          this.addEventListener('close', (event) => {
            (window as any).testWsConnected = false;
            console.log('WebSocket disconnected');
          });
          
          this.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);
          });
        }
      };
    });
  }

  async waitForConnection(timeout: number = 10000) {
    await this.page.waitForFunction(() => (window as any).testWsConnected === true, { timeout });
    this.wsConnected = true;
  }

  async waitForMessage(messageType?: string, timeout: number = 30000) {
    if (messageType) {
      await this.page.waitForFunction(
        (type) => {
          const messages = (window as any).testWsMessages || [];
          return messages.some((msg: any) => {
            try {
              const data = JSON.parse(msg.data);
              return data.type === type;
            } catch {
              return false;
            }
          });
        },
        messageType,
        { timeout }
      );
    } else {
      await this.page.waitForFunction(
        () => ((window as any).testWsMessages || []).length > 0,
        { timeout }
      );
    }
  }

  async getMessages(): Promise<any[]> {
    return await this.page.evaluate(() => (window as any).testWsMessages || []);
  }

  async getLastMessage(): Promise<any> {
    const messages = await this.getMessages();
    return messages[messages.length - 1];
  }

  async clearMessages() {
    await this.page.evaluate(() => {
      (window as any).testWsMessages = [];
    });
  }

  async waitForRenderProgress(expectedProgress: number, timeout: number = 60000) {
    await this.page.waitForFunction(
      (progress) => {
        const messages = (window as any).testWsMessages || [];
        return messages.some((msg: any) => {
          try {
            const data = JSON.parse(msg.data);
            return data.type === 'render_progress' && data.progress >= progress;
          } catch {
            return false;
          }
        });
      },
      expectedProgress,
      { timeout }
    );
  }

  async waitForRenderComplete(timeout: number = 300000) {
    await this.page.waitForFunction(
      () => {
        const messages = (window as any).testWsMessages || [];
        return messages.some((msg: any) => {
          try {
            const data = JSON.parse(msg.data);
            return data.type === 'render_complete' && data.status === 'success';
          } catch {
            return false;
          }
        });
      },
      { timeout }
    );
  }

  async isConnected(): Promise<boolean> {
    return await this.page.evaluate(() => (window as any).testWsConnected === true);
  }
}