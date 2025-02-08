// app/api/system/route.ts
import { getSystemDetails } from "@/lib/system";

// Önbellekte tutmak için global değişkenler

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSystemInfo: any = null;
let lastFetchTime = 0;

export async function GET() {
  const now = Date.now();

  // Eğer son alınan veriden bu yana 1 saniyeden fazla geçmişse yeniden al
  if (!cachedSystemInfo || now - lastFetchTime > 1000) {
    cachedSystemInfo = await getSystemDetails();

    lastFetchTime = now;
  }

  return new Response(JSON.stringify(cachedSystemInfo), {
    headers: { "Content-Type": "application/json" },
  });
}
