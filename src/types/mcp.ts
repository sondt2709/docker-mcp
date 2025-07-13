import { z } from "zod";

// Input schema for MCP tools
export const ContainerIdSchema = z.object({
  containerId: z.string().describe("Container ID or name")
});

export const ContainerListSchema = z.object({
  all: z.boolean().optional().describe("Show all containers (default: false - only running)"),
  filters: z.record(z.string()).optional().describe("Filter containers by labels, status, etc.")
});

export const ContainerLogsSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
  tail: z.number().optional().describe("Number of lines to show from the end of the logs"),
  since: z.string().optional().describe("Show logs since timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m for 42 minutes)"),
  until: z.string().optional().describe("Show logs until timestamp"),
  timestamps: z.boolean().optional().describe("Show timestamps"),
  follow: z.boolean().optional().describe("Follow log output")
});

export const ContainerStatsSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
  stream: z.boolean().optional().describe("Stream stats continuously")
});

export const ContainerExecSchema = z.object({
  containerId: z.string().describe("Container ID or name"),
  command: z.array(z.string()).describe("Command to execute"),
  workingDir: z.string().optional().describe("Working directory for the command"),
  env: z.array(z.string()).optional().describe("Environment variables"),
  user: z.string().optional().describe("User to run the command as"),
  privileged: z.boolean().optional().describe("Run with extended privileges"),
  tty: z.boolean().optional().describe("Allocate a pseudo-TTY"),
  detach: z.boolean().optional().describe("Detach from the command")
});

export const ContainerCreateSchema = z.object({
  image: z.string().describe("Image to create the container from"),
  name: z.string().optional().describe("Container name"),
  command: z.array(z.string()).optional().describe("Command to run"),
  env: z.array(z.string()).optional().describe("Environment variables"),
  ports: z.record(z.string()).optional().describe("Port mappings (container:host)"),
  volumes: z.array(z.string()).optional().describe("Volume mounts"),
  workingDir: z.string().optional().describe("Working directory"),
  labels: z.record(z.string()).optional().describe("Labels to set on the container"),
  restart: z.enum(["no", "on-failure", "always", "unless-stopped"]).optional().describe("Restart policy"),
  network: z.string().optional().describe("Network to connect to"),
  detach: z.boolean().optional().describe("Run container in background")
});

export const ImageListSchema = z.object({
  all: z.boolean().optional().describe("Show all images (default: false - only tagged)")
});

export const ImagePullSchema = z.object({
  image: z.string().describe("Image to pull (e.g., 'ubuntu:latest')"),
  platform: z.string().optional().describe("Platform (e.g., 'linux/amd64')")
});

export const ImageRemoveSchema = z.object({
  image: z.string().describe("Image ID or name to remove"),
  force: z.boolean().optional().describe("Force removal of the image"),
  noprune: z.boolean().optional().describe("Do not delete untagged parents")
});

export const NetworkListSchema = z.object({
  filters: z.record(z.string()).optional().describe("Filter networks")
});

export const NetworkInspectSchema = z.object({
  networkId: z.string().describe("Network ID or name"),
  verbose: z.boolean().optional().describe("Show detailed information"),
  scope: z.string().optional().describe("Filter by scope")
});

export const VolumeListSchema = z.object({
  filters: z.record(z.string()).optional().describe("Filter volumes")
});

export const VolumeInspectSchema = z.object({
  volumeName: z.string().describe("Volume name")
});

export const ComposeSchema = z.object({
  composePath: z.string().describe("Path to docker-compose.yml file"),
  projectName: z.string().optional().describe("Project name (defaults to directory name)"),
  services: z.array(z.string()).optional().describe("Specific services to operate on"),
  env: z.record(z.string()).optional().describe("Environment variables")
});

export const ComposeLogsSchema = z.object({
  composePath: z.string().describe("Path to docker-compose.yml file"),
  projectName: z.string().optional().describe("Project name"),
  services: z.array(z.string()).optional().describe("Specific services to show logs for"),
  tail: z.number().optional().describe("Number of lines to show from the end of the logs"),
  follow: z.boolean().optional().describe("Follow log output"),
  timestamps: z.boolean().optional().describe("Show timestamps")
});

export const CleanupSchema = z.object({
  force: z.boolean().optional().describe("Force removal without confirmation"),
  until: z.string().optional().describe("Only remove items created before given timestamp"),
  filters: z.record(z.string()).optional().describe("Provide filter values")
});

export const ContainerCopySchema = z.object({
  containerId: z.string().describe("Container ID or name"),
  srcPath: z.string().describe("Source path"),
  destPath: z.string().describe("Destination path"),
  followLink: z.boolean().optional().describe("Follow symbolic links")
});

export const RestartLoopDetectionSchema = z.object({
  timeWindowMinutes: z.number().optional().describe("Time window in minutes to check for restarts (default: 10)"),
  maxRestarts: z.number().optional().describe("Maximum number of restarts to consider a loop (default: 3)")
});

// Type inference from schemas
export type ContainerIdInput = z.infer<typeof ContainerIdSchema>;
export type ContainerListInput = z.infer<typeof ContainerListSchema>;
export type ContainerLogsInput = z.infer<typeof ContainerLogsSchema>;
export type ContainerStatsInput = z.infer<typeof ContainerStatsSchema>;
export type ContainerExecInput = z.infer<typeof ContainerExecSchema>;
export type ContainerCreateInput = z.infer<typeof ContainerCreateSchema>;
export type ImageListInput = z.infer<typeof ImageListSchema>;
export type ImagePullInput = z.infer<typeof ImagePullSchema>;
export type ImageRemoveInput = z.infer<typeof ImageRemoveSchema>;
export type NetworkListInput = z.infer<typeof NetworkListSchema>;
export type NetworkInspectInput = z.infer<typeof NetworkInspectSchema>;
export type VolumeListInput = z.infer<typeof VolumeListSchema>;
export type VolumeInspectInput = z.infer<typeof VolumeInspectSchema>;
export type ComposeInput = z.infer<typeof ComposeSchema>;
export type ComposeLogsInput = z.infer<typeof ComposeLogsSchema>;
export type CleanupInput = z.infer<typeof CleanupSchema>;
export type ContainerCopyInput = z.infer<typeof ContainerCopySchema>;
export type RestartLoopDetectionInput = z.infer<typeof RestartLoopDetectionSchema>;
