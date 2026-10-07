/** Auth.js appends its own query string; normalize it before reopening the modal. */
export function GET(request: Request): Response {
  const incoming = new URL(request.url);
  const destination = new URL("/", incoming.origin);
  destination.searchParams.set("auth", "return");
  if (incoming.searchParams.has("error")) destination.searchParams.set("error", "signin");
  return Response.redirect(destination, 303);
}
