import { canonicalizeUrl } from './canonicalize-url';

describe(canonicalizeUrl.name, () => {
  it('returns the canonicalized URL', () => {
    expect(canonicalizeUrl(' https://example.com/')).toBe(
      'https://example.com/'
    );
  });

  it('returns null if the URL is invalid', () => {
    expect(canonicalizeUrl('invalid-url')).toBeNull();
  });

  it('returns null if the URL is null', () => {
    expect(canonicalizeUrl(null)).toBeNull();
  });
});
