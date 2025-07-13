import Docker from "dockerode";
import {
  DockerContainerSummary,
  DockerImageSummary,
  DockerNetworkSummary,
  DockerVolumeSummary,
  DockerSystemInfo,
  DockerVersion,
  DockerDiskUsage,
  ContainerRestartInfo,
  CleanupResult,
  CleanupSummary
} from "../types/docker.js";

export class DockerService {
  private docker: Docker;

  constructor(options?: Docker.DockerOptions) {
    // Initialize dockerode with provided options or default local socket
    this.docker = new Docker(options || { socketPath: '/var/run/docker.sock' });
  }

  // Container management methods
  async listContainers(options: { all?: boolean; filters?: Record<string, string> } = {}): Promise<any[]> {
    try {
      const containers = await this.docker.listContainers({
        all: options.all || false,
        filters: options.filters ? JSON.stringify(options.filters) : undefined
      });
      return containers;
    } catch (error) {
      throw new Error(`Failed to list containers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async inspectContainer(containerId: string): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      return await container.inspect();
    } catch (error) {
      throw new Error(`Failed to inspect container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async startContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
    } catch (error) {
      throw new Error(`Failed to start container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async stopContainer(containerId: string, timeout?: number): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop({ t: timeout });
    } catch (error) {
      throw new Error(`Failed to stop container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async restartContainer(containerId: string, timeout?: number): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.restart({ t: timeout });
    } catch (error) {
      throw new Error(`Failed to restart container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async removeContainer(containerId: string, options: { force?: boolean; v?: boolean } = {}): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.remove(options);
    } catch (error) {
      throw new Error(`Failed to remove container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createContainer(options: Docker.ContainerCreateOptions): Promise<Docker.Container> {
    try {
      const container = await this.docker.createContainer(options);
      return container;
    } catch (error) {
      throw new Error(`Failed to create container: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getContainerLogs(containerId: string, options: { 
    tail?: number; 
    since?: string; 
    until?: string; 
    timestamps?: boolean; 
  } = {}): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);
      
      const logOptions: any = {
        stdout: true,
        stderr: true,
        timestamps: options.timestamps || false,
        tail: options.tail || 100, // Default to last 100 lines
        since: options.since,
        until: options.until
      };
      
      // Use callback-based approach which is more reliable
      return new Promise((resolve, reject) => {
        container.logs(logOptions, (err: any, data: any) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (data && typeof data.on === 'function') {
            // It's a stream - collect all data
            let rawData = Buffer.alloc(0);
            
            data.on('data', (chunk: Buffer) => {
              rawData = Buffer.concat([rawData, chunk]);
            });
            
            data.on('end', () => {
              const cleanedLogs = this.parseDockerLogs(rawData);
              resolve(cleanedLogs);
            });
            
            data.on('error', reject);
          } else if (data) {
            // It's already a buffer or string
            const cleanedLogs = this.parseDockerLogs(Buffer.from(data));
            resolve(cleanedLogs);
          } else {
            resolve('');
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to get logs for container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private parseDockerLogs(buffer: Buffer): string {
    let result = '';
    let offset = 0;
    
    while (offset < buffer.length) {
      if (offset + 8 > buffer.length) {
        // Not enough bytes for header, might be incomplete
        break;
      }
      
      // Docker stream format:
      // Byte 0: stream type (0=stdin, 1=stdout, 2=stderr)
      // Bytes 1-3: padding (always 0)
      // Bytes 4-7: size of payload (big endian)
      // Bytes 8+: actual log data
      
      const streamType = buffer.readUInt8(offset);
      const size = buffer.readUInt32BE(offset + 4);
      
      if (offset + 8 + size > buffer.length) {
        // Invalid size or incomplete data
        break;
      }
      
      // Extract the actual log content
      const logContent = buffer.slice(offset + 8, offset + 8 + size);
      result += logContent.toString();
      
      offset += 8 + size;
    }
    
    return result;
  }

  async getContainerStats(containerId: string, stream: boolean = false): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      return await container.stats({ stream: stream as any });
    } catch (error) {
      throw new Error(`Failed to get stats for container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async execInContainer(containerId: string, command: string[], options: any = {}): Promise<{ output: string; exitCode: number }> {
    try {
      const container = this.docker.getContainer(containerId);
      const exec = await container.exec({
        Cmd: command,
        AttachStdout: true,
        AttachStderr: true,
        ...options
      });
      
      const stream = await exec.start({ hijack: true, stdin: false });
      
      return new Promise((resolve, reject) => {
        let output = '';
        
        stream.on('data', (chunk: Buffer) => {
          output += chunk.toString();
        });
        
        stream.on('end', async () => {
          try {
            const inspectData = await exec.inspect();
            resolve({
              output,
              exitCode: inspectData.ExitCode || 0
            });
          } catch (error) {
            reject(error);
          }
        });
        
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to execute command in container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getContainerProcesses(containerId: string): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      return await container.top();
    } catch (error) {
      throw new Error(`Failed to get processes for container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getContainerChanges(containerId: string): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      return await container.changes();
    } catch (error) {
      throw new Error(`Failed to get changes for container ${containerId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Image management methods
  async listImages(options: { all?: boolean } = {}): Promise<any[]> {
    try {
      const images = await this.docker.listImages({ all: options.all || false });
      return images;
    } catch (error) {
      throw new Error(`Failed to list images: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async inspectImage(imageId: string): Promise<any> {
    try {
      const image = this.docker.getImage(imageId);
      return await image.inspect();
    } catch (error) {
      throw new Error(`Failed to inspect image ${imageId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async pullImage(imageName: string, options: any = {}): Promise<string> {
    try {
      const stream = await this.docker.pull(imageName, options);
      
      return new Promise((resolve, reject) => {
        let output = '';
        
        stream.on('data', (chunk: Buffer) => {
          output += chunk.toString();
        });
        
        stream.on('end', () => {
          resolve(output);
        });
        
        stream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to pull image ${imageName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async removeImage(imageId: string, options: { force?: boolean; noprune?: boolean } = {}): Promise<any> {
    try {
      const image = this.docker.getImage(imageId);
      return await image.remove(options);
    } catch (error) {
      throw new Error(`Failed to remove image ${imageId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Network management methods
  async listNetworks(filters: Record<string, string> = {}): Promise<any[]> {
    try {
      const networks = await this.docker.listNetworks({ 
        filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined 
      });
      return networks;
    } catch (error) {
      throw new Error(`Failed to list networks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async inspectNetwork(networkId: string): Promise<any> {
    try {
      const network = this.docker.getNetwork(networkId);
      return await network.inspect();
    } catch (error) {
      throw new Error(`Failed to inspect network ${networkId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Volume management methods
  async listVolumes(filters: Record<string, string> = {}): Promise<any> {
    try {
      const volumes = await this.docker.listVolumes({ 
        filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined 
      });
      return volumes;
    } catch (error) {
      throw new Error(`Failed to list volumes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async inspectVolume(volumeName: string): Promise<any> {
    try {
      const volume = this.docker.getVolume(volumeName);
      return await volume.inspect();
    } catch (error) {
      throw new Error(`Failed to inspect volume ${volumeName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // System information methods
  async getSystemInfo(): Promise<any> {
    try {
      const info = await this.docker.info();
      return info;
    } catch (error) {
      throw new Error(`Failed to get system info: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getVersion(): Promise<any> {
    try {
      const version = await this.docker.version();
      return version;
    } catch (error) {
      throw new Error(`Failed to get Docker version: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getDiskUsage(): Promise<any> {
    try {
      const df = await this.docker.df();
      return df;
    } catch (error) {
      throw new Error(`Failed to get disk usage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Cleanup methods
  async pruneContainers(filters: Record<string, string> = {}): Promise<CleanupResult> {
    try {
      const result = await this.docker.pruneContainers({ 
        filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined 
      });
      return {
        deletedItems: (result as any).ContainersDeleted || [],
        reclaimedSpace: (result as any).SpaceReclaimed || 0,
        errors: [],
        summary: `Removed ${(result as any).ContainersDeleted?.length || 0} containers, reclaimed ${(result as any).SpaceReclaimed || 0} bytes`
      };
    } catch (error) {
      throw new Error(`Failed to prune containers: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async pruneImages(filters: Record<string, string> = {}): Promise<CleanupResult> {
    try {
      const result = await this.docker.pruneImages({ 
        filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined 
      });
      return {
        deletedItems: (result as any).ImagesDeleted?.map((img: any) => img.Deleted || img.Untagged).filter(Boolean) || [],
        reclaimedSpace: (result as any).SpaceReclaimed || 0,
        errors: [],
        summary: `Removed ${(result as any).ImagesDeleted?.length || 0} images, reclaimed ${(result as any).SpaceReclaimed || 0} bytes`
      };
    } catch (error) {
      throw new Error(`Failed to prune images: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async pruneVolumes(filters: Record<string, string> = {}): Promise<CleanupResult> {
    try {
      const result = await this.docker.pruneVolumes({ 
        filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined 
      });
      return {
        deletedItems: (result as any).VolumesDeleted || [],
        reclaimedSpace: (result as any).SpaceReclaimed || 0,
        errors: [],
        summary: `Removed ${(result as any).VolumesDeleted?.length || 0} volumes, reclaimed ${(result as any).SpaceReclaimed || 0} bytes`
      };
    } catch (error) {
      throw new Error(`Failed to prune volumes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async pruneNetworks(filters: Record<string, string> = {}): Promise<CleanupResult> {
    try {
      const result = await this.docker.pruneNetworks({ 
        filters: Object.keys(filters).length > 0 ? JSON.stringify(filters) : undefined 
      });
      return {
        deletedItems: (result as any).NetworksDeleted || [],
        reclaimedSpace: 0, // Networks don't have size
        errors: [],
        summary: `Removed ${(result as any).NetworksDeleted?.length || 0} networks`
      };
    } catch (error) {
      throw new Error(`Failed to prune networks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Advanced methods
  async detectRestartLoops(timeWindowMinutes: number = 10, maxRestarts: number = 3): Promise<ContainerRestartInfo[]> {
    try {
      const containers = await this.listContainers({ all: true });
      const restartLoops: ContainerRestartInfo[] = [];
      
      for (const container of containers) {
        const inspection = await this.inspectContainer(container.Id);
        const restartCount = inspection.RestartCount || 0;
        
        if (restartCount >= maxRestarts) {
          const lastRestartTime = inspection.State.StartedAt || new Date().toISOString();
          const restartTime = new Date(lastRestartTime);
          const now = new Date();
          const timeDiff = (now.getTime() - restartTime.getTime()) / (1000 * 60); // minutes
          
          if (timeDiff <= timeWindowMinutes) {
            restartLoops.push({
              containerId: container.Id,
              name: container.Names[0] || 'unknown',
              restartCount,
              lastRestartTime,
              isRestartLoop: true,
              restartPolicy: inspection.HostConfig.RestartPolicy?.Name || 'no',
              exitCode: inspection.State.ExitCode,
              error: inspection.State.Error
            });
          }
        }
      }
      
      return restartLoops;
    } catch (error) {
      throw new Error(`Failed to detect restart loops: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getCleanupSummary(): Promise<CleanupSummary> {
    try {
      const [containers, images, volumes, networks] = await Promise.all([
        this.listContainers({ all: true }),
        this.listImages({ all: true }),
        this.listVolumes(),
        this.listNetworks()
      ]);

      // Filter stopped containers
      const stoppedContainers = containers.filter(c => c.State !== 'running');
      const danglingImages = images.filter(img => !img.RepoTags || img.RepoTags.includes('<none>:<none>'));
      const unusedVolumes = volumes.Volumes?.filter((v: any) => !v.UsageData || v.UsageData.RefCount === 0) || [];
      const customNetworks = networks.filter(n => !['bridge', 'host', 'none'].includes(n.Name));

      return {
        images: {
          count: danglingImages.length,
          size: danglingImages.reduce((sum: number, img: any) => sum + img.Size, 0),
          items: danglingImages.map((img: any) => img.Id)
        },
        containers: {
          count: stoppedContainers.length,
          size: stoppedContainers.reduce((sum: number, c: any) => sum + (c.SizeRw || 0), 0),
          items: stoppedContainers.map((c: any) => c.Id)
        },
        volumes: {
          count: unusedVolumes.length,
          size: unusedVolumes.reduce((sum: number, v: any) => sum + (v.UsageData?.Size || 0), 0),
          items: unusedVolumes.map((v: any) => v.Name)
        },
        networks: {
          count: customNetworks.length,
          items: customNetworks.map((n: any) => n.Id)
        },
        buildCache: {
          count: 0,
          size: 0,
          items: []
        },
        totalSize: 0 // Will be calculated
      };
    } catch (error) {
      throw new Error(`Failed to get cleanup summary: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
