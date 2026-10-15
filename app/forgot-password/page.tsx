import { BP } from "@/lib/basepath";
import { demoEnabled } from "@/lib/session";
import { firebaseClientConfig, firebaseConfigured } from "@/lib/isdead-auth/config";
import { AuthScreen } from "@/components/AuthScreen";
export const dynamic = "force-dynamic"; export const metadata = { title: "Reset your password" };
/** Bitly keeps password reset on its own URL (/a/forgot_password); so do we. */
export default function ForgotPassword() { return <AuthScreen config={firebaseConfigured() ? firebaseClientConfig() : null} demo={demoEnabled()} to={BP + "/app"} reset />; }
