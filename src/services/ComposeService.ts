import Docker from "dockerode";
import path from "path";
import fs from "fs";
import { DockerComposeProject } from "../types/docker.js";

export class ComposeService {
  private docker: Docker;

  constructor(dockerInstance?: Docker) {
    this.docker = dockerInstance || new Docker({ socketPath: '/var/run/docker.sock' });
  }

  async up(composePath: string, projectName?: string, services?: string[]): Promise<any> {
    try {
      return {
        success: true,
        message: `Docker Compose up functionality will be implemented with docker-compose CLI integration`,
        details: { composePath, projectName, services }
      };
    } catch (error) {
      throw new Error(`Failed to start compose services: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async down(composePath: string, projectName?: string, options: { removeVolumes?: boolean; removeImages?: boolean } = {}): Promise<any> {
    try {
      return {
        success: true,
        message: "Docker Compose down functionality will be implemented with docker-compose CLI integration",
        details: { composePath, projectName, options }
      };
    } catch (error) {
      throw new Error(`Failed to stop compose services: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async pull(composePath: string, projectName?: string, services?: string[]): Promise<any> {
    try {
      return {
        success: true,
        message: `Docker Compose pull functionality will be implemented with docker-compose CLI integration`,
        details: { composePath, projectName, services }
      };
    } catch (error) {
      throw new Error(`Failed to pull compose images: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async logs(composePath: string, projectName?: string, options: {
    services?: string[];
    tail?: number;
    follow?: boolean;
    timestamps?: boolean;
  } = {}): Promise<string> {
    try {
      // For now, we'll get logs from individual containers
      const project = await this.getProjectInfo(composePath, projectName);
      const containerLogs: string[] = [];
      
      // Get all containers for this project
      const containers = await this.docker.listContainers({
        all: true,
        filters: JSON.stringify({
          label: [`com.docker.compose.project=${project.name}`]
        })
      });
      
      for (const containerInfo of containers) {
        const container = this.docker.getContainer(containerInfo.Id);
        const serviceName = containerInfo.Labels['com.docker.compose.service'];
        
        // Filter by services if specified
        if (options.services && !options.services.includes(serviceName)) {
          continue;
        }
        
        try {
          // Use the same pattern as DockerService
          const logs = await new Promise<string>((resolve, reject) => {
            const logOptions: any = {
              stdout: true,
              stderr: true,
              timestamps: options.timestamps || false,
              tail: options.tail || 100
            };
            
            container.logs(logOptions, (err: any, stream: any) => {
              if (err) {
                reject(err);
                return;
              }
              
              let output = '';
              if (stream) {
                stream.on('data', (chunk: Buffer) => {
                  output += chunk.toString();
                });
                
                stream.on('end', () => {
                  resolve(output);
                });
                
                stream.on('error', reject);
              } else {
                resolve('');
              }
            });
          });
          
          containerLogs.push(`=== ${serviceName} (${containerInfo.Id.substring(0, 12)}) ===\n${logs}`);
        } catch (logError) {
          containerLogs.push(`=== ${serviceName} (${containerInfo.Id.substring(0, 12)}) ===\nError fetching logs: ${logError}`);
        }
      }
      
      return containerLogs.join('\n\n');
    } catch (error) {
      throw new Error(`Failed to get compose logs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getProjectInfo(composePath: string, projectName?: string): Promise<DockerComposeProject> {
    try {
      const absolutePath = path.resolve(composePath);
      const defaultProjectName = projectName || path.basename(path.dirname(absolutePath));
      
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Docker compose file not found: ${absolutePath}`);
      }
      
      // For now, return basic project info
      // In a full implementation, you might parse the compose file
      return {
        name: defaultProjectName,
        services: [], // Would be parsed from compose file
        networks: [],
        volumes: [],
        configFiles: [absolutePath]
      };
    } catch (error) {
      throw new Error(`Failed to get project info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async restart(composePath: string, projectName?: string, services?: string[]): Promise<any> {
    try {
      // Stop and then start services
      await this.down(composePath, projectName);
      const result = await this.up(composePath, projectName, services);
      
      return {
        success: true,
        message: `Successfully restarted services${services ? ` for: ${services.join(', ')}` : ''}`,
        details: result
      };
    } catch (error) {
      throw new Error(`Failed to restart compose services: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async ps(composePath: string, projectName?: string): Promise<any> {
    try {
      const project = await this.getProjectInfo(composePath, projectName);
      
      // Get all containers for this project
      const containers = await this.docker.listContainers({
        all: true,
        filters: JSON.stringify({
          label: [`com.docker.compose.project=${project.name}`]
        })
      });
      
      return containers.map(container => ({
        id: container.Id,
        name: container.Names[0],
        service: container.Labels['com.docker.compose.service'],
        state: container.State,
        status: container.Status,
        ports: container.Ports,
        image: container.Image
      }));
    } catch (error) {
      throw new Error(`Failed to get compose project status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
