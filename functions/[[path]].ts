// Cloudflare Pages catch-all route for Next.js
// This passes all requests to the Next.js application

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  
  // Pass the request to Next.js
  return fetch(context.request);
};
