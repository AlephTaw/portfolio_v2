import { proxyGameApi } from "@/app/lib/game-api";

type RouteContext = { params: Promise<{ id: string }> };

async function rowPath(context: RouteContext) {
  const { id } = await context.params;
  return `/arc/rows/${encodeURIComponent(id)}`;
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxyGameApi(await rowPath(context), request);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxyGameApi(await rowPath(context), request);
}
