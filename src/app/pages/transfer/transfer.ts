import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { Server, Transaction, Networks } from 'stellar-sdk';
import { Properties } from '../../shared/properties';
import { blockchainNet } from '../../shared/config';
import { blockchainNetType } from '../../shared/config';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SeedPhraseService, BlockchainType } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';
import { ApiServiceProvider } from 'src/app/providers/api-service/api-service';
import { Keypair as StellerKeyPair } from 'stellar-base';

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
   Searcheditems: any = [];
   itemPresent: boolean;
   searchTerm: any;
   mainAccount: any;
   itemsTabOpened: boolean = false;

   itemRowlist = [];
   itemColumCount;
   itemColSize;

   nftRowlist = [];
   nftColumCount;
   nftColSize;
   searchedNfts: any = [];
   currentNfts: any = [];

   mnemonic: any;
   keypair: any;

   constructor(
      public apiService: ApiServiceProvider,
      private storage: StorageServiceProvider,
      private router: Router,
      private loadingCtrl: LoadingController,
      private properties: Properties,
      private alertCtrl: AlertController,
      private translate: TranslateService
   ) {}

   ionViewDidEnter() {
      this.createItemsGrid();
   }

   async handleRefresh(event) {
      await this.createItemsGrid();
      await event.target.complete();
   }

   openItem(item) {
      this.router.navigate(['/item-detail'], { state: { item: item, currentItems: this.currentItems } });
   }

   setFilteredItems(event) {
      let name = event.detail.value;

      if (this.itemsTabOpened) {
         this.Searcheditems = this.currentItems.filter(item => {
            return item.asset_code.toLowerCase().includes(name.toLowerCase());
         });
         this.splitItems(this.Searcheditems);
      } else {
         this.searchedNfts = this.currentNfts.filter(item => {
            return item.nftname.toLowerCase().includes(name.toLowerCase());
         });

         this.splitImage(this.searchedNfts);
      }
   }

   async getBalance() {
      await this.presentLoading();
      this.mainAccount = await this.properties.defaultAccount;
      try {
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
               this.splitItems(this.Searcheditems);
               if (this.isLoadingPresent) {
                  this.dissmissLoading();
               }
            })
            .catch(err => {
               console.error(err);
               this.dissmissLoading();
            });
      } catch (error) {
         await this.dissmissLoading();
      }
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

   public changeTab(event: any) {
      this.itemsTabOpened = event.target.checked;
   }

   private async createItemsGrid() {
      let width = window.innerWidth;
      if (width <= 430) {
         this.itemColumCount = 2;
         this.itemColSize = 6;
      } else if (430 < width && width <= 820) {
         this.itemColumCount = 4;
         this.itemColSize = 3;
      } else if (820 < width && width <= 1800) {
         this.itemColumCount = 6;
         this.itemColSize = 2;
      } else if (1800 < width) {
         this.itemColumCount = 12;
         this.itemColSize = 1;
      }

      this.getBalance();
      this.loadNfts();
   }

   async splitItems(list) {
      this.itemRowlist = [];
      for (let i = 0; i < list.length; i = i + this.itemColumCount) {
         this.itemRowlist.push(list.slice(i, i + this.itemColumCount));
      }
   }

   async loadNfts() {
      this.storage
         .getMnemonic()
         .then(data => {
            this.mnemonic = data;
            this.keypair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, 0, this.mnemonic) as StellerKeyPair;
            this.claimNft(this.keypair.publicKey().toString());
         })
         .catch(error => {
            // this.presentToast("You don't have an account.");
         });
   }

   async claimNft(pk) {
      this.apiService
         .getAllNft(pk)
         .then(async (res: any) => {
            if (res) {
               let reverseArray = await this.reverseArray(res.Response);
               this.currentNfts = reverseArray;
               this.searchedNfts = this.currentNfts;
               this.splitImage(reverseArray);
            } else {
               await this.dissmissLoading();
            }
         })
         .catch(async error => {
            await this.dissmissLoading();
         });
   }

   async splitImage(list) {
      this.nftRowlist = [];
      for (let i = 0; i < list.length; i = i + this.itemColumCount) {
         this.nftRowlist.push(list.slice(i, i + this.itemColumCount));
      }
   }

   async reverseArray(arr) {
      const length = arr.length;
      for (let i = 0; i < length / 2; i++) {
         const temp = arr[i];
         arr[i] = arr[length - i - 1];
         arr[length - i - 1] = temp;
      }
      //await this.dissmissLoading();
      return arr;
   }

   async getSVG(hash: any) {
      this.router.navigate(['/svg-preview'], { state: hash });
   }
}
