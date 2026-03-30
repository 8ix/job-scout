import bcrypt from "bcryptjs";

/**
 * Verify plain password against DASHBOARD_PASSWORD (bcrypt hash or legacy plain).
 */
export async function verifyDashboardPassword(password: string): Promise<boolean> {
  const expectedPassword = process.env.DASHBOARD_PASSWORD;
  if (!expectedPassword || !password) return false;
  if (expectedPassword.startsWith("$2")) {
    return bcrypt.compare(password, expectedPassword);
  }
  return password === expectedPassword;
}
