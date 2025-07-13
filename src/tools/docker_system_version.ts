import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";

export function registerDockerSystemVersion(
  server: McpServer,
  dockerService: DockerService
): void {
  server.registerTool(
    "docker_system_version",
    {
      title: "Docker Version Information",
      description: "Get Docker version information",
      inputSchema: {}
    },
    async () => {
      try {
        const version = await dockerService.getVersion();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(version, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `Error getting version info: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
