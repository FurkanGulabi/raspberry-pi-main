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
  Eye,
  EyeClosed,
  HardDrive,
  Loader2,
  MemoryStickIcon as Memory,
  Network,
  Power,
  PowerOff,
  Thermometer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InfoCard } from "./InfoCard";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";

const INITIAL_POLLING_INTERVAL = 1500;

interface PowerState {
  isLoading: boolean;
  type: "reboot" | "shutdown" | null;
  toastId: string | number | undefined;
}

// Added an interface for the API response from the power action
interface PowerResponse {
  message: string;
  error?: boolean;
}

export default function Dashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [pollingInterval, setPollingInterval] = useState(INITIAL_POLLING_INTERVAL);
  const [powerState, setPowerState] = useState<PowerState>({
    isLoading: false,
    type: null,
    toastId: undefined,
  });
  const [keyValue, setKeyValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);



  useEffect(() => {
    const controller = new AbortController();
    const interval = setInterval(() => fetchSystemDetails(controller.signal), pollingInterval);

    fetchSystemDetails(controller.signal);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [pollingInterval, powerState.isLoading, powerState.type]);

  const fetchSystemDetails = async (signal: AbortSignal) => {
    try {
      const response = await fetch("/api/getStats", { signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SystemInfo = await response.json();
      setSystemInfo(data);
      // Removed toast call previously triggered on powerState success
      setPollingInterval(INITIAL_POLLING_INTERVAL);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      // Removed toast call in catch block to avoid showing false success toast
    }
  };

  const handlePowerAction = async (type: "reboot" | "shutdown") => {
    setPowerState({
      isLoading: true,
      type,
      toastId: undefined,
    });

    // Use the defined PowerResponse type instead of any
    const powerPromise: Promise<PowerResponse> = fetch("/api/power", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyValue, type }),
    }).then(async (response) => {
      const data = (await response.json()) as PowerResponse;
      if (!response.ok || data.error) {
        throw new Error(data.message || "An error occurred");
      }
      return data;
    });

    toast.promise(powerPromise, {
      loading: type === "reboot" ? "Rebooting..." : "Shutting down...",
      success: () => {
        setPowerState(prev => ({ ...prev, isLoading: false }));
        return type === "reboot" ? "Reboot Successful" : "Shutdown Successful";
      },
      error: (err: unknown) => {
        setPowerState(prev => ({ ...prev, isLoading: false }));
        let errorMessage = "An unexpected error occurred";
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        return errorMessage;
      }
    });

    setKeyValue("");
    setIsDialogOpen(false);
  };

  if (!systemInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const renderMetricCard = (label: string, value: number, unit: string) => (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between">
        <p className="text-muted-foreground text-sm">{label}</p>
        <div className="text-2xl font-bold">{`${value.toFixed(1)}${unit}`}</div>
      </div>
      <Progress value={value} className="mt-2" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 flex flex-col items-center justify-center min-h-screen">
      <div className="container mx-auto space-y-6 flex items-center justify-center flex-col">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center">
                <Thermometer className="mr-2 h-5 w-5" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
              {renderMetricCard("CPU", systemInfo.cpu.temp, "°C")}
              {renderMetricCard("GPU", systemInfo.gpu.temp, "°C")}
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
              {renderMetricCard("CPU", Number.parseFloat(systemInfo.cpu.usage), "%")}
              {renderMetricCard("GPU", Number.parseFloat(systemInfo.gpu.usage), "%")}
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
                  <dd>{formatBytes(systemInfo.network?.stats?.rxBytes || 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Transmitted:
                  </dt>
                  <dd>{formatBytes(systemInfo.network?.stats?.txBytes || 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Download Speed:
                  </dt>
                  <dd>
                    {formatBytes(systemInfo.network?.speed?.rxSpeed || 0, true)}/s
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Upload Speed:
                  </dt>
                  <dd>
                    {formatBytes(systemInfo.network?.speed?.txSpeed || 0, true)}/s
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
              <div className="w-full flex items-center flex-row justify-center gap-8 px-10 h-full">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      disabled={powerState.isLoading}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      Power
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure you want to shutdown?</DialogTitle>
                      <DialogDescription>Enter the secret key to proceed</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <div className="w-full flex flex-col items-center justify-center gap-2">
                        <div className="w-full relative flex items-center">
                          <Input
                            className="w-full pr-10"
                            type={isKeyVisible ? "text" : "password"}
                            placeholder="key.."
                            value={keyValue}
                            onChange={(e) => setKeyValue(e.target.value)}
                          />
                          <Button
                            variant="ghost"
                            className="absolute right-2 bg-transparent hover:bg-transparent top-1/2 transform -translate-y-1/2 p-1"
                            onClick={() => setIsKeyVisible(!isKeyVisible)}
                          >
                            {isKeyVisible ? (
                              <Eye className="h-5 w-5" />
                            ) : (
                              <EyeClosed className="h-5 w-5" />
                            )}
                          </Button>
                        </div>

                        <Button
                          variant="destructive"
                          className="w-full"
                          disabled={powerState.isLoading || !keyValue}
                          onClick={() => handlePowerAction("shutdown")}
                        >
                          <PowerOff className="mr-2 h-4 w-4" />
                          Shutdown
                        </Button>

                        <Button
                          variant="ghost"
                          className="w-full border"
                          disabled={powerState.isLoading || !keyValue}
                          onClick={() => handlePowerAction("reboot")}
                        >
                          <Power className="mr-2 h-4 w-4" />
                          Reboot
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}