import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";
import { z } from "zod";

export function registerDockerContainerLogs(server: McpServer, dockerService: DockerService): void {
  server.registerTool(
    "docker_container_logs",
    {
      title: "Get Container Logs",
      description: "Retrieve logs from a Docker container with optional filtering",
      inputSchema: {
        containerId: z.string().describe("Container ID or name"),
        tail: z.number().optional().describe("Number of lines to retrieve from the end of the logs (default: 100)"),
        since: z.string().optional().describe("Show logs since timestamp (e.g., '2023-01-01T00:00:00Z') or relative time (e.g., '10m', '1h', '24h')"),
        until: z.string().optional().describe("Show logs until timestamp (e.g., '2023-01-01T00:00:00Z') or relative time (e.g., '10m', '1h', '24h')"),
        timestamps: z.boolean().optional().describe("Include timestamps in the output (default: false)")
      }
    },
    async ({ containerId, tail, since, until, timestamps }) => {
      try {
        const logs = await dockerService.getContainerLogs(containerId, {
          tail: tail || 100,
          since,
          until,
          timestamps: timestamps || false
        });

        // Format the response with metadata
        const logLines = logs.split('\n').filter(line => line.trim());
        const logCount = logLines.length;
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                containerId,
                logCount,
                options: {
                  tail: tail || 100,
                  since: since || null,
                  until: until || null,
                  timestamps: timestamps || false
                },
                logs: logs
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Failed to get container logs",
                message: error instanceof Error ? error.message : String(error),
                containerId
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    }
  );
}
