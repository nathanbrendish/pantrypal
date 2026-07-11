"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { triggerShoppingListRegeneration } from "@/app/actions/shopping";
import { createClient } from "@/lib/supabase/server";

export type PantryFormState = {
  error: string;
} | null;

export type PantryActionResult =
  | { success: true }
  | { success: false; error: string };

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

function parseQuantity(value: FormDataEntryValue | null): number {
  const parsed = Number.parseFloat(String(value ?? "1"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function addIngredient(
  _prevState: PantryFormState,
  formData: FormData
): Promise<PantryFormState> {
  const ingredientName = (formData.get("ingredient_name") as string)?.trim();
  const quantity = parseQuantity(formData.get("quantity"));
  const unit = (formData.get("unit") as string)?.trim() || null;
  const expiryDate = (formData.get("expiry_date") as string)?.trim() || null;

  if (!ingredientName) {
    return { error: "Ingredient name is required." };
  }

  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase.from("pantry").insert({
    user_id: user.id,
    ingredient_name: ingredientName,
    quantity,
    unit,
    expiry_date: expiryDate,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  await triggerShoppingListRegeneration();

  revalidatePath("/pantry");
  revalidatePath("/dashboard");
  return null;
}

export async function updatePantryItem(
  id: string,
  data: {
    ingredient_name: string;
    quantity: number;
    unit: string | null;
    expiry_date: string | null;
  }
): Promise<PantryActionResult> {
  const ingredientName = data.ingredient_name.trim();

  if (!ingredientName) {
    return { success: false, error: "Ingredient name is required." };
  }

  if (!Number.isFinite(data.quantity) || data.quantity <= 0) {
    return { success: false, error: "Quantity must be greater than 0." };
  }

  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("pantry")
    .update({
      ingredient_name: ingredientName,
      quantity: data.quantity,
      unit: data.unit?.trim() || null,
      expiry_date: data.expiry_date?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  await triggerShoppingListRegeneration();

  revalidatePath("/pantry");
  revalidatePath("/dashboard");
  revalidatePath("/meals");

  return { success: true };
}

export async function deleteIngredient(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return;
  }

  const { supabase, user } = await getAuthenticatedUser();

  await supabase
    .from("pantry")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  await triggerShoppingListRegeneration();

  revalidatePath("/pantry");
  revalidatePath("/dashboard");
  revalidatePath("/meals");
}
