import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root',
})
export class LoggerService {
   debug(arg0: string) {
      console.debug(arg0);
   }
   init(fileSystem: any) {
      //v6 return fake promise
      return new Promise((resolve, reject) => {
         resolve(true);
      });
   }
   error(arg0: string, skipConsoleLogs?: boolean, writeToFile?: boolean) {
      console.error(arg0);
   }
   info(arg0: string, skipConsoleLogs?: boolean, writeToFile?: boolean) {
      console.info(arg0);
   }

   constructor() {}
}
