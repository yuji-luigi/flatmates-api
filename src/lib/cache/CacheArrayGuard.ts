export class CacheArrayGuard<Key, Type> extends Map<Key, Type> {
  cache: Map<Key, Type>;
  constructor() {
    super();
    this.cache = new Map();
  }

  get(key: Key): Type {
    const foundCache = this.cache.get(key);
    if (!foundCache) {
      return [] as Type;
    }
    return foundCache;
  }
}
