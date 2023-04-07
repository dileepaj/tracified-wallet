import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Properties } from '../../shared/properties';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
   selector: 'page-settings',
   templateUrl: 'settings.html',
   styleUrls: ['./settings.scss'],
})
export class SettingsPage {
   constructor(public router: Router, private properties: Properties, private alertCtrl: AlertController, private translate: TranslateService) {}

   changeDisplayImage() {
      this.translate.get(['PROFILE_PHOTO', 'CHANGING_PHOTO_UNAVAILABLE']).subscribe(text => {
         this.presentAlert(text['PROFILE_PHOTO'], text['CHANGING_PHOTO_UNAVAILABLE']);
      });
   }

   changeDisplayName() {
      this.router.navigate(['/setting-form'], { state: { type: 'displayName', fName: this.properties.firstName, lName: this.properties.lastName } });
   }

   changePassword() {
      this.router.navigate(['/setting-form'], { state: { type: 'accountPassword' } });
   }

   changeTransactionPasswords() {
      this.router.navigate(['/setting-form'], { state: { type: 'transactionPassword' } });
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
