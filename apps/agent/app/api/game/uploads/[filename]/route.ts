import { proxyGameApi } from "@/app/lib/game-api";

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { filename } = await context.params;
  return proxyGameApi(`/uploads/${encodeURIComponent(filename)}`, request);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { filename } = await context.params;
  return proxyGameApi(`/uploads/${encodeURIComponent(filename)}`, request);
}
