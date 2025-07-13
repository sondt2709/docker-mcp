# Docker MCP

A Model Context Protocol (MCP) server that enables AI assistants like Claude and Cursor IDE to interact with Docker containers. Your AI can now manage Docker containers, view logs, monitor resources, and troubleshoot issues without you needing to know Docker commands.

**Stack:** Node.js, TypeScript, dockerode, MCP

## Quick Start 🚀

### For Cursor IDE Users

1. **Install the package:**

   ```bash
   npm install -g docker-mcp
   ```

2. **Add to your Cursor settings:**
   
   Open Cursor → Settings → Features → Model Context Protocol
   
   Add this configuration:

   ```json
   {
     "mcpServers": {
       "docker": {
         "command": "npx",
         "args": ["-y", "docker-mcp"],
         "env": {
           "DOCKER_MCP_LOCAL": "true"
         }
       }
     }
   }
   ```

### For Claude Desktop Users

1. **Install the package:**

   ```bash
   npm install -g docker-mcp
   ```

2. **Configure Claude Desktop:**
   
   Edit your Claude Desktop config file:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%/Claude/claude_desktop_config.json`
   
   Add this configuration:

   ```json
   {
     "mcpServers": {
       "docker": {
         "command": "npx",
         "args": ["-y", "docker-mcp"],
         "env": {
           "DOCKER_MCP_LOCAL": "true"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## Remote Docker Setup 🌐

### For Remote VMs or Servers

If your Docker containers are running on a remote server or VM:

```json
{
  "mcpServers": {
    "docker": {
      "command": "npx",
      "args": ["-y", "docker-mcp"],
      "env": {
        "DOCKER_MCP_HOST": "ssh://your-vm-name",
        "DOCKER_MCP_USERNAME": "ubuntu",
        "DOCKER_MCP_PRIVATE_KEY": "~/.ssh/id_rsa"
      }
    }
  }
}
```

### SSH Config Integration

If you have SSH hosts configured in `~/.ssh/config`:

```ssh
Host my-docker-vm
    HostName 192.168.1.100
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

Then simply use:

```json
{
  "mcpServers": {
    "docker": {
      "command": "npx",
      "args": ["-y", "docker-mcp"],
      "env": {
        "DOCKER_MCP_HOST": "ssh://my-docker-vm"
      }
    }
  }
}
```

## What Can Your AI Do? 🤖

Once configured, your AI assistant can help you with:

- **📦 Container Management:** Start, stop, restart, and inspect containers
- **📋 Monitoring:** View container logs, resource usage, and health status
- **🔍 Troubleshooting:** Debug container issues, check port mappings, and analyze restarts
- **🧹 Cleanup:** Remove unused images, volumes, and networks to free up space
- **🐳 Docker Compose:** Manage multi-container applications
- **📊 System Info:** Get Docker version, system information, and disk usage

### Example Conversations

**"Show me all running containers"**
→ AI will list all your containers with their status, ports, and resource usage

**"Why did my nginx container restart 5 times?"**
→ AI will check logs, detect restart loops, and help diagnose issues

**"Clean up unused Docker resources"**
→ AI will safely remove dangling images, unused volumes, and networks

**"Show me the logs for my web server from the last hour"**
→ AI will fetch and display recent logs with timestamps

## Configuration Options ⚙️

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DOCKER_MCP_LOCAL` | Use local Docker daemon | `"true"` |
| `DOCKER_MCP_HOST` | Remote Docker host | `"ssh://my-vm"` |
| `DOCKER_MCP_USERNAME` | SSH username | `"ubuntu"` |
| `DOCKER_MCP_PRIVATE_KEY` | SSH private key path | `"~/.ssh/id_rsa"` |
| `DOCKER_MCP_PORT` | SSH port (default: 22) | `"22"` |
| `DOCKER_MCP_PASSPHRASE` | SSH key passphrase | `"mypassphrase"` |

### Common Configurations

**Local Docker (most users):**

```json
{
  "env": {
    "DOCKER_MCP_LOCAL": "true"
  }
}
```

**Remote Docker with VM name:**

```json
{
  "env": {
    "DOCKER_MCP_HOST": "ssh://my-docker-vm"
  }
}
```

**Remote Docker with IP and credentials:**

```json
{
  "env": {
    "DOCKER_MCP_HOST": "ssh://192.168.1.100",
    "DOCKER_MCP_USERNAME": "ubuntu",
    "DOCKER_MCP_PRIVATE_KEY": "~/.ssh/id_rsa"
  }
}
```

## Troubleshooting 🔧

### Common Issues

**"Cannot connect to Docker daemon"**

- Make sure Docker is running on your system
- For remote hosts, verify SSH access: `ssh your-vm-name`

**"Permission denied"**

- Add your user to the docker group: `sudo usermod -aG docker $USER`
- For remote hosts, ensure the SSH user has Docker permissions

**"Connection timeout"**

- Check network connectivity to remote host
- Verify SSH key authentication is working

### Getting Help

Run the diagnostic command:

```bash
npx docker-mcp --config
```

This will show your current configuration and help identify issues.

---

## For Developers 🛠️

### Available Tools

The MCP server provides these Docker management tools:

#### ✅ Implemented Tools

**Container Management:**

- `docker_container_list` - List all containers with status and details
- `docker_container_inspect` - Get detailed container information
- `docker_container_start` - Start a stopped container
- `docker_container_stop` - Stop a running container
- `docker_container_restart` - Restart a container
- `docker_container_logs` - Get container logs with time filtering

**System Information:**

- `docker_system_info` - Get Docker system information
- `docker_system_version` - Get Docker version details

#### 🚧 Planned Tools (Future Development)

**Container Management (Extended):**

- `remove_container` - Remove a container
- `create_container` - Create a new container from an image
- `follow_container_logs` - Stream live logs from a container
- `get_container_stats` - Get real-time resource usage statistics
- `execute_in_container` - Execute commands inside a running container
- `detect_restart_loops` - Detect containers that are restarting frequently
- `container_processes` - List processes running inside a container
- `container_port_mappings` - Show port mappings for containers
- `container_file_changes` - Show filesystem changes in a container
- `export_container` - Export container as tar archive
- `copy_from_container` - Copy files from container to host
- `copy_to_container` - Copy files from host to container

**Docker Compose:**

- `compose_up` - Start services defined in docker-compose.yml
- `compose_down` - Stop and remove compose services
- `compose_pull` - Pull latest images for compose services
- `compose_logs` - Get logs from compose services

**Image Management:**

- `list_images` - List available Docker images
- `pull_image` - Pull an image from a registry
- `remove_image` - Remove an image
- `inspect_image` - Get detailed image information

**Network & Volume Management:**

- `list_networks` - List Docker networks
- `inspect_network` - Get network details including connected containers
- `list_volumes` - List Docker volumes
- `inspect_volume` - Get volume details

**System & Cleanup:**

- `system_df` - Show Docker disk usage
- `cleanup_unused_images` - Remove unused/dangling images
- `cleanup_unused_volumes` - Remove unused volumes
- `cleanup_unused_networks` - Remove unused networks
- `cleanup_unused_containers` - Remove stopped containers
- `cleanup_build_cache` - Remove build cache
- `cleanup_all` - Comprehensive cleanup of all unused resources
- `get_cleanup_summary` - Show what would be cleaned up without removing

### Development Progress

Currently **8 out of 40 tools implemented (20%)**

### Manual Installation & Development

```bash
# Clone and install dependencies
git clone https://github.com/sondt2709/docker-mcp.git
cd docker-mcp
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

### Testing the Server

```bash
# Show help
npx docker-mcp --help

# Show current configuration
npx docker-mcp --config

# Test with direct JSON-RPC (for development)
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | npx docker-mcp
```

### Architecture

- **MCP Server:** Built with `@modelcontextprotocol/sdk`
- **Docker Integration:** Uses `dockerode` for Docker API communication
- **SSH Support:** Native SSH connection via `dockerode` sshOptions
- **Transport:** Stdio transport for AI assistant communication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.
