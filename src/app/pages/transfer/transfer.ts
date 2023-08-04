import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, Platform } from '@ionic/angular';
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
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NFTServiceProvider } from 'src/app/providers/blockchain-service/nft-service';
import { NFT, NFTState, NFTStatus, NFTTransfer } from 'src/app/shared/nft';

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
   defAccount: any;
   form: FormGroup;
   pwdForm: FormGroup;

   passwordType: string = 'password';
   passwordIcon: string = 'eye-off';

   isRequestModalOpened: boolean = false;
   modalTab: number = 0;
   nftToTransfer: any = null;
   receiverPk: string = '';

   constructor(
      public apiService: ApiServiceProvider,
      private storage: StorageServiceProvider,
      private router: Router,
      private loadingCtrl: LoadingController,
      private properties: Properties,
      private alertCtrl: AlertController,
      private translate: TranslateService,
      private nftService: NFTServiceProvider,
      public platform: Platform
   ) {
      this.InitiatePlatformIfReady();
      this.form = new FormGroup({
         receiverAddr: new FormControl('', Validators.compose([Validators.required])),
      });
      this.pwdForm = new FormGroup({
         password: new FormControl('', Validators.compose([Validators.required])),
      });
   }

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

   private checkScreenWidth() {
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
   }

   private async createItemsGrid() {
      this.checkScreenWidth();
      this.getBalance();
      this.loadNfts();
   }

   async splitItems(list) {
      this.itemRowlist = [];
      for (let i = 0; i < list.length; i = i + this.itemColumCount) {
         this.itemRowlist.push(list.slice(i, i + this.itemColumCount));
      }
   }

   /**
    * load nfts minted using default account
    */
   async loadNfts() {
      this.storage
         .getMnemonic()
         .then(async data => {
            this.mnemonic = data;
            await this.getDefault();
            console.log(this.defAccount);
            if (!this.defAccount) {
               this.defAccount = 0;
            }
            this.keypair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, this.defAccount, this.mnemonic) as StellerKeyPair;
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

   /**
    * get default bc account index
    */
   public async getDefault() {
      await this.storage
         .getDefaultAccount()
         .then(acc => {
            this.defAccount = acc;
         })
         .catch(() => {
            this.defAccount = false;
         });
   }

   /**
    * hide/ show password in nft transfer modal
    */
   hideShowPassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   /**
    * called after nft transfer modal is dismissed
    */
   public onDismiss() {
      this.isRequestModalOpened = false;
      this.nftToTransfer = null;
      this.receiverPk = '';
      this.modalTab = 0;
      this.pwdForm.get('password').setValue('');
      this.form.get('receiverAddr').setValue('');
      this.passwordType = 'password';
      this.passwordIcon = 'eye-off';
   }

   /**
    * move to next tab in the nft transfer request modal
    */
   public nextTab() {
      if (this.modalTab != 2) this.modalTab++;
   }

   /**
    * open nft transfer request modal
    * @param nft nft to be transferred
    */
   public openModal(nft: any) {
      console.log(nft);
      this.nftToTransfer = nft;
      this.isRequestModalOpened = true;
   }

   /**
    * send nft transfer request
    */
   async sendTransferRequest() {
      await this.presentLoading();
      const password = this.pwdForm.get('password').value;
      const receiverAddr = this.form.get('receiverAddr').value;
      let username = '';
      await this.storage.getMnemonicProfile(this.defAccount.toString()).then(acc => {
         console.log(acc);
         username = acc;
      });
      try {
         await this.storage
            .validateSeedPhraseAccount(this.defAccount.toString(), username, password)
            .then(async valid => {
               if (valid) {
                  const nft: NFTTransfer = {
                     issuerpublickey: this.nftToTransfer.issuerpublickey,
                     blockchain: this.nftToTransfer.blockChain,
                     nftcreator: this.nftToTransfer.nftcreator,
                     nftname: this.nftToTransfer.nftname,
                     nftrequested: receiverAddr,
                     currentowner: this.keypair.publicKey().toString(),
                     nftstatus: NFTStatus.TrustLineToBeCreated,
                     timestamp: this.nftToTransfer.timestamp,
                     shopid: this.nftToTransfer.shopid,
                     thumbnail: this.nftToTransfer.thumbnail,
                     nftid: this.nftToTransfer.Id,
                  };
                  this.nftService.SaveNFTState(nft).subscribe({
                     next: async res => {
                        console.log(res);
                        this.receiverPk = receiverAddr;
                        await this.dissmissLoading();
                        this.nextTab();
                     },
                     error: async () => {
                        const text = await this.translate.get(['ERROR', 'NFT_TRNSFR_ERROR']).toPromise();
                        await this.dissmissLoading();
                        this.presentAlert(text['ERROR'], text['NFT_TRNSFR_ERROR']);
                     },
                  });
                  //this.nextTab();
               } else {
                  const text = await this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).toPromise();
                  await this.dissmissLoading();
                  this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
               }
            })
            .catch(async err => {
               const text = await this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).toPromise();
               await this.dissmissLoading();
               this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
            });
      } catch (err) {
         const text = await this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).toPromise();
         await this.dissmissLoading();
         this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
      }
      this.pwdForm.get('password').setValue('');
   }

   /**
    * display alert box
    * @param title title of the alert box
    * @param message message to be displayed
    * @param okFn function to be executed after pressing ok button
    */
   async presentAlert(title: string, message: string, okFn?: any) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               handler: okFn,
            },
         ],
      });

      alert.present();
   }

   InitiatePlatformIfReady() {
      this.platform.ready().then(() => {
         console.log('before subscribe');
         this.platform.resize.subscribe(() => {
            this.checkScreenWidth();
            this.nftRowlist = [];
            this.splitImage(this.searchedNfts);

            this.itemRowlist = [];
            this.splitItems(this.Searcheditems);
         });
      });
   }
}
