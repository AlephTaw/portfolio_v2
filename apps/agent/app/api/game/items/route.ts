import { proxyGameApi } from "@/app/lib/game-api";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyGameApi(`/items${query}`, request);
}

export async function POST(request: Request) {
  return proxyGameApi("/items", request);
}
