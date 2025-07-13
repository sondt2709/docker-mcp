// Global test utilities and helpers for TDD

export const testUtils = {
  // Create a mock dockerode instance for testing
  createMockDockerode: () => ({
    listContainers: jest.fn(),
    getContainer: jest.fn(),
    getSystem: jest.fn(),
    version: jest.fn(),
    info: jest.fn(),
  }),

  // Mock console methods to prevent test output noise
  mockConsole: () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  },

  // Sample test data for Docker containers
  mockContainerData: {
    running: {
      Id: 'abc123',
      Names: ['/test-container'],
      Image: 'nginx:latest',
      State: 'running',
      Status: 'Up 2 hours',
      Ports: [{ PrivatePort: 80, PublicPort: 8080, Type: 'tcp' }]
    },
    stopped: {
      Id: 'def456',
      Names: ['/stopped-container'],
      Image: 'redis:alpine',
      State: 'exited',
      Status: 'Exited (0) 1 hour ago',
      Ports: []
    }
  },

  // Sample Docker system info
  mockSystemInfo: {
    Containers: 5,
    ContainersRunning: 2,
    ContainersPaused: 0,
    ContainersStopped: 3,
    Images: 10,
    MemTotal: 8589934592,
    NCPU: 4,
    DockerRootDir: '/var/lib/docker'
  },

  // Sample Docker version data
  mockVersionInfo: {
    Version: '24.0.0',
    ApiVersion: '1.43',
    GitCommit: 'abcdef',
    GoVersion: 'go1.20.0',
    Os: 'linux',
    Arch: 'amd64'
  }
};
