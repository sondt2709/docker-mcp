import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";

export function registerDockerContainerStart(
  server: McpServer,
  dockerService: DockerService
): void {
  server.registerTool(
    "docker_container_start",
    {
      title: "Start Docker Container",
      description: "Start a stopped container",
      inputSchema: {
        containerId: z.string().describe("Container ID or name")
      }
    },
    async ({ containerId }) => {
      try {
        await dockerService.startContainer(containerId);
        
        return {
          content: [{
            type: "text",
            text: `Successfully started container ${containerId}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `Error starting container ${containerId}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
