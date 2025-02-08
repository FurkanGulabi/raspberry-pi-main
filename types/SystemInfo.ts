export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  cpu: CPU;
  gpu: GPU;
  voltage: Voltage;
  memoryUsage: MemoryUsage;
  diskUsage: DiskUsage;
  uptime: Uptime;
  system: System;
  network: Network;
  processes?: Processes;
}

interface CPU {
  temp: number;
  usage: string;
  clock: number;
  cores: number;
  model: string;
  loadAverage: number[];
}

interface GPU {
  temp: number;
  usage: string;
}

interface Voltage {
  core: number;
}

interface MemoryUsage {
  total: number;
  used: number;
  free: number;
  percentUsed: string;
}

interface DiskUsage {
  total: string;
  used: string;
  free: string;
  percentUsed: string;
}

interface Uptime {
  days: number;
  hours: number;
  minutes: number;
}

interface System {
  osInfo: OSInfo;
  loadAverage: number[];
}

interface OSInfo {
  type: string;
  release: string;
  version: string;
  lastReboot: Date;
}

interface Network {
  speed: NetworkSpeed[];
  stats: NetworkStats[];
}

interface NetworkSpeed {
  interface: string;
  rxSpeed: number;
  txSpeed: number;
}

interface NetworkStats {
  interface: string;
  rxBytes: number;
  txBytes: number;
  rxPackets: number;
  txPackets: number;
  rxErrors: number;
  txErrors: number;
}

interface Processes {
  total: number;
  threads: string;
}
