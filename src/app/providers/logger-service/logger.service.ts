import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root',
})
export class LoggerService {
   error(arg0: string, skipConsoleLogs: boolean, writeToFile: boolean) {}
   info(arg0: string, skipConsoleLogs: boolean, writeToFile: boolean) {}

   constructor() {}
}
