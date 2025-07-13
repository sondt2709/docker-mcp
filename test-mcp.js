#!/usr/bin/env node

/**
 * Test script for Docker MCP Server
 * This script simulates MCP client requests to test the server functionality
 */

import { spawn } from 'child_process';
import { stdin, stdout } from 'process';

const mcpServer = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Test cases
const testCases = [
  {
    name: 'List all containers',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'docker_container_list',
        arguments: { all: true }
      }
    }
  },
  {
    name: 'List tools',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }
  },
  {
    name: 'Get Docker version',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'docker_system_version',
        arguments: {}
      }
    }
  },
  {
    name: 'Get Docker system info',
    request: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'docker_system_info',
        arguments: {}
      }
    }
  }
];

console.log('Testing Docker MCP Server...\n');

let testIndex = 0;
let responses = [];

function runNextTest() {
  if (testIndex >= testCases.length) {
    console.log('\n✅ All tests completed!');
    console.log('\nTest Results:');
    responses.forEach((response, index) => {
      console.log(`${index + 1}. ${testCases[index].name}: ${response.error ? '❌ FAILED' : '✅ PASSED'}`);
      if (response.error) {
        console.log(`   Error: ${response.error.message}`);
      }
    });
    mcpServer.kill();
    process.exit(0);
  }

  const testCase = testCases[testIndex];
  console.log(`Running test ${testIndex + 1}: ${testCase.name}`);
  
  mcpServer.stdin.write(JSON.stringify(testCase.request) + '\n');
  testIndex++;
}

mcpServer.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      if (response.jsonrpc === '2.0' && response.id) {
        responses.push(response);
        console.log(`✅ Test ${response.id} completed`);
        
        setTimeout(() => {
          runNextTest();
        }, 100);
      }
    } catch (e) {
      // Ignore non-JSON lines (server logs)
    }
  });
});

mcpServer.stderr.on('data', (data) => {
  // Server logs, ignore for now
});

mcpServer.on('close', (code) => {
  console.log(`\nMCP Server exited with code ${code}`);
});

// Start the first test
setTimeout(() => {
  runNextTest();
}, 1000); // Wait for server to start
