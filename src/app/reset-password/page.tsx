import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password");
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your account."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
