export function tryReadLocalStorageJson<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (value == null) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
