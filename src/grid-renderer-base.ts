import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { RendererBase } from './renderer-base.js';

interface HasLitDebouncer {
  _debounceLitRender: Debouncer;
}

export abstract class GridRendererBase extends RendererBase {
  debounce(element: HTMLElement, cb: () => unknown): void {
    const el = element as HTMLElement & HasLitDebouncer;
    el._debounceLitRender = Debouncer.debounce(el._debounceLitRender, microTask, cb);
  }
}
