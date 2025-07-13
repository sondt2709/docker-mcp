import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";

export function registerDockerContainerStop(
  server: McpServer,
  dockerService: DockerService
): void {
  server.registerTool(
    "docker_container_stop",
    {
      title: "Stop Docker Container",
      description: "Stop a running container",
      inputSchema: {
        containerId: z.string().describe("Container ID or name"),
        timeout: z.number().optional().describe("Timeout in seconds (default: 10)")
      }
    },
    async ({ containerId, timeout }) => {
      try {
        await dockerService.stopContainer(containerId, timeout);
        
        return {
          content: [{
            type: "text",
            text: `Successfully stopped container ${containerId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `Error stopping container ${containerId}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
