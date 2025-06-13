export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces and multiple spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters
    .substring(0, 100)
    // Remove trailing hyphen if substring cut in the middle
    .replace(/-+$/, '');
}

export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Try with numbers first (more readable)
  for (let i = 2; i <= 10; i++) {
    const numberedSlug = `${baseSlug}-${i}`;
    if (!existingSlugs.includes(numberedSlug)) {
      return numberedSlug;
    }
  }

  // If numbers don't work, use random string
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomString}`;
} 