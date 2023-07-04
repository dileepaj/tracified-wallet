import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { BlockchainType, SeedPhraseService } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { TOAST_TIMER } from 'src/environments/environment';
import { Keypair as StellerKeyPair } from 'stellar-base';
@Component({
   selector: 'app-otp-bc-account',
   templateUrl: './otp-bc-account.page.html',
   styleUrls: ['./otp-bc-account.page.scss'],
})
export class OtpBcAccountPage implements OnInit {
   mnemonic;
   stellarkeyPair: StellerKeyPair;

   bcAccList: any[] = [];

   selectedBcAcc: any;

   toastInstance: any;

   loading: any;

   constructor(
      private router: Router,
      private storageService: StorageServiceProvider,
      private seedPhraseSrevice: SeedPhraseService,
      public alertCtrl: AlertController,
      private toastService: ToastController,
      private loadingCtrl: LoadingController
   ) {}

   async ngOnInit() {
      this.presentLoading();
      await this.generateTempAccounts();
      this.mnemonic = await this.storageService.getMnemonic();
      let rst = await this.storageService.getAllMnemonicProfiles();
      for (const account of rst) {
         this.stellarkeyPair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, account.value, this.mnemonic) as StellerKeyPair;
         console.log('vals: ', account.key, this.stellarkeyPair.publicKey());

         const bcAccount = {
            name: account.key,
            publicKey: this.stellarkeyPair.publicKey(),
         };
         this.bcAccList.push(bcAccount);

         if (account.value == 0) {
            this.selectedBcAcc = bcAccount;
         }
      }

      this.dissmissLoading();
   }

   async onClickNext() {
      if (this.selectedBcAcc) {
         const option: NavigationExtras = {
            state: {
               bcAccount: this.selectedBcAcc,
            },
            queryParams: {
               shopId: '712356790',
            },
         };
         this.router.navigate(['request-otp'], option);
      } else {
         const toastInstance = await this.toastService.create({
            message: 'Please select a blockchain account!',
            duration: TOAST_TIMER.SHORT_TIMER,
            position: 'bottom',
         });
         await toastInstance.present();
      }
   }
   //!remove later
   public async generateTempAccounts() {
      for (let i = 1; i <= 10; i++) {
         await this.storageService.addSeedPhraseAccount(i.toString(), 'acc' + i);
      }
   }

   public selectBcAccount(e) {
      this.selectedBcAcc = e.detail.value;
   }

   async showPublicKey() {
      if (this.selectedBcAcc) {
         let alert = await this.alertCtrl.create({
            message: this.selectedBcAcc.publicKey,
            buttons: [
               {
                  text: 'Ok',
                  role: 'confirm',
                  handler: () => {},
               },
            ],
         });
         await alert.present();
      }
   }

   public import() {
      this.router.navigate(['/import-bc-account']);
   }

   async presentLoading() {
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         message: 'Please Wait',
      });
      this.loading.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }
}
