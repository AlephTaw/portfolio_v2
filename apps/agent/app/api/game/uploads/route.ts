import { proxyGameApi } from "@/app/lib/game-api";

export async function POST(request: Request) {
  return proxyGameApi("/uploads", request);
}
