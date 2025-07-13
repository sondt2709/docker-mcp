import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";

export function registerDockerContainerInspect(
  server: McpServer,
  dockerService: DockerService
): void {
  server.registerTool(
    "docker_container_inspect",
    {
      title: "Inspect Docker Container",
      description: "Get detailed information about a specific container",
      inputSchema: {
        containerId: z.string().describe("Container ID or name")
      }
    },
    async ({ containerId }) => {
      try {
        const inspection = await dockerService.inspectContainer(containerId);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(inspection, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `Error inspecting container ${containerId}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
