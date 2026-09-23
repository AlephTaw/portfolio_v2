const DEFAULT_GAME_API_URL = "http://127.0.0.1:8000";

export function gameApiUrl(path: string): string {
  const baseUrl = (process.env.GAME_API_URL || DEFAULT_GAME_API_URL).replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function proxyGameApi(
  path: string,
  request?: Request,
): Promise<Response> {
  try {
    const headers = new Headers();
    const contentType = request?.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);

    const response = await fetch(gameApiUrl(path), {
      body:
        request && !["GET", "HEAD"].includes(request.method)
          ? await request.arrayBuffer()
          : undefined,
      cache: "no-store",
      headers,
      method: request?.method || "GET",
    });

    return new Response(response.body, {
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
      },
      status: response.status,
    });
  } catch (error) {
    return Response.json(
      {
        detail:
          error instanceof Error
            ? `Game API unavailable: ${error.message}`
            : "Game API unavailable",
      },
      { status: 502 },
    );
  }
}
