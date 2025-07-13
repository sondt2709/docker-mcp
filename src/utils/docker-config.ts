import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import Docker from 'dockerode';

export interface RemoteDockerConfig {
  /** SSH host name (as defined in ~/.ssh/config) or IP address */
  host: string;
  /** SSH port (default: 22) */
  port?: number;
  /** SSH username */
  username?: string;
  /** Path to SSH private key file */
  privateKey?: string;
  /** SSH private key content as string */
  privateKeyContent?: string;
  /** SSH passphrase for private key */
  passphrase?: string;
  /** Remote Docker socket path (default: /var/run/docker.sock) */
  socketPath?: string;
  /** Connection timeout in milliseconds (default: 10000) */
  timeout?: number;
}

export interface DockerConnectionConfig {
  /** Use local Docker daemon */
  local?: boolean;
  /** Remote Docker configuration */
  remote?: RemoteDockerConfig;
  /** Override Docker options */
  dockerOptions?: Docker.DockerOptions;
}

/**
 * Detects the appropriate Docker socket path based on the environment
 */
export function detectDockerSocketPath(): string {
  // Common Docker socket paths to check
  const socketPaths = [
    // OrbStack socket
    join(homedir(), '.orbstack/run/docker.sock'),
    // Docker Desktop on macOS
    join(homedir(), '.docker/run/docker.sock'),
    // Default Unix socket
    '/var/run/docker.sock',
    // Docker Desktop on Windows (if running in WSL)
    '/mnt/wsl/docker-desktop/shared-sockets/guest-services/docker.sock'
  ];

  for (const socketPath of socketPaths) {
    if (existsSync(socketPath)) {
      return socketPath;
    }
  }

  // If no socket found, return default and let Docker handle the error
  return '/var/run/docker.sock';
}

/**
 * Parses SSH config to extract host details
 */
export function parseSSHConfig(hostname: string): Partial<RemoteDockerConfig> {
  const sshConfigPath = join(homedir(), '.ssh/config');
  
  if (!existsSync(sshConfigPath)) {
    return { host: hostname };
  }

  try {
    const configContent = readFileSync(sshConfigPath, 'utf-8');
    const lines = configContent.split('\n');
    
    let currentHost = '';
    let hostConfig: Partial<RemoteDockerConfig> = {};
    let isTargetHost = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Host ')) {
        // Save previous host config if it was our target
        if (isTargetHost) {
          break;
        }
        
        currentHost = trimmed.replace('Host ', '').trim();
        isTargetHost = currentHost === hostname;
        hostConfig = { host: hostname };
      } else if (isTargetHost && trimmed.includes(' ')) {
        const [key, ...valueParts] = trimmed.split(' ');
        const value = valueParts.join(' ').trim();
        
        switch (key.toLowerCase()) {
          case 'hostname':
            hostConfig.host = value;
            break;
          case 'port':
            hostConfig.port = parseInt(value, 10);
            break;
          case 'user':
            hostConfig.username = value;
            break;
          case 'identityfile':
            // Handle tilde expansion and quotes
            const keyPath = value.replace(/^["']|["']$/g, '').replace('~', homedir());
            hostConfig.privateKey = keyPath;
            break;
        }
      }
    }
    
    return isTargetHost ? hostConfig : { host: hostname };
  } catch (error) {
    console.error(`Failed to parse SSH config: ${error}`);
    return { host: hostname };
  }
}

/**
 * Creates Docker options for remote connection
 */
export function createRemoteDockerOptions(config: RemoteDockerConfig): Docker.DockerOptions {
  const sshConfig = parseSSHConfig(config.host);
  
  // Merge SSH config with provided config (provided config takes precedence)
  const mergedConfig = { ...sshConfig, ...config };
  
  // Read private key if file path is provided
  let privateKeyContent = mergedConfig.privateKeyContent;
  if (!privateKeyContent && mergedConfig.privateKey) {
    try {
      privateKeyContent = readFileSync(mergedConfig.privateKey, 'utf-8');
    } catch (error) {
      console.error(`Failed to read private key from ${mergedConfig.privateKey}:`, error);
    }
  }
  
  console.error('SSH configuration for Docker connection:', {
    host: mergedConfig.host,
    port: mergedConfig.port || 22,
    username: mergedConfig.username || 'root',
    socketPath: mergedConfig.socketPath || '/var/run/docker.sock',
    hasPrivateKey: !!privateKeyContent
  });

  console.error('Note: docker-modem SSH support appears to have issues.');
  console.error('Consider using manual SSH tunneling instead:');
  console.error(`ssh -L 2375:/var/run/docker.sock -i ${mergedConfig.privateKey} ${mergedConfig.username}@${mergedConfig.host}`);
  console.error('Then set DOCKER_HOST=tcp://localhost:2375');

  // For now, fall back to using SSH protocol with docker-modem
  const dockerOptions: Docker.DockerOptions = {
    protocol: 'ssh',
    host: mergedConfig.host,
    port: mergedConfig.port || 22,
    username: mergedConfig.username || 'root',
    socketPath: mergedConfig.socketPath || '/var/run/docker.sock',
    timeout: mergedConfig.timeout || 10000
  };

  // Add SSH options if private key is available
  if (privateKeyContent) {
    dockerOptions.sshOptions = {
      privateKey: privateKeyContent,
      passphrase: mergedConfig.passphrase
    };
  }

  console.error('Docker options with SSH protocol:', dockerOptions);
  return dockerOptions;
}

/**
 * Creates Docker options with the best available configuration
 */
export function createDockerOptions(config?: DockerConnectionConfig): Docker.DockerOptions {
  // If explicit Docker options are provided, use them
  if (config?.dockerOptions) {
    return config.dockerOptions;
  }
  
  // If remote configuration is provided, use it
  if (config?.remote) {
    return createRemoteDockerOptions(config.remote);
  }
  
  // Default to local Docker daemon
  const socketPath = detectDockerSocketPath();
  
  return {
    socketPath,
    timeout: 10000
  };
}

/**
 * Parses connection string in format: [user@]host[:port]
 */
export function parseConnectionString(connectionString: string): RemoteDockerConfig {
  const parts = connectionString.split('@');
  let username: string | undefined;
  let hostPart: string;
  
  if (parts.length === 2) {
    username = parts[0];
    hostPart = parts[1];
  } else {
    hostPart = parts[0];
  }
  
  const [host, portString] = hostPart.split(':');
  const port = portString ? parseInt(portString, 10) : undefined;
  
  return {
    host,
    port,
    username
  };
}
