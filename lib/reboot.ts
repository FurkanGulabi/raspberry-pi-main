import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function rebootPi() {
  try {
    // Execute the reboot command
    await execAsync("sudo reboot");
    return { status: "success", message: "Rebooting the Raspberry Pi..." };
  } catch (error) {
    console.error("Reboot Error:", error);
    return { status: "error", message: "Failed to reboot the Raspberry Pi." };
  }
}

export async function shutdownPi() {
  try {
    // Execute the shutdown command
    await execAsync("sudo shutdown now");
    return { status: "success", message: "Shutting down the Raspberry Pi..." };
  } catch (error) {
    console.error("Shutdown Error:", error);
    return { status: "error", message: "Failed to shutdown the Raspberry Pi." };
  }
}
