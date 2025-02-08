import { rebootPi } from "@/lib/reboot";

const SECRET_KEY = process.env.SECRET_KEY; // Replace with a strong secret key

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key } = body;

    // Check if the provided key matches the secret key
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
    const result = await rebootPi();
    return new Response(JSON.stringify(result), {
      status: result.status === "success" ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
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
