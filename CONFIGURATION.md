# Docker MCP Server Configuration Examples

This file contains example configurations for the Docker MCP server to connect to both local and remote Docker daemons.

## Local Docker Configuration

### Default (Auto-detect)
```bash
# No configuration needed - automatically detects local Docker daemon
npm start
```

### Explicit Local Mode
```bash
export DOCKER_MCP_LOCAL=true
npm start
```

## Remote Docker Configuration

### Method 1: SSH Config Integration (Recommended)

First, define your remote host in `~/.ssh/config`:
```ssh
Host my-production-server
    HostName 192.168.1.100
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_rsa
    
Host my-dev-server
    HostName dev.example.com
    User docker
    Port 2222
    IdentityFile ~/.ssh/dev_key
```

Then use the host name:
```bash
export DOCKER_MCP_HOST=my-production-server
npm start
```

### Method 2: Connection String Format

Simple connection string format:
```bash
# Format: [user@]host[:port]
export DOCKER_MCP_CONNECTION=ubuntu@192.168.1.100:22
npm start

# Default port (22)
export DOCKER_MCP_CONNECTION=ubuntu@192.168.1.100
npm start

# Default user (root)
export DOCKER_MCP_CONNECTION=192.168.1.100
npm start
```

### Method 3: Full Environment Variable Configuration

Complete configuration using environment variables:
```bash
export DOCKER_MCP_HOST=192.168.1.100
export DOCKER_MCP_PORT=22
export DOCKER_MCP_USERNAME=ubuntu
export DOCKER_MCP_PRIVATE_KEY=~/.ssh/id_rsa
export DOCKER_MCP_PASSPHRASE=mypassphrase
export DOCKER_MCP_SOCKET_PATH=/var/run/docker.sock
export DOCKER_MCP_TIMEOUT=15000
npm start
```

## Advanced Configuration Examples

### Docker Desktop on Remote Windows (WSL2)
```bash
export DOCKER_MCP_HOST=windows-server
export DOCKER_MCP_USERNAME=myuser
export DOCKER_MCP_PRIVATE_KEY=~/.ssh/id_rsa
export DOCKER_MCP_SOCKET_PATH=/mnt/wsl/docker-desktop/shared-sockets/guest-services/docker.sock
npm start
```

### Docker with Custom Socket Path
```bash
export DOCKER_MCP_HOST=custom-server
export DOCKER_MCP_USERNAME=docker
export DOCKER_MCP_PRIVATE_KEY=~/.ssh/id_rsa
export DOCKER_MCP_SOCKET_PATH=/custom/path/docker.sock
npm start
```

### High Latency Connection
```bash
export DOCKER_MCP_HOST=remote-server
export DOCKER_MCP_USERNAME=ubuntu
export DOCKER_MCP_PRIVATE_KEY=~/.ssh/id_rsa
export DOCKER_MCP_TIMEOUT=30000  # 30 second timeout
npm start
```

## Environment Variable Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DOCKER_MCP_SERVER_NAME` | Server name | `docker-mcp-server` | `my-docker-server` |
| `DOCKER_MCP_SERVER_VERSION` | Server version | `1.0.0` | `2.0.0` |
| `DOCKER_MCP_LOCAL` | Force local Docker daemon | `false` | `true` |
| `DOCKER_MCP_CONNECTION` | Connection string format | - | `ubuntu@192.168.1.100:22` |
| `DOCKER_MCP_HOST` | SSH host name or IP | - | `my-vm` or `192.168.1.100` |
| `DOCKER_MCP_PORT` | SSH port | `22` | `2222` |
| `DOCKER_MCP_USERNAME` | SSH username | `root` | `ubuntu` |
| `DOCKER_MCP_PRIVATE_KEY` | SSH private key path | - | `~/.ssh/id_rsa` |
| `DOCKER_MCP_PRIVATE_KEY_CONTENT` | SSH private key content | - | `-----BEGIN RSA PRIVATE KEY-----...` |
| `DOCKER_MCP_PASSPHRASE` | SSH key passphrase | - | `mypassphrase` |
| `DOCKER_MCP_SOCKET_PATH` | Remote Docker socket path | `/var/run/docker.sock` | `/custom/docker.sock` |
| `DOCKER_MCP_TIMEOUT` | Connection timeout (ms) | `10000` | `30000` |

## Testing Configuration

### Check Current Configuration
```bash
node dist/index.js --config
```

### Show Help
```bash
node dist/index.js --help
```

### Test Connection
```bash
# Test with your configuration
export DOCKER_MCP_HOST=my-vm
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "docker_system_version", "arguments": {}}}' | node dist/index.js
```

## Troubleshooting

### Common Issues

1. **SSH Key Authentication Fails**
   - Ensure the private key file exists and has correct permissions (600)
   - Check if the key requires a passphrase and set `DOCKER_MCP_PASSPHRASE`
   - Verify the key is added to the remote host's `~/.ssh/authorized_keys`

2. **Connection Timeout**
   - Increase timeout value: `DOCKER_MCP_TIMEOUT=30000`
   - Check network connectivity to remote host
   - Verify SSH port is accessible

3. **Docker Socket Not Found**
   - Verify Docker is running on the remote host
   - Check if Docker socket path is correct
   - Ensure the SSH user has permissions to access Docker socket

4. **SSH Config Not Found**
   - Verify `~/.ssh/config` exists and is readable
   - Check SSH config syntax
   - Ensure host entry matches exactly

### Debug Mode

For debugging connection issues, check the server logs:
```bash
export DOCKER_MCP_HOST=my-vm
node dist/index.js --config  # Check configuration
node dist/index.js  # Start server and check connection logs
```

The server will log connection details including:
- Docker daemon version and API version
- Connection mode (local/remote)
- SSH connection details (without sensitive data)
