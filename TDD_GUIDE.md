# Test-Driven Development (TDD) Guide for Docker MCP

## 🚀 TDD Workflow

### 1. Write Test First
```bash
npm test:watch  # Start Jest in watch mode for continuous testing
```

### 2. Run Tests (They Should Fail)
Tests should fail initially since the implementation doesn't exist yet.

### 3. Implement Just Enough Code
Write minimal code to make tests pass.

### 4. Refactor
Improve code while keeping tests green.

## 📁 Test Structure

```
src/
├── __tests__/
│   ├── setup.test.ts           # Jest setup validation
│   ├── services/
│   │   └── DockerService.test.ts # Service layer tests
│   └── tools/
│       └── docker-tools.test.ts  # MCP tool tests
```

## 🛠️ Available Test Scripts

```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode (best for TDD)
npm run test:coverage # Run tests with coverage report
npm run test:ci       # Run tests for CI/CD (no watch, coverage)
```

## 📝 TDD Examples in Your Tests

### 1. **Service Layer TDD** (`src/__tests__/services/DockerService.test.ts`)
Tests that define how your Docker service classes should behave:

```typescript
describe('DockerService (TDD)', () => {
  it('should return formatted container list', async () => {
    // Define expected format BEFORE implementing
    const expectedFormat = {
      id: 'abc123def456',
      name: 'test-container',
      image: 'nginx:latest',
      state: 'running'
    };
    // TODO: Implement DockerService.listContainers()
  });
});
```

### 2. **Tool Layer TDD** (`src/__tests__/tools/docker-tools.test.ts`)
Tests that define MCP tool interfaces:

```typescript
describe('docker_container_list tool', () => {
  it('should list all containers with proper formatting', async () => {
    // Define MCP response format BEFORE implementing
    const expectedResult = {
      content: [{
        type: "text",
        text: expect.stringContaining("Container ID")
      }]
    };
    // TODO: Implement MCP tool
  });
});
```

## 🎯 Current Test Status

**✅ Implemented & Tested (3 test suites, 19 tests)**
- Basic Jest setup validation
- TDD examples for future tools
- Service layer test templates

**🚧 Ready for TDD Implementation**
Based on your 40 planned tools, these are ready for TDD development:

### High Priority (Core Tools)
1. `remove_container` - Test already defined
2. `create_container` - Test already defined  
3. `cleanup_all` - Test already defined

### Next Phase
4. `follow_container_logs` - Streaming logs
5. `get_container_stats` - Resource monitoring
6. `execute_in_container` - Command execution

## 📋 TDD Development Process

### For Each New Tool:

1. **Write the Test First**
   ```typescript
   describe('new_tool_name', () => {
     it('should do expected behavior', async () => {
       const mockArgs = { /* test input */ };
       // Define expected output format
       const expectedResult = { /* expected response */ };
       
       // TODO: Implement tool
       expect(true).toBe(true); // Placeholder
     });
   });
   ```

2. **Run Test (Should Fail)**
   ```bash
   npm test:watch
   ```

3. **Implement Tool**
   - Create tool file in `src/tools/`
   - Add to tool registry
   - Make test pass

4. **Refactor & Add Edge Cases**
   - Add error handling tests
   - Add validation tests
   - Improve implementation

## 🧪 Test Utilities

Your project includes helpful test utilities:

```typescript
// Mock Docker responses
const mockDockerode = {
  listContainers: jest.fn(),
  getContainer: jest.fn(),
  version: jest.fn(),
  info: jest.fn()
};

// Test data examples in setup.test.ts
const mockContainerData = {
  running: { /* sample running container */ },
  stopped: { /* sample stopped container */ }
};
```

## 📊 Code Coverage

Run with coverage to see implementation progress:

```bash
npm run test:coverage
```

Target coverage thresholds (configured in jest.config.js):
- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

## 🚀 Next Steps for TDD

1. **Pick a tool** from your 40-tool roadmap
2. **Write tests first** defining the expected behavior
3. **Run tests** (they should fail)
4. **Implement** just enough to pass tests
5. **Refactor** and add more test cases
6. **Repeat** for next tool

## 💡 TDD Benefits for Your Project

- **Clear specifications** - Tests define exactly how tools should work
- **Prevents regressions** - Changes won't break existing functionality  
- **Better design** - Writing tests first leads to better API design
- **Confidence** - Refactor safely knowing tests will catch issues
- **Documentation** - Tests serve as living examples of tool usage
