import { formatBytes } from "@/lib/formatters";
import { Activity, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// ProcessCard.tsx
interface ProcessInfo {
    total: number;
    threads: number;
  }
  
  export const ProcessCard = ({ processes }: { processes: ProcessInfo }) => {
    return (
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
              <dd>{processes?.total}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Threads:
              </dt>
              <dd>{processes?.threads ?? 0}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    );
  };
  
  // NetworkCard.tsx
  interface NetworkStats {
    interface: string;
    rxBytes: number;
    txBytes: number;
  }
  
  interface NetworkSpeed {
    rxSpeed: number;
    txSpeed: number;
  }
  
  interface NetworkInfo {
    stats: NetworkStats;
    speed: NetworkSpeed;
  }
  
  export const NetworkCard = ({ network }: { network: NetworkInfo }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5" />
            Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h3>{network?.stats?.interface || "eth0"}</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Received:
              </dt>
              <dd>{formatBytes(network?.stats?.rxBytes || 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Transmitted:
              </dt>
              <dd>{formatBytes(network?.stats?.txBytes || 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Download Speed:
              </dt>
              <dd>
                {formatBytes(network?.speed?.rxSpeed || 0, true)}/s
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-muted-foreground">
                Upload Speed:
              </dt>
              <dd>
                {formatBytes(network?.speed?.txSpeed || 0, true)}/s
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    );
  };