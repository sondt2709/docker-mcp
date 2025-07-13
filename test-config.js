#!/usr/bin/env node

/**
 * Simple test script to verify Docker MCP remote configuration parsing
 */

import { parseSSHConfig, parseConnectionString, createDockerOptions } from './dist/utils/docker-config.js';

function testSSHConfigParsing() {
  console.log('Testing SSH Config Parsing...');
  
  // Test parseConnectionString
  const testCases = [
    'ubuntu@192.168.1.100:22',
    'root@server.example.com',
    '192.168.1.100:2222',
    'test-server'
  ];
  
  testCases.forEach(connectionString => {
    const result = parseConnectionString(connectionString);
    console.log(`  ${connectionString} -> ${JSON.stringify(result)}`);
  });
  
  console.log('');
}

function testDockerOptionsCreation() {
  console.log('Testing Docker Options Creation...');
  
  // Test local Docker options
  const localOptions = createDockerOptions();
  console.log('  Local Docker:', { socketPath: localOptions.socketPath });
  
  // Test remote Docker options
  const remoteOptions = createDockerOptions({
    remote: {
      host: 'test-server',
      username: 'ubuntu',
      port: 22
    }
  });
  console.log('  Remote Docker:', {
    host: remoteOptions.host,
    port: remoteOptions.port,
    username: remoteOptions.username,
    socketPath: remoteOptions.socketPath
  });
  
  console.log('');
}

function testEnvironmentVariables() {
  console.log('Testing Environment Variables...');
  
  // Save original values
  const originalHost = process.env.DOCKER_MCP_HOST;
  const originalUsername = process.env.DOCKER_MCP_USERNAME;
  
  try {
    // Test with environment variables
    process.env.DOCKER_MCP_HOST = 'env-test-server';
    process.env.DOCKER_MCP_USERNAME = 'env-user';
    
    const options = createDockerOptions({
      remote: {
        host: process.env.DOCKER_MCP_HOST,
        username: process.env.DOCKER_MCP_USERNAME
      }
    });
    
    console.log('  Environment Variables:', {
      host: options.host,
      username: options.username
    });
    
  } finally {
    // Restore original values
    if (originalHost) {
      process.env.DOCKER_MCP_HOST = originalHost;
    } else {
      delete process.env.DOCKER_MCP_HOST;
    }
    
    if (originalUsername) {
      process.env.DOCKER_MCP_USERNAME = originalUsername;
    } else {
      delete process.env.DOCKER_MCP_USERNAME;
    }
  }
  
  console.log('');
}

function main() {
  console.log('Docker MCP Configuration Test\n');
  
  testSSHConfigParsing();
  testDockerOptionsCreation();
  testEnvironmentVariables();
  
  console.log('All tests completed!');
}

main();
