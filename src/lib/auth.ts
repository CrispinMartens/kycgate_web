export const AUTH_COOKIE_NAME = "kycgate_auth";

const DEMO_EMAIL = "admin@kycgate.io";
const DEMO_PASSWORD = "admin123";

export function isValidLogin(email: string, password: string) {
  return (
    email.trim().toLowerCase() === DEMO_EMAIL &&
    password === DEMO_PASSWORD
  );
}
