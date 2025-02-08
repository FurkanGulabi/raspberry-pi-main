export function formatBytes(
  bytes: number,
  roundForNetworkSpeed?: boolean,
  decimals = 2
): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  let formattedValue = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  if (roundForNetworkSpeed && (sizes[i] === "KB" || sizes[i] === "MB")) {
    formattedValue = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  }

  return `${formattedValue} ${sizes[i]}`;
}

export function formatUptime(days: number, hours: number, minutes: number) {
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  return parts.join(" ");
}

export function formatTime(timeInSeconds: number): string {
  if (timeInSeconds < 0 || isNaN(timeInSeconds)) {
    return "N/A"; // Handle invalid time input
  }

  const diffInSeconds = Math.round(timeInSeconds);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hours ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} days ago`;
  }
}
