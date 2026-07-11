export function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase();
}

export function isValidIngredientName(name: string): boolean {
  return name.trim().length > 0;
}
