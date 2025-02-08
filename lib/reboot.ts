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
