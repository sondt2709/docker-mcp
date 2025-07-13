import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";

export function registerDockerSystemInfo(
  server: McpServer,
  dockerService: DockerService
): void {
  server.registerTool(
    "docker_system_info",
    {
      title: "Docker System Information",
      description: "Get Docker system information",
      inputSchema: {}
    },
    async () => {
      try {
        const info = await dockerService.getSystemInfo();
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(info, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `Error getting system info: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
