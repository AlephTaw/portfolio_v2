import { NextResponse } from "next/server";

const MOCK_RESPONSE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A JSON request body is required." }, { status: 400 });
  }

  const prompt =
    body && typeof body === "object" && "prompt" in body
      ? (body as { prompt?: unknown }).prompt
      : null;

  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "A non-empty prompt is required." }, { status: 400 });
  }

  return NextResponse.json({
    role: "assistant",
    content: MOCK_RESPONSE,
  });
}
