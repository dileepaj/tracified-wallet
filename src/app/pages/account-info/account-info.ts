import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Properties } from '../../shared/properties';
import { Clipboard } from '@capacitor/clipboard';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
   selector: 'page-account-info',
   templateUrl: 'account-info.html',
   styleUrls: ['./account-info.scss'],
})
export class AccountInfoPage {
   account;
   navigation;

   constructor(
      public router: Router,
      public properties: Properties,
      private clipboard: Clipboard,
      private alertCtrl: AlertController,
      public toastCtrl: ToastController,
      private logger: LoggerService,
      private translate: TranslateService
   ) {
      this.account = this.router.getCurrentNavigation().extras.state.account;
      this.navigation = this.router.getCurrentNavigation().extras.state.navigation;
   }

   async copyToClipboard(option) {
      try {
         if (option == 1) {
            await Clipboard.write({
               string: this.account.publicKey,
            });
            this.translate.get(['PUBLIC_KEY_COPIED']).subscribe(text => {
               this.presentToast(text['PUBLIC_KEY_COPIED']);
            });
         } else {
            await Clipboard.write({
               string: this.account.privateKey,
            });
            this.translate.get(['PRIVATE_KEY_COPIED']).subscribe(text => {
               this.presentToast(text['PRIVATE_KEY_COPIED']);
            });
         }
      } catch (err) {
         this.translate.get(['ERROR', 'FALIED_TO_COPY_KEY']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['FALIED_TO_COPY_KEY']);
         });
         this.logger.error('Copying to clipboard failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      }
   }

   continue() {
      if (this.navigation === 'initial') {
         this.router.navigate([''], { replaceUrl: true });
      } else {
         this.router.navigate(['/bc-account'], { replaceUrl: true });
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
}
