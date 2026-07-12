import { AuthLayout } from "@/components/auth-layout";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="We'll email you a ShelfLife link to reset your password."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
