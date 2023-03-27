import { Component } from '@angular/core';
import { AlertController, ModalController, ToastController, LoadingController } from '@ionic/angular';
// import { AddAccountPage } from '../add-account/add-account';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
// import { AccountDetailsPage } from '../../pages/account-details/account-details';
// import { FundTransferPage } from '../../pages/fund-transfer/fund-transfer';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Router } from '@angular/router';

@Component({
   selector: 'page-bc-account',
   templateUrl: 'bc-account.html',
   styleUrls: ['./bc-account.scss'],
})
export class BcAccountPage {
   loading;
   userAcc;
   isLoadingPresent: boolean;

   constructor(
      public router: Router,
      public modalCtrl: ModalController,
      private apiService: ApiServiceProvider,
      private connectivity: ConnectivityServiceProvider,
      public toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      public alertCtrl: AlertController,
      public dataService: DataServiceProvider
   ) {}

   ionViewDidLoad() {
      console.log('ionViewDidLoad BcAccountPage');
      this.getMainAccounts();
   }

   goToAddAccount() {
      this.router.navigate(['/']);
      // this.navCtrl.push(AddAccountPage);
   }

   doRefresh(refresher) {
      this.getMainAccounts();
      refresher.complete();
   }

   getMainAccounts() {
      return new Promise((resolve, reject) => {
         this.presentLoading();
         this.dataService
            .getBlockchainAccounts()
            .then(accounts => {
               this.dissmissLoading();
               this.userAcc = accounts;
               resolve(accounts);
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
         duration: 4000,
         position: 'middle',
      });
      await toast.present();
   }

   viewAccount(account) {
      // this.navCtrl.push(AccountDetailsPage, { account: account });
   }
}
