import { exec } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CpuStats {
  user: number;
  nice: number;
  system: number;
  idle: number;
  iowait: number;
  irq: number;
  softirq: number;
  steal: number;
  guest: number;
  guestNice: number;
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

let previousCpuStats: CpuStats[] | null = null;
let previousNetworkStats: NetworkStats[] | null = null;

// Existing CPU parsing functions remain the same
function parseCpuLine(line: string): CpuStats {
  const parts = line.trim().split(/\s+/);
  return {
    user: parseInt(parts[1], 10),
    nice: parseInt(parts[2], 10),
    system: parseInt(parts[3], 10),
    idle: parseInt(parts[4], 10),
    iowait: parseInt(parts[5], 10),
    irq: parseInt(parts[6], 10),
    softirq: parseInt(parts[7], 10),
    steal: parseInt(parts[8], 10),
    guest: parseInt(parts[9] || "0", 10),
    guestNice: parseInt(parts[10] || "0", 10),
  };
}

// New function to get GPU temperature
async function getGpuTemp(): Promise<number> {
  try {
    const { stdout } = await execAsync("vcgencmd measure_temp");
    return parseFloat(stdout.replace("temp=", "").replace("'C", ""));
  } catch (error) {
    console.error(error);
    return 0;
  }
}

// New function to get network statistics
async function getNetworkStats(): Promise<NetworkStats[]> {
  try {
    const data = await fs.readFile("/proc/net/dev", "utf8");
    const lines = data.trim().split("\n").slice(2); // Skip header lines

    return lines.map((line) => {
      const parts = line.trim().split(/\s+/);
      return {
        interface: parts[0].replace(":", ""),
        rxBytes: parseInt(parts[1], 10),
        txBytes: parseInt(parts[9], 10),
        rxPackets: parseInt(parts[2], 10),
        txPackets: parseInt(parts[10], 10),
        rxErrors: parseInt(parts[3], 10),
        txErrors: parseInt(parts[11], 10),
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

// New function to get voltage
async function getVoltage(): Promise<number> {
  try {
    const { stdout } = await execAsync("vcgencmd measure_volts core");
    return parseFloat(stdout.replace("volt=", "").replace("V", ""));
  } catch (error) {
    console.error(error);
    return 0;
  }
}

// New function to get process statistics
async function getProcessStats() {
  const processes = await fs.readdir("/proc");
  const pidRegex = /^\d+$/;
  const runningProcesses = processes.filter((pid) => pidRegex.test(pid)).length;

  return {
    total: runningProcesses,
    threads: (await execAsync("ps -eLf | wc -l")).stdout.trim(),
  };
}

async function getGpuUsage(): Promise<number> {
  try {
    const { stdout } = await execAsync("vcgencmd measure_clock v3d"); // Example stdout: "frequency(48)=500000000"
    const gpuClockHz = parseInt(stdout.split("=")[1].trim(), 10);
    const gpuClockMHz = gpuClockHz / 1e6; // These baseline values are hypothetical; adjust based on your measurements:

    const idleClockMHz = 250; // GPU clock in MHz when idle
    const maxClockMHz = 500; // GPU clock in MHz under maximum load // Calculate usage percentage

    let usage =
      ((gpuClockMHz - idleClockMHz) / (maxClockMHz - idleClockMHz)) * 100;
    usage = Math.max(0, Math.min(100, usage)); // Clamp between 0 and 100

    return usage;
  } catch (error) {
    console.error("Error getting GPU usage:", error);
    return 0;
  }
}

// New function to get last reboot time
async function getLastRebootTime(): Promise<string> {
  try {
    const { stdout } = await execAsync("uptime -s");
    return stdout.trim();
  } catch (error) {
    console.error("Error getting last reboot time:", error);
    return "N/A"; // Or handle error as needed
  }
}

// Helper function to calculate network speed
function calculateNetworkSpeed(
  current: NetworkStats[],
  previous: NetworkStats[]
) {
  const interval = 1; // Assuming 1 second interval
  const curr = current.find((c) => c.interface === "eth0");
  const prev = previous.find((p) => p.interface === "eth0");

  if (!curr || !prev) return null;

  return {
    interface: curr.interface,
    rxSpeed: (curr.rxBytes - prev.rxBytes) / interval,
    txSpeed: (curr.txBytes - prev.txBytes) / interval,
  };
}

async function readProcStat(): Promise<CpuStats[]> {
  const data = await fs.readFile("/proc/stat", "utf8");
  return data
    .split("\n")
    .filter((line) => line.startsWith("cpu"))
    .map(parseCpuLine);
}

function calculateCpuUsage(
  current: CpuStats[],
  previous: CpuStats[]
): string[] {
  return current.map((curr, i) => {
    const prev = previous[i];
    const idle = curr.idle + curr.iowait - (prev.idle + prev.iowait);
    const total =
      Object.values(curr).reduce((a, b) => a + b, 0) -
      Object.values(prev).reduce((a, b) => a + b, 0);
    const usage = 100 * (1 - idle / total);
    return usage.toFixed(1);
  });
}

async function getCpuTemp(): Promise<number> {
  try {
    const data = await fs.readFile(
      "/sys/class/thermal/thermal_zone0/temp",
      "utf8"
    );
    return parseFloat(data) / 1000;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

async function getCpuClock(): Promise<number> {
  try {
    const { stdout } = await execAsync("vcgencmd measure_clock arm");
    return parseInt(stdout.split("=")[1], 10) / 1000000;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

async function getDiskUsage() {
  try {
    const { stdout } = await execAsync("df -h /");
    const lines = stdout.trim().split("\n");
    const parts = lines[1].split(/\s+/);
    return {
      total: parts[1],
      used: parts[2],
      free: parts[3],
      percentUsed: parts[4],
    };
  } catch (error) {
    console.error(error);
    return {
      total: "0",
      used: "0",
      free: "0",
      percentUsed: "0%",
    };
  }
}

function getUptime() {
  const uptime = os.uptime();
  return {
    days: Math.floor(uptime / 86400),
    hours: Math.floor((uptime % 86400) / 3600),
    minutes: Math.floor((uptime % 3600) / 60),
  };
}

function bytesToGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(2);
}

// Modified main function

export async function getSystemDetails() {
  const currentStats = await readProcStat();
  const currentNetworkStats = await getNetworkStats();

  let cpuUsage: string | null = null;
  let networkSpeed: null | unknown = null;

  if (previousCpuStats) {
    cpuUsage = calculateCpuUsage(currentStats, previousCpuStats)[0];
  } else {
    cpuUsage = "0.0";
  }

  if (previousNetworkStats) {
    networkSpeed = calculateNetworkSpeed(
      currentNetworkStats,
      previousNetworkStats
    );
  }

  previousCpuStats = currentStats;
  previousNetworkStats = currentNetworkStats;

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const [
    cpuTemp,
    gpuTemp,
    voltage,
    processStats,
    diskUsage,
    gpuUsage,
    lastReboot,
  ] = await Promise.all([
    getCpuTemp(),
    getGpuTemp(),
    getVoltage(),
    getProcessStats(),
    getDiskUsage(),
    getGpuUsage(), // New GPU usage calculation
    getLastRebootTime(), // Get last reboot time
  ]);

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpu: {
      temp: cpuTemp,
      usage: cpuUsage,
      clock: await getCpuClock(),
      cores: os.cpus().length,
      model: os.cpus()[0].model,
      loadAverage: os.loadavg(),
    },
    gpu: {
      temp: gpuTemp,
      usage: gpuUsage,
    },
    voltage: {
      core: voltage,
    },
    memoryUsage: {
      total: parseFloat(bytesToGB(totalMem)),
      used: parseFloat(bytesToGB(usedMem)),
      free: parseFloat(bytesToGB(freeMem)),
      percentUsed: ((usedMem / totalMem) * 100).toFixed(1),
    },
    network: {
      speed: networkSpeed,
      stats: currentNetworkStats[1],
    },
    processes: processStats,
    diskUsage,
    uptime: getUptime(), // This will now return {days, hours, minutes}
    system: {
      osInfo: {
        type: os.type(),
        release: os.release(),
        version: os.version(),
        lastReboot: lastReboot, // Added last reboot time here
      },
      loadAverage: os.loadavg(),
    },
  };
}
