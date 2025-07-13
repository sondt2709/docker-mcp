import { ContainerInfo, ImageInfo, NetworkInspectInfo } from "dockerode";

// Extended Docker types for MCP responses
export interface DockerContainerSummary {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  State: string;
  Status: string;
  Ports: Array<{
    IP?: string;
    PrivatePort: number;
    PublicPort?: number;
    Type: string;
  }>;
  Labels: Record<string, string>;
  NetworkSettings: {
    Networks: Record<string, any>;
  };
  Mounts: Array<{
    Type: string;
    Source: string;
    Destination: string;
    Mode: string;
    RW: boolean;
    Propagation: string;
  }>;
}

export interface DockerImageSummary {
  Id: string;
  ParentId: string;
  RepoTags: string[];
  RepoDigests: string[];
  Created: number;
  Size: number;
  SharedSize: number;
  VirtualSize: number;
  Labels: Record<string, string>;
  Containers: number;
}

export interface DockerNetworkSummary {
  Id: string;
  Name: string;
  Driver: string;
  Scope: string;
  Created: string;
  EnableIPv6: boolean;
  IPAM: {
    Driver: string;
    Options: Record<string, any>;
    Config: Array<{
      Subnet: string;
      Gateway: string;
    }>;
  };
  Internal: boolean;
  Attachable: boolean;
  Ingress: boolean;
  Containers: Record<string, {
    Name: string;
    EndpointID: string;
    MacAddress: string;
    IPv4Address: string;
    IPv6Address: string;
  }>;
  Options: Record<string, any>;
  Labels: Record<string, string>;
}

export interface DockerVolumeSummary {
  CreatedAt: string;
  Driver: string;
  Labels: Record<string, string>;
  Mountpoint: string;
  Name: string;
  Options: Record<string, any>;
  Scope: string;
  Status?: Record<string, any>;
  UsageData?: {
    RefCount: number;
    Size: number;
  };
}

export interface DockerSystemInfo {
  ID: string;
  Containers: number;
  ContainersRunning: number;
  ContainersPaused: number;
  ContainersStopped: number;
  Images: number;
  Driver: string;
  DriverStatus: Array<[string, string]>;
  SystemStatus: Array<[string, string]>;
  Plugins: {
    Volume: string[];
    Network: string[];
    Authorization: string[];
    Log: string[];
  };
  MemoryLimit: boolean;
  SwapLimit: boolean;
  KernelMemory: boolean;
  CpuCfsPeriod: boolean;
  CpuCfsQuota: boolean;
  CPUShares: boolean;
  CPUSet: boolean;
  PidsLimit: boolean;
  IPv4Forwarding: boolean;
  BridgeNfIptables: boolean;
  BridgeNfIp6tables: boolean;
  Debug: boolean;
  NFd: number;
  NGoroutines: number;
  SystemTime: string;
  LoggingDriver: string;
  CgroupDriver: string;
  NEventsListener: number;
  KernelVersion: string;
  OperatingSystem: string;
  OSType: string;
  Architecture: string;
  IndexServerAddress: string;
  RegistryConfig: {
    AllowNondistributableArtifactsCIDRs: string[];
    AllowNondistributableArtifactsHostnames: string[];
    InsecureRegistryCIDRs: string[];
    IndexConfigs: Record<string, any>;
    Mirrors: string[];
  };
  NCPU: number;
  MemTotal: number;
  GenericResources: Array<{
    NamedResourceSpec?: {
      Kind: string;
      Value: string;
    };
    DiscreteResourceSpec?: {
      Kind: string;
      Value: number;
    };
  }>;
  DockerRootDir: string;
  HttpProxy: string;
  HttpsProxy: string;
  NoProxy: string;
  Name: string;
  Labels: string[];
  ExperimentalBuild: boolean;
  ServerVersion: string;
  ClusterStore: string;
  ClusterAdvertise: string;
  Runtimes: Record<string, {
    path: string;
    runtimeArgs?: string[];
  }>;
  DefaultRuntime: string;
  Swarm: {
    NodeID: string;
    NodeAddr: string;
    LocalNodeState: string;
    ControlAvailable: boolean;
    Error: string;
    RemoteManagers: Array<{
      NodeID: string;
      Addr: string;
    }>;
  };
  LiveRestoreEnabled: boolean;
  Isolation: string;
  InitBinary: string;
  ContainerdCommit: {
    ID: string;
    Expected: string;
  };
  RuncCommit: {
    ID: string;
    Expected: string;
  };
  InitCommit: {
    ID: string;
    Expected: string;
  };
  SecurityOptions: string[];
  ProductLicense: string;
  Warnings: string[];
}

export interface DockerVersion {
  Version: string;
  ApiVersion: string;
  MinAPIVersion: string;
  GitCommit: string;
  GoVersion: string;
  Os: string;
  Arch: string;
  KernelVersion: string;
  BuildTime: string;
  Components: Array<{
    Name: string;
    Version: string;
    Details: Record<string, any>;
  }>;
}

export interface DockerDiskUsage {
  LayersSize: number;
  Images: Array<{
    Id: string;
    ParentId: string;
    RepoTags: string[];
    RepoDigests: string[];
    Created: number;
    Size: number;
    SharedSize: number;
    VirtualSize: number;
    Labels: Record<string, string>;
    Containers: number;
  }>;
  Containers: Array<{
    Id: string;
    Names: string[];
    Image: string;
    ImageID: string;
    Command: string;
    Created: number;
    State: string;
    Status: string;
    Ports: Array<{
      IP?: string;
      PrivatePort: number;
      PublicPort?: number;
      Type: string;
    }>;
    SizeRw: number;
    SizeRootFs: number;
    Labels: Record<string, string>;
    NetworkSettings: {
      Networks: Record<string, any>;
    };
    Mounts: Array<{
      Type: string;
      Source: string;
      Destination: string;
      Mode: string;
      RW: boolean;
      Propagation: string;
    }>;
  }>;
  Volumes: Array<{
    Name: string;
    Driver: string;
    Mountpoint: string;
    CreatedAt: string;
    Status: Record<string, any>;
    Labels: Record<string, string>;
    Scope: string;
    Options: Record<string, any>;
    UsageData: {
      Size: number;
      RefCount: number;
    };
  }>;
  BuildCache: Array<{
    ID: string;
    Parent: string;
    Type: string;
    Description: string;
    InUse: boolean;
    Shared: boolean;
    Size: number;
    CreatedAt: string;
    LastUsedAt: string;
    UsageCount: number;
  }>;
}

export interface ContainerRestartInfo {
  containerId: string;
  name: string;
  restartCount: number;
  lastRestartTime: string;
  isRestartLoop: boolean;
  restartPolicy: string;
  exitCode?: number;
  error?: string;
}

export interface DockerComposeProject {
  name: string;
  services: string[];
  networks: string[];
  volumes: string[];
  configFiles: string[];
}

export interface CleanupResult {
  deletedItems: string[];
  reclaimedSpace: number;
  errors: string[];
  summary: string;
}

export interface CleanupSummary {
  images: {
    count: number;
    size: number;
    items: string[];
  };
  containers: {
    count: number;
    size: number;
    items: string[];
  };
  volumes: {
    count: number;
    size: number;
    items: string[];
  };
  networks: {
    count: number;
    items: string[];
  };
  buildCache: {
    count: number;
    size: number;
    items: string[];
  };
  totalSize: number;
}
