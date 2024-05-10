export class CacheWithNullCheck<Key, Type> extends Map<Key, Type> {
  cache: Map<Key, Type>;
  constructor() {
    super();
    this.cache = new Map();
  }

  get(key: Key): Type {
    const foundCache = this.cache.get(key);
    if (!foundCache) {
      throw new Error(`Key ${key} not found in cache`);
    }
    return foundCache;
  }
}
