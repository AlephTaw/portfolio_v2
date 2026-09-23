import { proxyGameApi } from "@/app/lib/game-api";

export async function GET(request: Request) {
  return proxyGameApi("/arc/rows", request);
}

export async function POST(request: Request) {
  return proxyGameApi("/arc/rows", request);
}
