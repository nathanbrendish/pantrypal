import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{ reset?: string; deleted?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to ShelfLife to manage your pantry and meal plans."
      footer={
        params.reset === "success" ? (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
            Your password has been updated. You can sign in now.
          </p>
        ) : params.deleted === "1" ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Your account has been permanently deleted.
          </p>
        ) : null
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
