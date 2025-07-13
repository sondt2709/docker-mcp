# Docker MCP

Docker MCP is a MCP tool that help AI Agent interact with docker containers in a specific VM or local machine, so that user (who use AI Agent) can manage and troubleshoot containers without any docker knowledge.

Stack: NodeJS LTS, npm, dockerode, MCP.

## Features

- Know and run docker, docker compose commands in a specific VM or local machine.
- Support remote Docker daemon via SSH connections.
- View docker network, exposed port, logs (with specific time range), etc...
- Detect container restart loop
- Cleanup unused resources (images, volumes...)

## Remote Docker Support

The Docker MCP server supports connecting to remote Docker daemons via SSH. This allows you to manage Docker containers on remote VMs or servers from your local machine.

### Quick Start (Recommended)

1. **Set up SSH tunnel:**
   ```bash
   ./scripts/setup-ssh-tunnel.sh your-remote-host
   ```

2. **Connect via tunnel:**
   ```bash
   DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js
   ```

### Configuration Methods

#### 1. SSH Tunneling (Stable)

Use the provided script to create an SSH tunnel:

```bash
# Using SSH config host
./scripts/setup-ssh-tunnel.sh my-vm

# Using explicit user@host
./scripts/setup-ssh-tunnel.sh ubuntu@192.168.1.100

# Then connect via tunnel
DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js
```

#### 2. Direct SSH Connection (Recommended)

Use the `ssh://` protocol format for direct SSH connections to remote Docker daemons:

```bash
# Direct SSH connection using SSH config host
export DOCKER_MCP_HOST=ssh://my-vm

# Direct SSH connection with explicit host
export DOCKER_MCP_HOST=ssh://192.168.1.100
export DOCKER_MCP_USERNAME=ubuntu
export DOCKER_MCP_PRIVATE_KEY=~/.ssh/id_rsa

# Force local Docker daemon (default behavior)
export DOCKER_MCP_LOCAL=true
```

#### 3. SSH Config Integration

The server automatically reads SSH configuration from `~/.ssh/config`. Define your remote hosts there:

```ssh
Host my-vm
    HostName 192.168.1.100
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

Then simply use:
```bash
export DOCKER_MCP_HOST=ssh://my-vm
```

📖 **For detailed remote Docker setup instructions, see [REMOTE_DOCKER.md](REMOTE_DOCKER.md)**

#### 4. Full Environment Variable Configuration

```bash
# Required - use ssh:// protocol format
export DOCKER_MCP_HOST=ssh://192.168.1.100    # SSH host with ssh:// prefix
export DOCKER_MCP_USERNAME=ubuntu             # SSH username

# Optional
export DOCKER_MCP_PORT=22                     # SSH port (default: 22)
export DOCKER_MCP_PRIVATE_KEY=~/.ssh/id_rsa   # SSH private key path
export DOCKER_MCP_PASSPHRASE=mypassphrase     # SSH key passphrase
export DOCKER_MCP_SOCKET_PATH=/var/run/docker.sock  # Remote Docker socket
export DOCKER_MCP_TIMEOUT=10000               # Connection timeout (ms)
```

### Usage Examples

#### Local Docker (Default)

```bash
# No configuration needed - auto-detects local Docker
npm start

# Or explicitly force local
DOCKER_MCP_LOCAL=true npm start
```

#### Remote Docker via SSH Config

```bash
# Uses SSH config for host details with ssh:// protocol
DOCKER_MCP_HOST=ssh://my-vm npm start
```

#### Remote Docker with Full Configuration

```bash
# Explicit configuration with ssh:// protocol
DOCKER_MCP_HOST=ssh://192.168.1.100 \
DOCKER_MCP_USERNAME=ubuntu \
DOCKER_MCP_PRIVATE_KEY=~/.ssh/id_rsa \
npm start
```

### Command Line Options

```bash
# Show configuration help
node dist/index.js --help

# Show current configuration
node dist/index.js --config
```

## MCP tools

Based on the updated README.md with the added "Cleanup unused resources" feature, here's the updated and expanded tool list for your Docker MCP server:

### Core Container Management Tools

1. **list_containers** - List all containers with their status, names, and basic info
2. **inspect_container** - Get detailed information about a specific container
3. **start_container** - Start a stopped container
4. **stop_container** - Stop a running container
5. **restart_container** - Restart a container
6. **remove_container** - Remove a container
7. **create_container** - Create a new container from an image

### Container Monitoring & Debugging Tools

8. **get_container_logs** - Retrieve container logs with optional time range filtering
9. **follow_container_logs** - Stream live logs from a container
10. **get_container_stats** - Get real-time resource usage statistics
11. **execute_in_container** - Execute commands inside a running container
12. **detect_restart_loops** - Custom tool to detect containers that are restarting frequently

### Docker Compose Tools

13. **compose_up** - Start services defined in docker-compose.yml
14. **compose_down** - Stop and remove compose services
15. **compose_pull** - Pull latest images for compose services
16. **compose_logs** - Get logs from compose services

### Image Management Tools

17. **list_images** - List available Docker images
18. **pull_image** - Pull an image from a registry
19. **remove_image** - Remove an image
20. **inspect_image** - Get detailed image information

### Network & Volume Tools

21. **list_networks** - List Docker networks
22. **inspect_network** - Get network details including connected containers
23. **list_volumes** - List Docker volumes
24. **inspect_volume** - Get volume details

## System Information Tools

25. **docker_info** - Get Docker system information
26. **docker_version** - Get Docker version information
27. **system_df** - Show Docker disk usage

### Cleanup & Pruning Tools

28. **cleanup_unused_images** - Remove unused/dangling images (docker image prune)
29. **cleanup_unused_volumes** - Remove unused volumes (docker volume prune)
30. **cleanup_unused_networks** - Remove unused networks (docker network prune)
31. **cleanup_unused_containers** - Remove stopped containers (docker container prune)
32. **cleanup_build_cache** - Remove build cache (docker buildx prune)
33. **cleanup_all** - Comprehensive cleanup of all unused resources
34. **get_cleanup_summary** - Show what would be cleaned up without actually removing

### Advanced Troubleshooting Tools

35. **container_processes** - List processes running inside a container
36. **container_port_mappings** - Show port mappings for containers
37. **container_file_changes** - Show filesystem changes in a container
38. **export_container** - Export container as tar archive
39. **copy_from_container** - Copy files from container to host
40. **copy_to_container** - Copy files from host to container

The cleanup tools would utilize dockerode's built-in pruning methods:

- `docker.pruneImages()` for unused images
- `docker.pruneVolumes()` for unused volumes
- `docker.pruneNetworks()` for unused networks
- `docker.pruneContainers()` for stopped containers
- `docker.pruneBuilder()` for build cache

## Folder Structure

```
docker-mcp/
├── src/
│   ├── index.ts                    # Main entry point - server setup and transport
│   ├── server/
│   │   ├── DockerMcpServer.ts     # Main MCP server class
│   │   └── config.ts              # Server configuration
│   ├── tools/
│   │   ├── index.ts               # Tool registry/exports
│   │   ├── docker_container_list.ts
│   │   ├── docker_container_inspect.ts
│   │   ├── docker_container_start.ts
│   │   ├── docker_container_stop.ts
│   │   ├── docker_container_restart.ts
│   │   ├── docker_container_remove.ts
│   │   ├── docker_container_create.ts
│   │   ├── docker_container_logs.ts
│   │   ├── docker_container_logs_follow.ts
│   │   ├── docker_container_stats.ts
│   │   ├── docker_container_exec.ts
│   │   ├── docker_container_detect_restart_loops.ts
│   │   ├── docker_container_processes.ts
│   │   ├── docker_container_port_mappings.ts
│   │   ├── docker_container_file_changes.ts
│   │   ├── docker_container_export.ts
│   │   ├── docker_container_copy_from.ts
│   │   ├── docker_container_copy_to.ts
│   │   ├── docker_compose_up.ts
│   │   ├── docker_compose_down.ts
│   │   ├── docker_compose_pull.ts
│   │   ├── docker_compose_logs.ts
│   │   ├── docker_image_list.ts
│   │   ├── docker_image_pull.ts
│   │   ├── docker_image_remove.ts
│   │   ├── docker_image_inspect.ts
│   │   ├── docker_network_list.ts
│   │   ├── docker_network_inspect.ts
│   │   ├── docker_volume_list.ts
│   │   ├── docker_volume_inspect.ts
│   │   ├── docker_system_info.ts
│   │   ├── docker_system_version.ts
│   │   ├── docker_system_df.ts
│   │   ├── docker_cleanup_unused_images.ts
│   │   ├── docker_cleanup_unused_volumes.ts
│   │   ├── docker_cleanup_unused_networks.ts
│   │   ├── docker_cleanup_unused_containers.ts
│   │   ├── docker_cleanup_build_cache.ts
│   │   ├── docker_cleanup_all.ts
│   │   └── docker_cleanup_summary.ts
│   ├── services/
│   │   ├── DockerService.ts       # Docker API wrapper using dockerode
│   │   └── ComposeService.ts      # Docker Compose wrapper using dockerode-compose
│   ├── types/
│   │   ├── docker.ts              # Docker-related type definitions
│   │   ├── mcp.ts                 # MCP-specific types
│   │   └── index.ts               # Type exports
│   └── utils/
│       ├── validation.ts          # Input validation helpers
│       ├── error.ts               # Error handling utilities
│       └── logger.ts              # Logging utilities
├── config/
│   ├── default.json               # Default configuration
│   └── production.json            # Production configuration
├── tests/
│   ├── tools/
│   │   ├── docker_container_*.test.ts
│   │   ├── docker_compose_*.test.ts
│   │   ├── docker_image_*.test.ts
│   │   ├── docker_network_*.test.ts
│   │   ├── docker_volume_*.test.ts
│   │   ├── docker_system_*.test.ts
│   │   └── docker_cleanup_*.test.ts
│   ├── services/
│   └── utils/
├── examples/
│   ├── stdio-server.ts            # Example stdio server
│   ├── http-server.ts             # Example HTTP server
│   └── client-example.ts          # Example client usage
├── docker/
│   ├── Dockerfile                 # Container for the MCP server
│   └── docker-compose.yml         # For testing with Docker
├── docs/
│   ├── API.md                     # Tool documentation
│   ├── SETUP.md                   # Setup instructions
│   └── EXAMPLES.md                # Usage examples
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI
├── package.json
├── tsconfig.json
├── yarn.lock
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── README.md
````

## Testing and Usage

### Running the Server

To start the Docker MCP server:

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

### Testing the Server

The server can be tested using JSON-RPC 2.0 requests via stdio. Here are some example commands:

#### List all available tools

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js
```

#### List all Docker containers

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_list", "arguments": {"all": true}}}' | node dist/index.js
```

#### Get Docker version information

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_system_version", "arguments": {}}}' | node dist/index.js
```

#### Inspect a specific container

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_inspect", "arguments": {"containerId": "container_name"}}}' | node dist/index.js
```

#### Start a container

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_start", "arguments": {"containerId": "container_name"}}}' | node dist/index.js
```

#### Get container logs

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_logs", "arguments": {"containerId": "container_name", "tail": 10, "timestamps": true}}}' | node dist/index.js
```

#### Stop a container

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_stop", "arguments": {"containerId": "container_name"}}}' | node dist/index.js
```

### Available Tools

The server provides the following MCP tools:

1. **docker_container_list** - List all containers with their status, names, and basic info
2. **docker_container_inspect** - Get detailed information about a specific container
3. **docker_container_start** - Start a stopped container
4. **docker_container_stop** - Stop a running container
5. **docker_container_restart** - Restart a container
6. **docker_container_logs** - Get container logs with optional time range filtering and timestamps
7. **docker_system_info** - Get Docker system information
8. **docker_system_version** - Get Docker version information

### Docker Socket Configuration

The server automatically detects the appropriate Docker socket path:

**Local Docker:**
- OrbStack: `~/.orbstack/run/docker.sock`
- Docker Desktop: `~/.docker/run/docker.sock`
- Default Unix: `/var/run/docker.sock`

**Remote Docker:**
- Default: `/var/run/docker.sock` (on remote host)
- Customizable via `DOCKER_MCP_SOCKET_PATH` environment variable

### Connection Requirements

**Local Docker:**
- Docker daemon must be running and accessible
- The server needs appropriate permissions to access the Docker socket
- Node.js and npm must be installed for development

**Remote Docker:**
- SSH access to the remote host
- Docker daemon running on the remote host
- SSH key-based authentication (recommended)
- Network connectivity between local and remote hosts
