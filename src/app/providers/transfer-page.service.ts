import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
   providedIn: 'root',
})
export class TransferPageService {
   loadNfts: Subject<boolean> = new Subject<boolean>();
   constructor() {}

   public updateTransferPage(isTrue: boolean) {
      this.loadNfts.next(isTrue);
   }
}
