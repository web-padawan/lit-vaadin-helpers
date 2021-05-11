import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { AbstractRendererDirective, AbstractLitRenderer } from './abstract-renderer.js';

interface HasLitDebouncer {
  _debounceLitRender: Debouncer;
}

export abstract class GridRendererDirective<
  T extends Element,
  R extends AbstractLitRenderer
> extends AbstractRendererDirective<T, R> {
  debounce(element: Element, cb: () => unknown): void {
    const el = (element as unknown) as HTMLElement & HasLitDebouncer;
    el._debounceLitRender = Debouncer.debounce(el._debounceLitRender, microTask, cb);
  }
}
