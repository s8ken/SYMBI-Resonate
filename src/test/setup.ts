/**
 * Test Setup Configuration
 * 
 * Global test setup and configuration for Vitest testing environment.
 * Sets up testing utilities, mocks, and global configurations.
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  },
});

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress React error boundary and other expected warnings during tests
  console.error = vi.fn((message, ...args) => {
    // Allow real errors through but suppress React boundary warnings
    if (
      typeof message === 'string' && 
      (message.includes('Warning:') || 
       message.includes('The above error occurred') ||
       message.includes('React will try to recreate'))
    ) {
      return;
    }
    originalError(message, ...args);
  });
  
  console.warn = vi.fn((message, ...args) => {
    // Suppress specific warnings during tests
    if (
      typeof message === 'string' && 
      (message.includes('componentWillReceiveProps') ||
       message.includes('componentWillMount') ||
       message.includes('findDOMNode'))
    ) {
      return;
    }
    originalWarn(message, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test helpers
export const createMockAssessmentInput = () => ({
  content: 'This is a test content for SYMBI framework assessment.',
  metadata: {
    source: 'Test Source',
    author: 'Test Author',
    context: 'Test Context',
    timestamp: new Date().toISOString(),
  },
});

export const createMockAssessmentResult = () => ({
  assessment: {
    id: 'test-assessment-id',
    timestamp: new Date().toISOString(),
    contentId: 'test-content',
    realityIndex: {
      score: 7.5,
      missionAlignment: 7.0,
      contextualCoherence: 8.0,
      technicalAccuracy: 7.5,
      authenticity: 7.5,
    },
    trustProtocol: {
      status: 'PASS' as const,
      verificationMethods: 'PASS' as const,
      boundaryMaintenance: 'PASS' as const,
      securityAwareness: 'PASS' as const,
    },
    ethicalAlignment: {
      score: 3.5,
      limitationsAcknowledgment: 3.5,
      stakeholderAwareness: 3.5,
      ethicalReasoning: 3.5,
      boundaryMaintenance: 3.5,
    },
    resonanceQuality: {
      level: 'ADVANCED' as const,
      creativityScore: 7.0,
      synthesisQuality: 8.0,
      innovationMarkers: 7.5,
    },
    canvasParity: {
      score: 75,
      humanAgency: 75,
      aiContribution: 75,
      transparency: 75,
      collaborationQuality: 75,
    },
    overallScore: 75,
    validationStatus: 'VALID' as const,
  },
  insights: {
    strengths: ['Strong technical accuracy', 'Good collaboration quality'],
    weaknesses: ['Could improve creativity'],
    recommendations: ['Add more innovative elements', 'Enhance user engagement'],
  },
  validationDetails: {
    validatedBy: 'Test System',
    validationTimestamp: new Date().toISOString(),
  },
});

// Mock fetch for API tests
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});