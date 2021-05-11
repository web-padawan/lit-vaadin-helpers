import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';

interface HasLitDebouncer {
  _debounceLitRender: Debouncer;
}

export function debounce(target: unknown, cb: () => unknown): void {
  const el = target as HasLitDebouncer;
  el._debounceLitRender = Debouncer.debounce(el._debounceLitRender, microTask, cb);
}
