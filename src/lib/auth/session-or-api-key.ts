import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/session";
import { validateApiKey } from "@/lib/auth/api-key";

export async function isSessionOrApiKeyAuthorized(
  headers: Headers
): Promise<boolean> {
  if (validateApiKey(headers)) return true;
  const session = await getServerSession(authOptions);
  return !!session;
}
