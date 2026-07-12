export function getDisplayName(
  metadata: Record<string, unknown> | undefined
): string | null {
  if (!metadata) return null;

  if (
    typeof metadata.display_name === "string" &&
    metadata.display_name.trim()
  ) {
    return metadata.display_name.trim();
  }

  if (typeof metadata.full_name === "string" && metadata.full_name.trim()) {
    return metadata.full_name.trim();
  }

  if (typeof metadata.name === "string" && metadata.name.trim()) {
    return metadata.name.trim();
  }

  return null;
}

export function getFirstName(
  metadata: Record<string, unknown> | undefined
): string | null {
  const displayName = getDisplayName(metadata);
  if (!displayName) return null;

  if (typeof metadata?.first_name === "string" && metadata.first_name.trim()) {
    return metadata.first_name.trim();
  }

  return displayName.split(" ")[0] ?? null;
}
