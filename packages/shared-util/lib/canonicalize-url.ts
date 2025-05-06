export function canonicalizeUrl(url: string | null): string | null {
  if (url == null) {
    return null;
  }

  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}
