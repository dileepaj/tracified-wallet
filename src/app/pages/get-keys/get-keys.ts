import { Component } from '@angular/core';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Clipboard } from '@capacitor/clipboard';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
   selector: 'page-get-keys',
   templateUrl: 'get-keys.html',
   styleUrls: ['./get-keys.scss'],
})
export class GetKeysPage {
   PK: any = '';
   SK: any = '';
   result: any;
   constructor(public router: Router, private clipboard: Clipboard, private translate: TranslateService) {
      this.result = this.router.getCurrentNavigation().extras.state.keys;
      if (this.result) {
         this.SK = this.result.publicKey().toString();
         this.PK = this.result.secret().toString();
         console.log('private key: ', this.SK);
         console.log('public key: ', this.PK);
      }
   }

   async copyData(key) {
      await Clipboard.write({
         string: key,
      });
   }

   market() {
      this.router.navigate(['/otp-page'], { replaceUrl: true });
   }
}
