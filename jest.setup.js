import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock NextResponse
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      statusText: init?.statusText || "OK",
    }),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock Request and Response for API routes
global.Request = class Request {
  constructor(input, init) {
    this.url = input;
    this.method = init?.method || "GET";
    this.headers = new Map(Object.entries(init?.headers || {}));
    this._body = init?.body;
  }

  async json() {
    return JSON.parse(this._body || "{}");
  }

  async text() {
    return this._body || "";
  }
};

global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || "OK";
    this.headers = new Map(Object.entries(init?.headers || {}));
  }

  async json() {
    return JSON.parse(this.body || "{}");
  }

  async text() {
    return this.body || "";
  }
};

// Mock window.open
Object.defineProperty(window, "open", {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
