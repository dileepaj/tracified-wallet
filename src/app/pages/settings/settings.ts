import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Properties } from '../../shared/properties';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { DataServiceProvider } from 'src/app/providers/data-service/data-service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { BlockchainType, SeedPhraseService } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { Keypair as StellerKeyPair } from 'stellar-base';

@Component({
   selector: 'page-settings',
   templateUrl: 'settings.html',
   styleUrls: ['./settings.scss'],
})
export class SettingsPage {
   constructor(public router: Router, private properties: Properties, private alertCtrl: AlertController, private translate: TranslateService,
      private dataService: DataServiceProvider, private storageService: StorageServiceProvider) { }

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
      this.privateKeyPopUp();
      // this.router.navigate(['/setting-form'], { state: { type: 'transactionPassword' } });
   }

   async presentAlert(title: string, message: string) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               handler: data => { },
            },
         ],
      });

      await alert.present();
   }

   async privateKeyPopUp() {
      let alert = await this.alertCtrl.create({
         header: 'Private Key.',
         inputs: [
            {
               name: 'privateKey',
               placeholder: 'Enter the Private Key',
            },
         ],
         buttons: [
            {
               text: 'Cancel',
            },
            {
               text: 'Submit',
               handler: data => {
                  this.privateKeyCheck(data.privateKey);
               },
            },
         ],
         backdropDismiss: false,
      });
      alert.present();
   }

   async privateKeyCheck(privateKey) {
      let secret = await this.checkKey()
      if (secret.sk === privateKey) {
         this.router.navigate(['/setting-form'], { state: { type: 'transactionPassword', data: secret } });
      } else {
         this.presentAlert('key ', 'Private key entered is incorrect. Please try again.');
      }
   }

   async checkKey() {
      let mnemonic = await this.storageService.getMnemonic();
      let defAccount = await this.getDefault();
      let stellarKeyPair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, defAccount, mnemonic) as StellerKeyPair;
      let privetKey = stellarKeyPair.secret().toString()
      let publicKey = stellarKeyPair.publicKey().toString()
      return ({ sk: privetKey, pk: publicKey })
   }

   public async getDefault() {
      return this.storageService
         .getDefaultAccount()
         .then(acc => {
            return acc.toString();
         })
         .catch((error) => {
            console.log(error)
         });
   }
}
