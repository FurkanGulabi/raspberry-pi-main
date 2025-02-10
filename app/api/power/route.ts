import { rebootPi, shutdownPi } from "@/lib/reboot";

const SECRET_KEY = process.env.SECRET_KEY; // Replace with a strong secret key

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, type } = body;

    // Check if the provided key matches the secret key
    if (!key || !type) {
      return new Response(
        JSON.stringify({ status: "error", message: "Key or type is missing" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (key != SECRET_KEY) {
      return new Response(
        JSON.stringify({ status: "error", message: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Reboot the Raspberry Pi if the key is correct
    if (type === "reboot") {
      await rebootPi();
    } else if (type === "shutdown") {
      await shutdownPi();
    } else {
      return new Response(
        JSON.stringify({ status: "error", message: "Invalid type" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ status: "success", message: "Success" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error during reboot:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
