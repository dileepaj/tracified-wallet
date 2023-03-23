import { Component } from '@angular/core';
import { GetNftPage } from '../../pages/get-nft/get-nft';
import { Clipboard } from '@capacitor/clipboard';
import { NavigationExtras, Router } from '@angular/router';

@Component({
   selector: 'page-get-keys',
   templateUrl: 'get-keys.html',
   styleUrls: ['./get-keys.scss'],
})
export class GetKeysPage {
   PK: any = 'wifhowfweofwejfwjhf90wf0wjfwfwe';
   SK: any = '45484284284587928edfwef89424884';
   result: any;
   constructor(public router: Router, private clipboard: Clipboard) {
      // this.result = this.router.getCurrentNavigation().extras.state.res;
      console.log('data passed ', this.result);
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
      const option: NavigationExtras = {
         state: { res: this.PK },
      };
      this.router.navigate(['/get-nft'], option);
   }

   ionViewDidLoad() {
      console.log('ionViewDidLoad GetKeysPage');
   }
}
