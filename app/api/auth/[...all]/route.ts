import type { NextRequest } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import { rewriteSetCookieForIframe } from "@/lib/profile-utils";

const handler = toNextJsHandler(auth);

function isHttpsRequest(req: NextRequest): boolean {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }
  return req.nextUrl.protocol === "https:";
}

function withIframeCookies(req: NextRequest, response: Response): Response {
  const headers = new Headers(response.headers);
  const getSetCookie = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;

  if (typeof getSetCookie === "function") {
    const cookies = getSetCookie.call(response.headers);
    if (cookies.length > 0) {
      const isHttps = isHttpsRequest(req);
      headers.delete("set-cookie");
      for (const cookie of cookies) {
        headers.append(
          "set-cookie",
          rewriteSetCookieForIframe(cookie, isHttps),
        );
      }
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function GET(req: NextRequest): Promise<Response> {
  const response = await handler.GET(req);
  return withIframeCookies(req, response);
}

export async function POST(req: NextRequest): Promise<Response> {
  const response = await handler.POST(req);
  return withIframeCookies(req, response);
}