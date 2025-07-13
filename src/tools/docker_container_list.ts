import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";

export function registerDockerContainerList(
  server: McpServer,
  dockerService: DockerService
): void {
  server.registerTool(
    "docker_container_list",
    {
      title: "List Docker Containers",
      description: "List all containers with their status, names, and basic info",
      inputSchema: {
        all: z.boolean().optional().describe("Show all containers (default: false - only running)"),
        filters: z.record(z.string()).optional().describe("Filter containers by labels, status, etc.")
      }
    },
    async ({ all, filters }) => {
      try {
        const containers = await dockerService.listContainers({
          all: all || false,
          filters: filters || {}
        });

        const containerInfo = containers.map(container => ({
          id: container.Id.substring(0, 12),
          name: container.Names[0]?.replace('/', '') || 'unnamed',
          image: container.Image,
          status: container.Status,
          state: container.State,
          ports: container.Ports.map((port: any) => ({
            privatePort: port.PrivatePort,
            publicPort: port.PublicPort,
            type: port.Type,
            ip: port.IP
          })),
          created: new Date(container.Created * 1000).toISOString(),
          labels: container.Labels || {}
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              count: containerInfo.length,
              containers: containerInfo
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text", 
            text: `Error listing containers: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
}
