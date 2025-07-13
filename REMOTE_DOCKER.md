# Remote Docker Support for Docker MCP Server

This document explains how to connect the Docker MCP Server to remote Docker daemons running on other machines via SSH.

## Overview

The Docker MCP Server now supports connecting to remote Docker daemons through SSH tunneling. This allows you to manage Docker containers and images on remote servers from your local machine.

## Prerequisites

1. **SSH Access**: You must have SSH access to the remote machine
2. **Docker Running**: Docker must be running on the remote machine  
3. **SSH Keys**: SSH key-based authentication configured (recommended)
4. **SSH Config**: Optional but recommended - configure SSH hosts in `~/.ssh/config`

## Configuration Methods

### Method 1: SSH Tunneling (Recommended)

This method creates an SSH tunnel to the remote Docker socket and connects via HTTP.

#### Step 1: Set up SSH Tunnel

Use the provided script to establish an SSH tunnel:

```bash
./scripts/setup-ssh-tunnel.sh <ssh_host> [local_port]
```

Examples:

```bash
# Using SSH config host
./scripts/setup-ssh-tunnel.sh vm-name

# Using explicit user@host
./scripts/setup-ssh-tunnel.sh azureuser@vm-ip

# Using custom local port
./scripts/setup-ssh-tunnel.sh vm-name 2376
```

#### Step 2: Connect MCP Server

```bash
# Using default port 2375
DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js

# Using custom port
DOCKER_MCP_HOST=tcp://localhost:2376 node dist/index.js
```

### Method 2: Direct SSH Configuration (Experimental)

⚠️ **Note**: The docker-modem SSH protocol has known issues. Use Method 1 instead.

You can configure direct SSH connection using environment variables:

```bash
# Basic SSH connection
DOCKER_MCP_HOST=vm-name node dist/index.js

# With explicit credentials
DOCKER_MCP_HOST=vm-name \
DOCKER_MCP_USERNAME=azureuser \
DOCKER_MCP_PRIVATE_KEY=~/.ssh/vm-name_key.pem \
node dist/index.js
```

## SSH Configuration

### SSH Config File

Create or update `~/.ssh/config` with your remote hosts:

```ssh
Host vm-name
    HostName vm-ip
    User azureuser
    Port 22
    IdentityFile ~/.ssh/vm-name_key.pem
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

### Environment Variables

The following environment variables are supported:

| Variable | Description | Example |
|----------|-------------|---------|
| `DOCKER_MCP_HOST` | Remote host or TCP URL | `vm-name` or `tcp://localhost:2375` |
| `DOCKER_MCP_USERNAME` | SSH username | `azureuser` |  
| `DOCKER_MCP_PRIVATE_KEY` | Path to SSH private key | `~/.ssh/vm-name_key.pem` |
| `DOCKER_MCP_PORT` | SSH port | `22` |
| `DOCKER_MCP_SOCKET_PATH` | Remote Docker socket path | `/var/run/docker.sock` |
| `DOCKER_MCP_TIMEOUT` | Connection timeout (ms) | `10000` |

## Usage Examples

### Basic Remote Connection

```bash
# Terminal 1: Set up tunnel
./scripts/setup-ssh-tunnel.sh vm-name

# Terminal 2: Use MCP server
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_system_version", "arguments": {}}}' | DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js
```

### List Remote Containers

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_list", "arguments": {}}}' | DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js
```

### Get Container Logs

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_logs", "arguments": {"container_id": "89ce688e82f5", "lines": 50}}}' | DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js
```

### Stop/Start Containers

```bash
# Stop container
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_stop", "arguments": {"container_id": "89ce688e82f5"}}}' | DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js

# Start container
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_container_start", "arguments": {"container_id": "89ce688e82f5"}}}' | DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js
```

## Available Tools

All Docker MCP tools work with remote connections:

- `docker_system_version` - Get Docker version info
- `docker_system_info` - Get system information  
- `docker_container_list` - List containers
- `docker_container_inspect` - Inspect container details
- `docker_container_logs` - Get container logs
- `docker_container_start` - Start containers
- `docker_container_stop` - Stop containers
- `docker_container_restart` - Restart containers

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure SSH key has correct permissions: `chmod 600 ~/.ssh/your_key.pem`
   - Verify SSH access: `ssh -i ~/.ssh/your_key.pem user@host`

2. **Connection Refused**
   - Check if SSH tunnel is running: `pgrep -f "ssh.*-L.*docker.sock"`
   - Verify Docker is running on remote host: `ssh user@host "docker version"`

3. **Port Already in Use**
   - Stop existing tunnel: `pkill -f 'ssh.*-L.*2375.*docker.sock'`
   - Use different port: `./scripts/setup-ssh-tunnel.sh host 2376`

### Debugging

Enable verbose logging:

```bash
# SSH tunnel debugging
ssh -v -L 2375:/var/run/docker.sock user@host

# Docker connection test
curl http://localhost:2375/version
```

### Managing Tunnels

```bash
# List active tunnels
pgrep -f "ssh.*-L.*docker.sock"

# Stop specific tunnel
pkill -f 'ssh.*-L.*2375.*docker.sock'

# Stop all Docker tunnels
pkill -f 'ssh.*-L.*docker.sock'
```

## Security Considerations

1. **SSH Keys**: Use dedicated SSH keys for Docker access
2. **Firewall**: Ensure SSH port (22) is accessible
3. **Tunneling**: Local tunnel ports are only accessible from localhost
4. **Docker Socket**: Remote Docker socket should not be directly exposed

## Performance Notes

- SSH tunneling adds latency to Docker operations
- Large log outputs may be slower over SSH
- Consider using SSH connection multiplexing for better performance:

```ssh
# Add to ~/.ssh/config
Host *
    ControlMaster auto
    ControlPath ~/.ssh/master-%r@%h:%p
    ControlPersist 600
```

## Integration with MCP Clients

When using with MCP clients (like Claude Desktop), set up the tunnel first:

```bash
# Terminal 1: SSH tunnel
./scripts/setup-ssh-tunnel.sh vm-name

# Terminal 2: MCP server with tunnel
DOCKER_MCP_HOST=tcp://localhost:2375 node dist/index.js
```

Then configure your MCP client to use the server as normal.
