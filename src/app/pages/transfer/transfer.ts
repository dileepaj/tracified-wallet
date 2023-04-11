import { Component } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { Server, Transaction, Networks } from 'stellar-sdk';
import { Items } from '../../providers/items/items';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { blockchainNet } from '../../shared/config';
import { blockchainNetType } from '../../shared/config';
import { Router } from '@angular/router';

@Component({
   selector: 'page-transfer',
   templateUrl: 'transfer.html',
   styleUrls: ['./transfer.scss'],
})
export class TransferPage {
   currentItems = [];
   user: any;
   loading;
   Item: any;
   isLoadingPresent: boolean;
   receivers = [];
   Searcheditems: any;
   itemPresent: boolean;
   searchTerm: any;
   mainAccount: any;

   constructor(
      private router: Router,
      private loadingCtrl: LoadingController,
      private itemsProvider: Items,
      private storage: StorageServiceProvider,
      private properties: Properties,
      private alertCtrl: AlertController
   ) {}

   async ionViewDidEnter() {
      await this.presentLoading();
      this.mainAccount = await this.properties.defaultAccount;
      this.getBalance();
   }

   doRefresh(refresher) {
      this.presentLoading();
      this.getBalance();
      refresher.complete();
   }

   openItem(item) {
      this.router.navigate(['/item-detail'], { state: { item: item, currentItems: this.currentItems } });
   }

   setFilteredItems(event) {
      let name = event.detail.value;
      this.Searcheditems = this.currentItems.filter(item => {
         return item.asset_code.toLowerCase().includes(name.toLowerCase());
      });
   }

   getBalance() {
      let assets = [];
      if (blockchainNetType === 'live') {
         Networks.PUBLIC;
      } else {
         Networks.TESTNET;
      }
      let server = new Server(blockchainNet);
      server
         .loadAccount(this.mainAccount.pk)
         .then(account => {
            account.balances.forEach((balance: any) => {
               let bal: number = parseFloat(balance.balance);
               assets.push({ asset_code: balance.asset_code, balance: bal.toFixed(0) });
            });
            assets.pop();
            this.currentItems = assets;
            this.Searcheditems = this.currentItems;
            if (this.isLoadingPresent) {
               this.dissmissLoading();
            }
         })
         .catch(err => {
            console.error(err);
            this.dissmissLoading();
         });
   }

   async presentLoading() {
      this.isLoadingPresent = true;
      this.loading = await this.loadingCtrl.create({
         message: 'Please Wait',
      });
      await this.loading.present();
   }

   async dissmissLoading() {
      this.isLoadingPresent = false;
      await this.loading.dismiss();
   }

   async dataError(title, message) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'Close',
               handler: data => {},
            },
         ],
      });
      await alert.present();
   }
}
