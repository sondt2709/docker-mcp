// Tool registration functions
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DockerService } from "../services/DockerService.js";
import { ComposeService } from "../services/ComposeService.js";

// Import tool registration functions
import { registerDockerContainerList } from "./docker_container_list.js";
import { registerDockerContainerInspect } from "./docker_container_inspect.js";
import { registerDockerContainerStart } from "./docker_container_start.js";
import { registerDockerContainerStop } from "./docker_container_stop.js";
import { registerDockerContainerRestart } from "./docker_container_restart.js";
import { registerDockerContainerLogs } from "./docker_container_logs.js";
import { registerDockerSystemInfo } from "./docker_system_info.js";
import { registerDockerSystemVersion } from "./docker_system_version.js";

// This function will register all tools with the MCP server
export function registerAllTools(
  server: McpServer,
  dockerService: DockerService,
  composeService: ComposeService
): void {
  // Register container management tools
  registerDockerContainerList(server, dockerService);
  registerDockerContainerInspect(server, dockerService);
  registerDockerContainerStart(server, dockerService);
  registerDockerContainerStop(server, dockerService);
  registerDockerContainerRestart(server, dockerService);
  registerDockerContainerLogs(server, dockerService);
  
  // Register system information tools
  registerDockerSystemInfo(server, dockerService);
  registerDockerSystemVersion(server, dockerService);
}
