import { Injectable } from '@angular/core';

@Injectable({
   providedIn: 'root',
})
export class LoggerService {
   debug(arg0: string) {
   }
   init(fileSystem: any) {
      //v6 return fake promise
      return new Promise((resolve, reject) => {
         resolve(true);
      });
   }
   error(arg0: string, skipConsoleLogs?: boolean, writeToFile?: boolean) {}
   info(arg0: string, skipConsoleLogs?: boolean, writeToFile?: boolean) {}
   

   constructor() {}
}
