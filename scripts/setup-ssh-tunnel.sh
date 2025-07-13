#!/bin/bash

# SSH Tunnel Setup Script for Docker MCP Server
# This script sets up SSH tunneling for remote Docker connections

show_help() {
    echo "Usage: $0 <ssh_host> [local_port]"
    echo ""
    echo "Sets up SSH tunnel for Docker MCP Server to connect to remote Docker daemon"
    echo ""
    echo "Arguments:"
    echo "  ssh_host    SSH host (as defined in ~/.ssh/config or user@host format)"
    echo "  local_port  Local port to bind to (default: 2375)"
    echo ""
    echo "Examples:"
    echo "  $0 vm-name"
    echo "  $0 ubuntu@vm-name 2376"
    echo ""
    echo "After running this script, use:"
    echo "  export DOCKER_HOST=tcp://localhost:<local_port>"
    echo "  Or set DOCKER_MCP_HOST=tcp://localhost:<local_port> for the MCP server"
    echo ""
    echo "To stop the tunnel, use:"
    echo "  pkill -f 'ssh.*-L.*docker.sock'"
}

if [ $# -lt 1 ]; then
    show_help
    exit 1
fi

SSH_HOST=$1
LOCAL_PORT=${2:-2375}
REMOTE_SOCKET="/var/run/docker.sock"

echo "Setting up SSH tunnel for Docker MCP Server..."
echo "SSH Host: $SSH_HOST"
echo "Local Port: $LOCAL_PORT"
echo "Remote Socket: $REMOTE_SOCKET"
echo ""

# Check if tunnel is already running
if pgrep -f "ssh.*-L.*$LOCAL_PORT.*docker.sock" > /dev/null; then
    echo "SSH tunnel already running on port $LOCAL_PORT"
    echo "To stop it, run: pkill -f 'ssh.*-L.*$LOCAL_PORT.*docker.sock'"
    exit 1
fi

# Set up SSH tunnel
echo "Starting SSH tunnel..."
ssh -f -N -L $LOCAL_PORT:$REMOTE_SOCKET $SSH_HOST

if [ $? -eq 0 ]; then
    echo "SSH tunnel established successfully!"
    echo ""
    echo "Docker is now accessible at: tcp://localhost:$LOCAL_PORT"
    echo ""
    echo "To use with Docker MCP Server, run:"
    echo "  export DOCKER_HOST=tcp://localhost:$LOCAL_PORT"
    echo "  # or use environment variable:"
    echo "  DOCKER_MCP_HOST=tcp://localhost:$LOCAL_PORT node dist/index.js"
    echo ""
    echo "To stop the tunnel, run:"
    echo "  pkill -f 'ssh.*-L.*$LOCAL_PORT.*docker.sock'"
else
    echo "Failed to establish SSH tunnel"
    exit 1
fi
