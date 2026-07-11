import { ChefHat } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50">
            <ChefHat
              className="h-7 w-7 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            PantryPal
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400">
            Create your account
          </p>
        </div>

        <AuthForm
          action={register}
          submitLabel="Create account"
          alternateText="Already have an account?"
          alternateHref="/login"
          alternateLinkText="Sign in"
          passwordAutoComplete="new-password"
        />
      </div>
    </div>
  );
}
