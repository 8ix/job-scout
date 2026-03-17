import { NextResponse } from "next/server";

export function validateApiKey(headers: Headers): boolean {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return false;
  const provided = headers.get("X-API-Key");
  return provided === apiKey;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
