#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DockerMcpServer } from "./server/DockerMcpServer.js";
import { loadServerConfig, printConfigHelp, printCurrentConfig } from "./utils/config-loader.js";

async function main() {
  // Handle command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    printConfigHelp();
    process.exit(0);
  }
  
  // Load configuration
  const config = loadServerConfig();
  
  if (args.includes('--config')) {
    printCurrentConfig(config);
    process.exit(0);
  }
  
  console.error("Starting Docker MCP Server...");
  
  try {
    // Create Docker MCP server instance with the configured Docker options
    const server = new DockerMcpServer({
      name: config.name,
      version: config.version,
      dockerOptions: config.dockerOptions,
    });

    // Register all Docker tools
    await server.registerAllTools();

    // Setup stdio transport for MCP communication
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("Docker MCP Server is running and ready to accept connections");
  } catch (error) {
    console.error("Failed to start Docker MCP Server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
