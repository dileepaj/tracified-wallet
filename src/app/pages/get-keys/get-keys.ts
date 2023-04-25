import { Component } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
   selector: 'page-get-keys',
   templateUrl: 'get-keys.html',
   styleUrls: ['./get-keys.scss'],
})
export class GetKeysPage {
   PK: any = '';
   SK: any = '';
   result: any;
   constructor(public alertCtrl: AlertController, public toastCtrl: ToastController, public router: Router, private clipboard: Clipboard, private translate: TranslateService) {
      this.result = this.router.getCurrentNavigation().extras.state.keys;
      this.router.navigate(['/get-key'], { replaceUrl: true });
      if (this.result) {
         this.PK = this.result.publicKey().toString();
         this.SK = this.result.secret().toString();
         console.log('private key: ', this.SK);
         console.log('public key: ', this.PK);
      }
   }
   async copyData(key, num) {
      try {
         await Clipboard.write({
            string: key,
         });
         if (num == 1) {
            this.translate.get(['PUBLIC_KEY_COPIED']).subscribe(text => {
               this.presentToast(text['PUBLIC_KEY_COPIED']);
            });
         } else {
            this.translate.get(['PRIVATE_KEY_COPIED']).subscribe(text => {
               this.presentToast(text['PRIVATE_KEY_COPIED']);
            });
         }
      } catch (err) {
         this.translate.get(['ERROR', 'FALIED_TO_COPY_KEY']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['FALIED_TO_COPY_KEY']);
         });
      }
   }

   async presentToast(message) {
      let toast = await this.toastCtrl.create({
         message: message,
         duration: 2500,
         position: 'bottom',
      });
      await toast.present();
   }

   async presentAlert(title: string, message: string) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               handler: data => {},
            },
         ],
      });
      await alert.present();
   }

   market() {
      this.router.navigate(['/get-nft'], { replaceUrl: true });
   }
}
