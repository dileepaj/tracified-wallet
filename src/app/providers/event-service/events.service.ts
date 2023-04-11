import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Global event communication service
 */
@Injectable({
   providedIn: 'root',
})
export class EventsService {
   private listeners: { [key: string]: any[] } = {};
   private eventsSubject: Subject<{ name: string; args: any[] }>;
   private events: Observable<{ name: string; args: any[] }>;

   constructor() {
      this.eventsSubject = new Subject();
      this.events = this.eventsSubject.asObservable();

      this.events.subscribe(({ name, args }: { name: string; args: any[] }) => {
         if (this.listeners[name]) {
            for (const listener of this.listeners[name]) {
               listener(...args);
            }
         }
      });
   }

   subscribe(name: string, listener: any): void {
      if (!this.listeners[name]) {
         this.listeners[name] = [];
      }

      this.listeners[name].push(listener);
   }

   publish(name: string, ...args: any[]): void {
      this.eventsSubject.next({
         name,
         args,
      });
   }
}
