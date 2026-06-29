// Server-side service URLs. These are read only in route handlers / server components,
// so internal Docker hostnames never leak to the browser.
export const config = {
  // Python BFF (App 1 backend).
  bffUrl: process.env.BFF_URL ?? "http://localhost:8001",
  // Java Spring Boot backend (App 2).
  marketApiUrl: process.env.MARKET_API_URL ?? "http://localhost:8080",
};
