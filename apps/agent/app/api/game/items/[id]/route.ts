import { proxyGameApi } from "@/app/lib/game-api";

type RouteContext = { params: Promise<{ id: string }> };

async function itemPath(context: RouteContext) {
  const { id } = await context.params;
  return `/items/${encodeURIComponent(id)}`;
}

export async function GET(request: Request, context: RouteContext) {
  return proxyGameApi(await itemPath(context), request);
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxyGameApi(await itemPath(context), request);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxyGameApi(await itemPath(context), request);
}
