import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController, LoadingController } from '@ionic/angular';
// import { AddAccountPage } from '../add-account/add-account';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
// import { AccountDetailsPage } from '../../pages/account-details/account-details';
// import { FundTransferPage } from '../../pages/fund-transfer/fund-transfer';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Router } from '@angular/router';
import { TOAST_TIMER } from 'src/environments/environment';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { BlockchainType, SeedPhraseService } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { Keypair as StellerKeyPair } from 'stellar-base';
import { Properties } from 'src/app/shared/properties';

@Component({
   selector: 'page-bc-account',
   templateUrl: 'bc-account.html',
   styleUrls: ['./bc-account.scss'],
})
export class BcAccountPage implements OnInit {
   loading;
   userAcc = [];
   isLoadingPresent: boolean;

   constructor(
      public router: Router,
      public modalCtrl: ModalController,
      private apiService: ApiServiceProvider,
      private connectivity: ConnectivityServiceProvider,
      public toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      public alertCtrl: AlertController,
      public dataService: DataServiceProvider,
      private storageService: StorageServiceProvider,
      private properties: Properties
   ) {
      console.log('construct BcAccountPage');
   }
   async ngOnInit() {
      let mnemonic = await this.storageService.getMnemonic();
      let rst = await this.storageService.getAllMnemonicProfiles();
      for (const account of rst) {
         let stellarkeyPair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, account.value, mnemonic) as StellerKeyPair;
         let index = {
            FO: false,
            accountName: account.key,
            pk: stellarkeyPair.publicKey().toString(),
            sk: stellarkeyPair.secret().toString(),
         };
         this.userAcc.push(index);
      }
   }

   ionViewDidEnter() {
      //v6 load rename to enter as load is not getting called : check
      console.log('ionViewDidLoad BcAccountPage');
      this.getMainAccounts();
   }

   goToAddAccount() {
      this.router.navigate(['add-account/']);
   }

   doRefresh(refresher) {
      this.getMainAccounts();
      refresher.complete();
   }

   getMainAccounts() {
      return new Promise(async (resolve, reject) => {
         await this.presentLoading();
         this.dataService
            .getBlockchainAccounts()
            .then(accounts => {
               this.dissmissLoading();
               this.userAcc.concat(accounts);
               resolve(this.userAcc);
            })
            .catch(error => {
               if (this.isLoadingPresent) {
                  this.dissmissLoading();
               }
               this.userError('Authentication Failed', 'Retrieving blockchain accounts failed.');
               console.log(error);
               reject();
            });
      });
   }

   async userError(title, message) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
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

   async presentLoading() {
      this.isLoadingPresent = true;
      this.loading = await this.loadingCtrl.create({
         message: 'Pleaes Wait',
      });
      await this.loading.present();
   }

   async dissmissLoading() {
      this.isLoadingPresent = false;
      await this.loading.dismiss();
   }

   async presentToast(message) {
      let toast = await this.toastCtrl.create({
         message: message,
         duration: TOAST_TIMER.LONG_TIMER,
         position: 'middle',
      });
      await toast.present();
   }

   viewAccount(account) {
      this.router.navigate(['/account-details'], { state: { account: account } });
   }
}
