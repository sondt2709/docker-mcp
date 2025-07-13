import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";

export function registerDockerContainerRestart(
  server: McpServer,
  dockerService: DockerService
): void {
  server.registerTool(
    "docker_container_restart",
    {
      title: "Restart Docker Container",
      description: "Restart a container",
      inputSchema: {
        containerId: z.string().describe("Container ID or name"),
        timeout: z.number().optional().describe("Timeout in seconds (default: 10)")
      }
    },
    async ({ containerId, timeout }) => {
      try {
        await dockerService.restartContainer(containerId, timeout);
        
        return {
          content: [{
            type: "text",
            text: `Successfully restarted container ${containerId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `Error restarting container ${containerId}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
