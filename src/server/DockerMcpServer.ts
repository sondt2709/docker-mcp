import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";
import { ComposeService } from "../services/ComposeService.js";
import { registerAllTools } from "../tools/index.js";
import Docker from "dockerode";
import { DockerConnectionConfig } from "../utils/docker-config.js";

export interface DockerMcpServerConfig {
  name: string;
  version: string;
  dockerOptions?: Docker.DockerOptions;
//   connectionConfig?: DockerConnectionConfig;
}

export class DockerMcpServer extends McpServer {
  private dockerService: DockerService;
  private composeService: ComposeService;
//   private connectionConfig?: DockerConnectionConfig;

  constructor(config: DockerMcpServerConfig) {
    super({
      name: config.name,
      version: config.version
    });
    
    // this.connectionConfig = config.connectionConfig;
    
    // Initialize Docker service with custom options if provided
    this.dockerService = new DockerService(config.dockerOptions);
    this.composeService = new ComposeService();
    
    console.error(`Docker MCP Server initialized: ${config.name} v${config.version}`);
    console.error(`Docker Options passed:`, JSON.stringify(config.dockerOptions, null, 2));
    
    // Log connection details
    if (config.dockerOptions?.protocol === 'ssh') {
      console.error(`Configured for remote Docker on: ${config.dockerOptions.username}@${config.dockerOptions.host}:${config.dockerOptions.port}`);
      console.error(`SSH Options: ${config.dockerOptions.sshOptions ? 'Private key loaded' : 'No SSH options'}`);
    } else if (config.dockerOptions?.host && config.dockerOptions?.host !== 'localhost') {
      console.error(`Configured for remote Docker on: ${config.dockerOptions.host}`);
    } else {
      console.error("Configured for local Docker daemon");
    }
  }

  async registerAllTools(): Promise<void> {
    try {
      // Test Docker connection
      await this.testDockerConnection();
      
      // Register all Docker tools
      registerAllTools(this, this.dockerService, this.composeService);
      
      console.error("All Docker tools registered successfully");
    } catch (error) {
      console.error("Failed to register Docker tools:", error);
      throw error;
    }
  }

  private async testDockerConnection(): Promise<void> {
    try {
      const version = await this.dockerService.getVersion();
      console.error(`Connected to Docker daemon: ${version.Version} (API: ${version.ApiVersion})`);
    } catch (error) {
      console.error("Failed to connect to Docker daemon:", error);
      throw new Error("Docker daemon is not accessible. Please ensure Docker is running and the socket is accessible.");
    }
  }

  getDockerService(): DockerService {
    return this.dockerService;
  }

  getComposeService(): ComposeService {
    return this.composeService;
  }
}
