import { initCacheRole } from './role-cache';
import { initCacheMainSpace } from './space-cache';

export async function initCache() {
  initCacheRole();
  initCacheMainSpace();
}
