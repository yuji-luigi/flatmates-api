export class CacheWithNullCheck<Key, Type> extends Map<Key, Type> {
  constructor() {
    super();
  }

  get(key: Key): Type {
    const foundCache = super.get(key);
    if (!foundCache) {
      throw new Error(`Key ${key} not found in cache`);
    }
    return foundCache;
  }
  getWithoutException(key: Key): Type | undefined {
    return super.get(key);
  }
}
