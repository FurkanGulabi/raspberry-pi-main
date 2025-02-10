"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBytes, formatUptime } from "@/lib/formatters";
import { SystemInfo } from "@/types/SystemInfo";
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStickIcon as Memory,
  Network,
  Power,
  PowerOff,
  Thermometer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { InfoCard } from "./InfoCard";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

export default function Dashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [rebooting, setRebooting] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(1500); // Start with 1.5s interval

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchSystemDetails = async () => {
      try {
        const response = await fetch("/api/getStats", {
          signal: controller.signal,
        });

        if (response.ok) {
          const data: SystemInfo = await response.json();
          if (isMounted) {
            setSystemInfo(data);
            setRebooting(false);
            // Reset to normal polling interval after successful reboot
            setPollingInterval(1500);
          }
        }
      } catch {
        if (isMounted && rebooting) {
          // Increase polling interval during reboot attempts
          setPollingInterval((prev) => Math.min(prev * 1.5, 30000)); // Max 30s
          console.log("Device offline, polling slower...");
        }
      }
    };

    const interval = setInterval(fetchSystemDetails, pollingInterval);
    fetchSystemDetails(); // Initial fetch

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [pollingInterval, rebooting]);

  if (!systemInfo) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6 flex flex-col items-center justify-center min-h-screen">
      <div className="container mx-auto space-y-6 flex items-center justify-center flex-col">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 w-full ">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center">
                <Thermometer className="mr-2 h-5 w-5" />
                Tempareture
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <div className="w-full">
                <div className="flex flex-row items-center justify-between">
                  <p className="text-muted-foreground text-sm">CPU</p>
                  <div className="text-2xl font-bold">{`${systemInfo.cpu.temp.toFixed(
                    1
                  )}°C`}</div>
                </div>
                <Progress value={systemInfo.cpu.temp} className="mt-2" />
              </div>

              <div className="w-full">
                <div className="flex flex-row items-center justify-between">
                  <p className="text-muted-foreground text-sm">GPU</p>
                  <div className="text-2xl font-bold">{`${systemInfo.gpu.temp.toFixed(
                    1
                  )}°C`}</div>
                </div>
                <Progress value={systemInfo.gpu.temp} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center">
                <Cpu className="mr-2 h-5 w-5" />
                Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full gap-4 flex flex-col items-center justify-center">
              <div className="w-full">
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-sm">CPU</p>
                  <div className="text-2xl font-bold">{`${systemInfo.cpu.usage}%`}</div>
                </div>
                <Progress
                  value={Number.parseFloat(systemInfo.cpu.usage)}
                  className="mt-2"
                />
              </div>
              <div className="w-full">
                <div className="flex justify-between">
                  <p className="text-muted-foreground text-sm">GPU</p>
                  <div className="text-2xl font-bold">{`${systemInfo.gpu.usage}%`}</div>
                </div>
                <Progress
                  value={Number.parseFloat(systemInfo.gpu.usage)}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <InfoCard
            title="Memory Usage"
            value={`${systemInfo.memoryUsage.percentUsed}%`}
            icon={<Memory className="mr-2 h-5 w-5" />}
            progress={Number.parseFloat(systemInfo.memoryUsage.percentUsed)}
            subtext={`${formatBytes(
              systemInfo.memoryUsage.used * 1024 * 1024 * 1024
            )} / ${formatBytes(
              systemInfo.memoryUsage.total * 1024 * 1024 * 1024
            )}`}
          />
          <InfoCard
            title="Disk Usage"
            value={systemInfo.diskUsage.percentUsed}
            icon={<HardDrive className="mr-2 h-5 w-5" />}
            progress={Number.parseInt(systemInfo.diskUsage.percentUsed)}
            subtext={`${systemInfo.diskUsage.used} / ${systemInfo.diskUsage.total}`}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Process Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Total Processes:
                  </dt>
                  <dd>{systemInfo?.processes?.total}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Threads:
                  </dt>
                  <dd>{systemInfo?.processes?.threads ?? 0}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="mr-2 h-5 w-5" />
                Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3>{systemInfo.network?.stats?.interface || "eth0"}</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Received:
                  </dt>
                  <dd>
                    {formatBytes(systemInfo.network?.stats?.rxBytes || 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Transmitted:
                  </dt>
                  <dd>
                    {formatBytes(systemInfo.network?.stats?.txBytes || 0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Download Speed:
                  </dt>
                  <dd>
                    {formatBytes(systemInfo.network?.speed?.rxSpeed || 0, true)}
                    /s
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Upload Speed:
                  </dt>
                  <dd>
                    {formatBytes(systemInfo.network?.speed?.txSpeed || 0, true)}
                    /s
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Power className="mr-2 h-5 w-5" />
                Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Uptime:
                  </dt>
                  <dd>
                    {formatUptime(
                      systemInfo.uptime.days,
                      systemInfo.uptime.hours,
                      systemInfo.uptime.minutes
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter>
              <div className="w-full flex items-center flex-row justify-center gap-8 px-10 h-full ">
                <Button variant="destructive" size="sm" className="w-full">
                  <PowerOff className="mr-2 h-4 w-4" />
                  Shutdown
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Power className="mr-2 h-4 w-4" />
                  Reboot
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
