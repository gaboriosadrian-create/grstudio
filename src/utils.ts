/**
 * centralizes format and validation of media URLs (images and videos).
 * Supports both absolute URLs (starts with http/https) and local paths.
 */
export function formatMediaUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Rule 6: Correct any logic/cases where "/images/" or "images/" is automatically added in front of an absolute URL
  if (trimmed.startsWith('/images/http://') || trimmed.startsWith('/images/https://')) {
    return trimmed.substring(8); // remove "/images/"
  }
  if (trimmed.startsWith('images/http://') || trimmed.startsWith('images/https://')) {
    return trimmed.substring(7); // remove "images/"
  }
  
  // Rule 7 & 8: Detect if the URL starts with http:// or https://, and use it directly.
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Otherwise, treat it as a local resource of the public directory.
  // Ensure it starts with a leading slash so it is loaded relative to the root/public directory.
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  
  return `/${trimmed}`;
}
