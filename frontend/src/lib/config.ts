const defaultGatewayBaseUrl = "http://localhost:8080/api";

function withoutTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export const gatewayBaseUrl = withoutTrailingSlash(
  process.env.API_GATEWAY_URL ??
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ??
  defaultGatewayBaseUrl,
);

export const clientGatewayBaseUrl = withoutTrailingSlash(
  process.env.NEXT_PUBLIC_CLIENT_API_BASE_URL ?? "/api",
);
