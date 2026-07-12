import { AuthLayout } from "@/components/auth-layout";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your ShelfLife account"
      subtitle="Start organising your pantry in minutes."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
