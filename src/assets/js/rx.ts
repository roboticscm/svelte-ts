import { fromEvent, merge, EMPTY } from 'rxjs';

export function fromEvents(dom, ...eventNames: any[]) {
  return eventNames.reduce((prev, name) => merge(prev, fromEvent(dom, name)), EMPTY);
}
