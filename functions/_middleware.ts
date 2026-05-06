// Cloudflare Pages middleware for security headers and routing
export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  // Add security headers
  const newResponse = new Response(response.body, response);
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");
  newResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  newResponse.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  return newResponse;
};
