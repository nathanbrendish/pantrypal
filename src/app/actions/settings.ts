"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { isPasswordStrong, isValidEmail } from "@/lib/password-validation";

export type SettingsState = {
  error?: string;
  success?: string;
} | null;

export async function updateProfile(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const displayName = (formData.get("displayName") as string)?.trim();

  if (!displayName) {
    return { error: "Display name is required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
      full_name: displayName,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings", "page");
  revalidatePath("/dashboard", "page");
  return { success: "Profile updated successfully." };
}

export async function updateEmail(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const email = (formData.get("email") as string)?.trim();

  if (!email || !isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${getSiteUrl()}/auth/callback` }
  );

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Check your inbox to confirm your new email address. Your email won't change until you verify it.",
  };
}

export async function changePassword(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!isPasswordStrong(newPassword)) {
    return { error: "Please choose a stronger password that meets all requirements." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated successfully." };
}

export async function deleteAccount(): Promise<SettingsState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_user_account");

  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?deleted=1");
}
