import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';

@Component({
   selector: 'app-bc-account-created',
   templateUrl: './bc-account-created.page.html',
   styleUrls: ['./bc-account-created.page.scss'],
})
export class BcAccountCreatedPage implements OnInit {
   data: any = [
      {
         title: 'Why do I need a Blockchain Account?',
         url: 'https://docs.tracified.com',
      },
      {
         title: 'Creating a Blockchain Account',
         url: 'https://docs.tracified.com',
      },
      {
         title: 'Importing a Blockchain Account',
         url: 'https://docs.tracified.com',
      },
   ];

   accounts: any = [
      {
         blockchain: 'Ethereum',
         key: 'ABCDEFGH12345678',
         icon: '../../../assets/icon/ethereum.svg',
      },
      {
         blockchain: 'Polygon',
         key: 'ABCDEFGH12345678',
         icon: '../../../assets/icon/polygon.svg',
      },
      {
         blockchain: 'Stellar',
         key: 'ABCDEFGH12345678',
         icon: '../../../assets/icon/stellar-2.svg',
      },
      {
         blockchain: 'Solana',
         key: 'ABCDEFGH12345678',
         icon: '../../../assets/icon/solana.svg',
      },
   ];

   constructor() {}

   ngOnInit() {}

   public async writeToClipboard(text: string) {
      await Clipboard.write({
         string: text,
      });
   }
}
