/**
 * @jest-environment jsdom
 */

import { interpret } from 'xstate';
import { workflowMachine, createWorkflowMachine } from '../workflow-machine';
import {
  BriefData,
  Motivation,
  CopyVariation,
  Asset,
  Template} from '../workflow-types';

describe('Workflow State Machine', () => {
  let service: ReturnType<typeof interpret>;

  beforeEach(() => {
    service = interpret(workflowMachine);
    service.start();
  });

  afterEach(() => {
    if (service) {
      service.stop();
    }
  });

  describe('Initial State', () => {
    it('should start in briefUpload state', () => {
      expect(service.state.value).toBe('briefUpload');
    });

    it('should have correct initial context', () => {
      const context = service.state.context;
      expect(context.currentStep).toBe(0);
      expect(context.briefData).toBeNull();
      expect(context.motivations).toEqual([]);
      expect(context.copyVariations).toEqual([]);
      expect(context.selectedAssets).toEqual([]);
      expect(context.selectedTemplate).toBeNull();
      expect(context.processing).toBe(false);
    });
  });

  describe('Brief Upload Flow', () => {
    it('should handle file upload', () => {
      const mockFile = new File(['test content'], 'brief.txt', { type: 'text/plain' });
      
      service.send({ 
        type: 'UPLOAD_BRIEF', 
        file: mockFile 
      });

      const context = service.state.context;
      expect(context.uploadedFile).toBe(mockFile);
      expect(context.showBriefReview).toBe(true);
    });

    it('should transition to motivationSelection when brief is confirmed', () => {
      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: mockBriefData 
      });

      expect(service.state.value).toBe('motivationSelection');
      expect(service.state.context.briefData).toEqual(mockBriefData);
      expect(service.state.context.briefConfirmed).toBe(true);
      expect(service.state.context.currentStep).toBe(1);
    });

    it('should not transition without brief data', () => {
      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: null 
      });

      expect(service.state.value).toBe('briefUpload');
    });

    it('should handle errors in brief upload', () => {
      const error = 'Failed to parse file';
      
      service.send({ 
        type: 'SET_ERROR', 
        error 
      });

      expect(service.state.context.lastError).toBe(error);
    });

    it('should clear errors', () => {
      service.send({ 
        type: 'SET_ERROR', 
        error: 'Test error' 
      });
      
      service.send({ type: 'CLEAR_ERROR' });

      expect(service.state.context.lastError).toBeNull();
    });
  });

  describe('Motivation Selection Flow', () => {
    beforeEach(() => {
      // Setup to motivationSelection state
      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: mockBriefData 
      });

      // Add some motivations to context manually for testing
      service.state.context.motivations = [
        { id: '1', title: 'Motivation 1', description: 'First motivation', selected: false  },
        { id: '2', title: 'Motivation 2', description: 'Second motivation', selected: false  }
      ] as Motivation[];
    });

    it('should handle motivation selection', () => {
      service.send({ 
        type: 'SELECT_MOTIVATION', 
        id: '1' 
      });

      const motivation = service.state.context.motivations.find((m: Motivation) => m.id === '1');
      expect(motivation?.selected).toBe(true);
    });

    it('should handle motivation deselection', () => {
      // First select, then deselect
      service.send({ 
        type: 'SELECT_MOTIVATION', 
        id: '1' 
      });
      service.send({ 
        type: 'SELECT_MOTIVATION', 
        id: '1' 
      });

      const motivation = service.state.context.motivations.find((m: Motivation) => m.id === '1');
      expect(motivation?.selected).toBe(false);
    });

    it('should transition to copyGeneration when motivations are selected', () => {
      service.send({ 
        type: 'SELECT_MOTIVATION', 
        id: '1' 
      });
      
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('copyGeneration');
      expect(service.state.context.currentStep).toBe(2);
    });

    it('should not transition without selected motivations', () => {
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('motivationSelection');
    });

    it('should go back to briefUpload on previous step', () => {
      service.send({ type: 'PREVIOUS_STEP' });

      expect(service.state.value).toBe('briefUpload');
      expect(service.state.context.currentStep).toBe(0);
    });
  });

  describe('Copy Generation Flow', () => {
    beforeEach(() => {
      // Setup to copyGeneration state
      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: mockBriefData 
      });

      service.state.context.motivations = [
        { id: '1', title: 'Motivation 1', description: 'First motivation', selected: true  }
      ] as Motivation[];

      service.send({ type: 'NEXT_STEP' });

      // Add copy variations for testing
      service.state.context.copyVariations = [
        { id: '1', headline: 'Copy 1', body: 'Body 1', cta: 'CTA 1', selected: false  },
        { id: '2', headline: 'Copy 2', body: 'Body 2', cta: 'CTA 2', selected: false  }
      ] as CopyVariation[];
    });

    it('should handle copy selection', () => {
      service.send({ 
        type: 'SELECT_COPY', 
        id: '1' 
      });

      const copy = service.state.context.copyVariations.find((c: CopyVariation) => c.id === '1');
      expect(copy?.selected).toBe(true);
    });

    it('should handle copy deselection', () => {
      service.send({ 
        type: 'SELECT_COPY', 
        id: '1' 
      });
      service.send({ 
        type: 'SELECT_COPY', 
        id: '1' 
      });

      const copy = service.state.context.copyVariations.find((c: CopyVariation) => c.id === '1');
      expect(copy?.selected).toBe(false);
    });

    it('should transition to assetSelection when copy is selected', () => {
      service.send({ 
        type: 'SELECT_COPY', 
        id: '1' 
      });
      
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('assetSelection');
      expect(service.state.context.currentStep).toBe(3);
    });

    it('should not transition without selected copy', () => {
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('copyGeneration');
    });

    it('should go back to motivationSelection on previous step', () => {
      service.send({ type: 'PREVIOUS_STEP' });

      expect(service.state.value).toBe('motivationSelection');
      expect(service.state.context.currentStep).toBe(1);
    });
  });

  describe('Asset Selection Flow', () => {
    beforeEach(() => {
      // Setup to assetSelection state
      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: mockBriefData 
      });

      service.state.context.motivations = [
        { id: '1', title: 'Motivation 1', description: 'First motivation', selected: true  }
      ] as Motivation[];

      service.state.context.copyVariations = [
        { id: '1', headline: 'Copy 1', body: 'Body 1', cta: 'CTA 1', selected: true  }
      ] as CopyVariation[];

      service.send({ type: 'NEXT_STEP' });
      service.send({ type: 'NEXT_STEP' });
    });

    it('should handle asset selection', () => {
      const mockAsset: Asset = {
        id: 'asset-1',
        name: 'Test Asset',
        url: 'https://example.com/asset.jpg',
        type: 'image',
        category: 'logo'};

      service.send({ 
        type: 'SELECT_ASSET', 
        asset: mockAsset 
      });

      expect(service.state.context.selectedAssets).toContain(mockAsset);
    });

    it('should handle asset deselection', () => {
      const mockAsset: Asset = {
        id: 'asset-1',
        name: 'Test Asset',
        url: 'https://example.com/asset.jpg',
        type: 'image',
        category: 'logo'};

      service.send({ 
        type: 'SELECT_ASSET', 
        asset: mockAsset 
      });
      service.send({ 
        type: 'SELECT_ASSET', 
        asset: mockAsset 
      });

      expect(service.state.context.selectedAssets).not.toContain(mockAsset);
    });

    it('should transition to templateSelection when assets are selected', () => {
      const mockAsset: Asset = {
        id: 'asset-1',
        name: 'Test Asset',
        url: 'https://example.com/asset.jpg',
        type: 'image',
        category: 'logo'};

      service.send({ 
        type: 'SELECT_ASSET', 
        asset: mockAsset 
      });
      
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('templateSelection');
      expect(service.state.context.currentStep).toBe(4);
    });

    it('should not transition without selected assets', () => {
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('assetSelection');
    });
  });

  describe('Template Selection Flow', () => {
    beforeEach(() => {
      // Setup to templateSelection state with all prerequisites
      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: mockBriefData 
      });

      service.state.context.motivations = [
        { id: '1', title: 'Motivation 1', description: 'First motivation', selected: true  }
      ] as Motivation[];

      service.state.context.copyVariations = [
        { id: '1', headline: 'Copy 1', body: 'Body 1', cta: 'CTA 1', selected: true  }
      ] as CopyVariation[];

      const mockAsset: Asset = {
        id: 'asset-1',
        name: 'Test Asset',
        url: 'https://example.com/asset.jpg',
        type: 'image',
        category: 'logo'};

      service.send({ type: 'NEXT_STEP' });
      service.send({ type: 'NEXT_STEP' });
      service.send({ 
        type: 'SELECT_ASSET', 
        asset: mockAsset 
      });
      service.send({ type: 'NEXT_STEP' });
    });

    it('should handle template selection', () => {
      const mockTemplate: Template = {
        id: 'template-1',
        name: 'Test Template',
        description: 'A test template',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        category: 'social',
        duration: 30,
        aspectRatio: '16:9'};

      service.send({ 
        type: 'SELECT_TEMPLATE', 
        template: mockTemplate 
      });

      expect(service.state.context.selectedTemplate).toBe(mockTemplate);
    });

    it('should transition to matrixBuild when template is selected', () => {
      const mockTemplate: Template = {
        id: 'template-1',
        name: 'Test Template',
        description: 'A test template',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        category: 'social',
        duration: 30,
        aspectRatio: '16:9'};

      service.send({ 
        type: 'SELECT_TEMPLATE', 
        template: mockTemplate 
      });
      
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('matrixBuild');
      expect(service.state.context.currentStep).toBe(5);
    });

    it('should not transition without selected template', () => {
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('templateSelection');
    });
  });

  describe('Matrix Build and Rendering Flow', () => {
    beforeEach(() => {
      // Setup complete workflow state
      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      const mockTemplate: Template = {
        id: 'template-1',
        name: 'Test Template',
        description: 'A test template',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        category: 'social',
        duration: 30,
        aspectRatio: '16:9'};

      const mockAsset: Asset = {
        id: 'asset-1',
        name: 'Test Asset',
        url: 'https://example.com/asset.jpg',
        type: 'image',
        category: 'logo'};

      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: mockBriefData 
      });

      service.state.context.motivations = [
        { id: '1', title: 'Motivation 1', description: 'First motivation', selected: true  }
      ] as Motivation[];

      service.state.context.copyVariations = [
        { id: '1', headline: 'Copy 1', body: 'Body 1', cta: 'CTA 1', selected: true  }
      ] as CopyVariation[];

      service.state.context.selectedAssets = [mockAsset];
      service.state.context.selectedTemplate = mockTemplate;

      // Navigate to matrixBuild
      service.send({ type: 'GO_TO_STEP', step: 5 });
    });

    it('should transition to rendering when all requirements are met', () => {
      service.send({ type: 'NEXT_STEP' });

      expect(service.state.value).toBe('rendering');
      expect(service.state.context.currentStep).toBe(6);
    });

    it('should handle workflow reset from rendering', () => {
      service.send({ type: 'NEXT_STEP' });
      service.send({ type: 'RESET_WORKFLOW' });

      expect(service.state.value).toBe('briefUpload');
      expect(service.state.context.currentStep).toBe(0);
      expect(service.state.context.briefData).toBeNull();
      expect(service.state.context.selectedAssets).toEqual([]);
      expect(service.state.context.selectedTemplate).toBeNull();
    });
  });

  describe('Navigation and Step Management', () => {
    beforeEach(() => {
      // Setup a complete workflow for navigation testing
      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: mockBriefData 
      });

      service.state.context.motivations = [
        { id: '1', title: 'Motivation 1', description: 'First motivation', selected: true  }
      ] as Motivation[];

      service.state.context.copyVariations = [
        { id: '1', headline: 'Copy 1', body: 'Body 1', cta: 'CTA 1', selected: true  }
      ] as CopyVariation[];

      service.state.context.selectedAssets = [{
        id: 'asset-1',
        name: 'Test Asset',
        url: 'https://example.com/asset.jpg',
        type: 'image',
        category: 'logo'}];

      service.state.context.selectedTemplate = {
        id: 'template-1',
        name: 'Test Template',
        description: 'A test template',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        category: 'social',
        duration: 30,
        aspectRatio: '16:9'};
    });

    it('should allow direct navigation to valid steps', () => {
      service.send({ type: 'GO_TO_STEP', step: 3 });
      expect(service.state.value).toBe('assetSelection');
      expect(service.state.context.currentStep).toBe(3);
    });

    it('should not allow navigation to invalid steps without prerequisites', () => {
      // Start fresh without prerequisites
      service.send({ type: 'RESET_WORKFLOW' });
      
      service.send({ type: 'GO_TO_STEP', step: 3 });
      
      // Should remain in briefUpload since no brief data
      expect(service.state.value).toBe('briefUpload');
    });

    it('should handle boundary step values', () => {
      // GO_TO_STEP with negative values should clamp to 0 in the action
      // but the actual navigation depends on prerequisites and guards
      service.send({ type: 'GO_TO_STEP', step: -1 });
      // Step will be clamped to 0 in the action, but state might not change if guards fail
      expect(service.state.context.currentStep).toBeGreaterThanOrEqual(0);

      service.send({ type: 'GO_TO_STEP', step: 10 });
      // Step will be clamped to 6 max, but navigation depends on prerequisites
      expect(service.state.context.currentStep).toBeLessThanOrEqual(6);
    });
  });

  describe('Error Handling', () => {
    it('should maintain error state across transitions', () => {
      service.send({ 
        type: 'SET_ERROR', 
        error: 'Test error' 
      });

      expect(service.state.context.lastError).toBe('Test error');

      // Error should persist when staying in the same state
      service.send({ type: 'UPLOAD_BRIEF', file: new File([''], 'test.txt') });
      expect(service.state.context.lastError).toBe('Test error');
    });

    it('should clear errors on state transitions with clearError entry', () => {
      service.send({ 
        type: 'SET_ERROR', 
        error: 'Test error' 
      });

      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      service.send({ 
        type: 'CONFIRM_BRIEF', 
        briefData: mockBriefData 
      });

      // Error should be cleared when entering motivationSelection
      expect(service.state.context.lastError).toBeNull();
    });
  });

  describe('Machine Factory', () => {
    it('should create machine with custom client ID', () => {
      const clientId = 'client-123';
      const customMachine = createWorkflowMachine(clientId);

      expect(customMachine.context.clientId).toBe(clientId);
    });

    it('should create machine without client ID', () => {
      const customMachine = createWorkflowMachine();

      expect(customMachine.context.clientId).toBeNull();
    });
  });

  describe('Complex Workflows', () => {
    it('should handle complete workflow execution', () => {
      const mockBriefData: BriefData = {
        title: 'Complete Brief',
        content: 'Complete content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      const mockAsset: Asset = {
        id: 'asset-1',
        name: 'Test Asset',
        url: 'https://example.com/asset.jpg',
        type: 'image',
        category: 'logo'};

      const mockTemplate: Template = {
        id: 'template-1',
        name: 'Test Template',
        description: 'A test template',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        category: 'social',
        duration: 30,
        aspectRatio: '16:9'};

      // Complete workflow execution
      service.send({ type: 'CONFIRM_BRIEF', briefData: mockBriefData });
      expect(service.state.value).toBe('motivationSelection');

      service.state.context.motivations = [
        { id: '1', title: 'Motivation 1', description: 'First motivation', selected: false  }
      ] as Motivation[];

      service.send({ type: 'SELECT_MOTIVATION', id: '1' });
      service.send({ type: 'NEXT_STEP' });
      expect(service.state.value).toBe('copyGeneration');

      service.state.context.copyVariations = [
        { id: '1', headline: 'Copy 1', body: 'Body 1', cta: 'CTA 1', selected: false  }
      ] as CopyVariation[];

      service.send({ type: 'SELECT_COPY', id: '1' });
      service.send({ type: 'NEXT_STEP' });
      expect(service.state.value).toBe('assetSelection');

      service.send({ type: 'SELECT_ASSET', asset: mockAsset });
      service.send({ type: 'NEXT_STEP' });
      expect(service.state.value).toBe('templateSelection');

      service.send({ type: 'SELECT_TEMPLATE', template: mockTemplate });
      service.send({ type: 'NEXT_STEP' });
      expect(service.state.value).toBe('matrixBuild');

      service.send({ type: 'NEXT_STEP' });
      expect(service.state.value).toBe('rendering');

      // Verify final state
      expect(service.state.context.currentStep).toBe(6);
      expect(service.state.context.briefData).toEqual(mockBriefData);
      expect(service.state.context.selectedAssets).toContain(mockAsset);
      expect(service.state.context.selectedTemplate).toBe(mockTemplate);
    });

    it('should handle partial workflow reset and continuation', () => {
      const mockBriefData: BriefData = {
        title: 'Test Brief',
        content: 'Test content',
        objectives: ['Increase awareness'],
        targetAudience: 'Young adults',
        brandGuidelines: 'Use brand colors',
        keyMessages: ['Quality first'],
        callToAction: 'Buy now',
        deliverables: ['Video ads'],
        timeline: '2 weeks',
        budget: '$5000',
        additionalNotes: 'Important campaign'};

      // Start workflow
      service.send({ type: 'CONFIRM_BRIEF', briefData: mockBriefData });
      
      service.state.context.motivations = [
        { id: '1', title: 'Motivation 1', description: 'First motivation', selected: false  }
      ] as Motivation[];
      
      service.send({ type: 'SELECT_MOTIVATION', id: '1' });

      // Reset and start again
      service.send({ type: 'RESET_WORKFLOW' });
      expect(service.state.value).toBe('briefUpload');
      expect(service.state.context.briefData).toBeNull();

      // Continue with new brief
      const newBriefData: BriefData = {
        title: 'New Brief',
        content: 'New content',
        objectives: ['Different objective'],
        targetAudience: 'Adults',
        brandGuidelines: 'New guidelines',
        keyMessages: ['New message'],
        callToAction: 'Click here',
        deliverables: ['Banner ads'],
        timeline: '1 week',
        budget: '$2000',
        additionalNotes: 'New campaign'};

      service.send({ type: 'CONFIRM_BRIEF', briefData: newBriefData });
      expect(service.state.context.briefData).toEqual(newBriefData);
    });
  });
});