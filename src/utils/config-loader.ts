import { createDockerOptions, parseSSHConfig } from './docker-config.js';
import Docker from 'dockerode';
import { readFileSync } from 'fs';

export interface ServerConfig {
  name: string;
  version: string;
  dockerOptions?: Docker.DockerOptions;
}

/**
 * Loads server configuration from environment variables
 * Supports only local mode and SSH mode for simplicity
 */
export function loadServerConfig(): ServerConfig {
  const config: ServerConfig = {
    name: process.env.DOCKER_MCP_SERVER_NAME || "docker-mcp-server",
    version: process.env.DOCKER_MCP_SERVER_VERSION || "1.0.0"
  };

  // Determine Docker connection mode
  const dockerOptions = loadDockerOptions();
  if (dockerOptions) {
    config.dockerOptions = dockerOptions;
  }

  return config;
}

/**
 * Loads Docker options based on environment variables
 * Simple logic: local mode or SSH mode only
 */
function loadDockerOptions(): Docker.DockerOptions | undefined {
  // Check for explicit local mode
  if (process.env.DOCKER_MCP_LOCAL === 'true') {
    return undefined; // Use default local connection
  }

  // Check for TCP tunnel connection (e.g., SSH tunnel)
  const host = process.env.DOCKER_MCP_HOST;
  if (host && host.startsWith('tcp://')) {
    const url = new URL(host);
    return {
      protocol: 'http',
      host: url.hostname,
      port: parseInt(url.port, 10) || 2375,
      timeout: 10000
    };
  }

  // Check for SSH connection
  if (host && host.startsWith('ssh://')) {
    return createSSHDockerOptions(host);
  }

  return undefined; // Default to local
}

/**
 * Creates SSH-based Docker options
 */
function createSSHDockerOptions(host: string): Docker.DockerOptions {
  // Parse SSH config from ~/.ssh/config if available
  const sshConfig = parseSSHConfig(host.replace('ssh://', ''));
  
  // Merge with environment variables (env vars take precedence)
  const finalConfig = {
    host: sshConfig.host || host,
    port: process.env.DOCKER_MCP_PORT ? parseInt(process.env.DOCKER_MCP_PORT, 10) : (sshConfig.port || 22),
    username: process.env.DOCKER_MCP_USERNAME || sshConfig.username || 'root',
    privateKey: process.env.DOCKER_MCP_PRIVATE_KEY || sshConfig.privateKey,
    passphrase: process.env.DOCKER_MCP_PASSPHRASE || sshConfig.passphrase,
    socketPath: process.env.DOCKER_MCP_SOCKET_PATH || sshConfig.socketPath || '/var/run/docker.sock',
    timeout: process.env.DOCKER_MCP_TIMEOUT ? parseInt(process.env.DOCKER_MCP_TIMEOUT, 10) : 10000
  };

  // Read private key content if file path is provided
  let privateKeyContent = finalConfig.privateKey;
  if (privateKeyContent && !privateKeyContent.includes('BEGIN')) {
    try {
      privateKeyContent = readFileSync(privateKeyContent, 'utf-8');
    } catch (error) {
      console.error(`Failed to read private key from ${finalConfig.privateKey}:`, error);
      privateKeyContent = undefined;
    }
  }

  return {
    protocol: 'ssh',
    host: finalConfig.host,
    port: finalConfig.port,
    username: finalConfig.username,
    socketPath: finalConfig.socketPath,
    // timeout: finalConfig.timeout,
    sshOptions: privateKeyContent ? {
      host: finalConfig.host,
      port: finalConfig.port,
      username: finalConfig.username,
      privateKey: privateKeyContent,
      passphrase: finalConfig.passphrase
    } : undefined
  };
}

/**
 * Prints simplified configuration help
 */
export function printConfigHelp(): void {
  console.error(`
Docker MCP Server Configuration:

Environment Variables:
  DOCKER_MCP_LOCAL           Use local Docker daemon (set to 'true')
  DOCKER_MCP_HOST            SSH host with format: ssh://hostname or tcp://localhost:port
  
  SSH Configuration (when using ssh:// format):
  DOCKER_MCP_PORT            SSH port (default: 22)
  DOCKER_MCP_USERNAME        SSH username
  DOCKER_MCP_PRIVATE_KEY     Path to SSH private key file
  DOCKER_MCP_PASSPHRASE      SSH private key passphrase
  DOCKER_MCP_SOCKET_PATH     Remote Docker socket path (default: /var/run/docker.sock)
  DOCKER_MCP_TIMEOUT         Connection timeout in milliseconds (default: 10000)

Examples:
  # Local Docker daemon
  DOCKER_MCP_LOCAL=true

  # SSH tunnel (for compatibility)
  DOCKER_MCP_HOST=tcp://localhost:2375

  # Direct SSH connection (uses ~/.ssh/config if configured)
  DOCKER_MCP_HOST=ssh://my-vm

  # Direct SSH with explicit credentials
  DOCKER_MCP_HOST=ssh://192.168.1.100
  DOCKER_MCP_USERNAME=ubuntu
  DOCKER_MCP_PRIVATE_KEY=~/.ssh/id_rsa
`);
}

/**
 * Prints current configuration
 */
export function printCurrentConfig(config: ServerConfig): void {
  console.error(`
Current Configuration:
  Server Name: ${config.name}
  Server Version: ${config.version}
  
  Docker Connection:`);
  
  if (!config.dockerOptions) {
    console.error('    Mode: Local Docker daemon');
  } else if (config.dockerOptions.protocol === 'http' && config.dockerOptions.host === 'localhost') {
    console.error('    Mode: TCP tunnel (likely SSH tunnel)');
    console.error(`    Host: ${config.dockerOptions.host}:${config.dockerOptions.port}`);
  } else if (config.dockerOptions.protocol === 'ssh') {
    console.error('    Mode: Direct SSH connection');
    console.error(`    Host: ${config.dockerOptions.host}:${config.dockerOptions.port}`);
    console.error(`    Username: ${config.dockerOptions.username}`);
    console.error(`    Private Key: ${config.dockerOptions.sshOptions?.privateKey ? 'Loaded' : 'Not specified'}`);
    console.error(`    Socket Path: ${config.dockerOptions.socketPath}`);
  } else {
    console.error('    Mode: Custom Docker options');
  }
  
  console.error('');
}
