import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
// import { Logger } from 'ionic-logger-new';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { DomSanitizer } from '@angular/platform-browser';
import { PagesLoadSvgPage } from '../../pages/pages-load-svg/pages-load-svg';
import { TranslateService } from '@ngx-translate/core';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Keypair } from 'stellar-sdk';
import { Router } from '@angular/router';
import { Properties } from 'src/app/shared/properties';
import { blockchainNetType } from '../../shared/config';
import { BlockchainType, SeedPhraseService } from 'src/app/providers/seedPhraseService/seedPhrase.service';
import { Keypair as StellerKeyPair } from 'stellar-base';
@Component({
   selector: 'page-get-nft',
   templateUrl: 'get-nft.html',
   styleUrls: ['./get-nft.scss'],
})
export class GetNftPage implements OnInit {
   ownNFTs = [];
   isLoadingPresent: boolean;
   mainAccount: any;
   result: any;
   loading: any;
   Decryption: any;
   dec: any;
   imageSrc: any;
   keypair: any;
   nft: any;
   imgrowlist = [];
   columCount;
   colSize;
   pubKey: any;
   mnemonic: any;
   defAccount: any;

   reversedArray: any = [];
   constructor(
      private properties: Properties,
      private loadCtrl: LoadingController,
      public apiService: ApiServiceProvider,
      private translate: TranslateService,
      private logger: LoggerService,
      private router: Router,
      private storage: StorageServiceProvider,
      public platform: Platform
   ) {
      this.InitiatePlatformIfReady();
   }
   ngOnInit() {
      this.mainAccount = this.properties.defaultAccount;
   }

   ionViewDidEnter() {
      this.getAllnfts();
   }

   ionViewDidLeave() {
      this.getAllnfts();
   }

   checkScreenWidth() {
      let width = window.innerWidth;
      const colCount = Math.floor(width / 200);
      const colSize = 12 / colCount;

      if (colCount < 2) {
         this.columCount = 2;
         this.colSize = 6;
      } else {
         this.columCount = colCount;
         this.colSize = colSize;
      }

      console.log('col count & col size', this.columCount, this.colSize);
      /*  if (width <= 430) {
         this.columCount = 2;
         this.colSize = 6;
      } else if (430 < width && width <= 820) {
         this.columCount = 3;
         this.colSize = 4;
      } else if (820 < width && width <= 1800) {
         this.columCount = 6;
         this.colSize = 2;
      } else if (1800 < width) {
         this.columCount = 12;
         this.colSize = 1;
      } */
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

   async getAllnfts() {
      this.reversedArray = [];
      this.imgrowlist = [];
      await this.startloading();
      this.checkScreenWidth();

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

      // this.storage
      //    .getTempPubKey('tempPubKey')
      //    .then(async (res: any) => {
      //       if (res != null) {
      //          this.pubKey = res.pubKy;
      //          await this.claimNft();
      //       } else {
      //          await this.dissmissLoading();
      //       }
      //    })
      //    .catch(async error => {
      //       await this.dissmissLoading();
      //       console.error(error);
      //    });
   }

   async claimNft(pk) {
      this.apiService
         .getAllNft(pk)
         .then(async (res: any) => {
            if (res) {
               if (res.Response) {
                  let reverseArray = await this.reverseArray(res.Response);
                  this.reversedArray = reverseArray;
                  this.splitImage(reverseArray);
               } else {
                  this.reversedArray = [];
                  this.imgrowlist = [];
               }
               await this.dissmissLoading();
            } else {
               await this.dissmissLoading();
            }
         })
         .catch(async error => {
            await this.dissmissLoading();
         });
   }

   async splitImage(list) {
      for (let i = 0; i < list.length; i = i + this.columCount) {
         this.imgrowlist.push(list.slice(i, i + this.columCount));
      }
   }

   async reverseArray(arr) {
      const length = arr.length;
      for (let i = 0; i < length / 2; i++) {
         const temp = arr[i];
         arr[i] = arr[length - i - 1];
         arr[length - i - 1] = temp;
      }
      await this.dissmissLoading();
      return arr;
   }

   async startloading() {
      this.loading = await this.loadCtrl.create({
         message: 'loading...',
      });
      await this.loading.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }

   async getSVG(hash: any, title: string) {
      this.router.navigate(['/svg-preview'], { state: { hash, title } });
   }

   goToStellar(hash) {
      if (blockchainNetType === 'live') {
         let url = 'https://stellar.expert/explorer/public/tx/' + hash;
         window.open(url, '_blank');
      } else {
         let url = 'https://stellar.expert/explorer/testnet/tx/' + hash;
         window.open(url, '_blank');
      }
   }
   InitiatePlatformIfReady() {
      this.platform.ready().then(() => {
         console.log('before subscribe');
         this.platform.resize.subscribe(() => {
            console.log(window.innerWidth);
            this.checkScreenWidth();
            this.imgrowlist = [];
            this.splitImage(this.reversedArray);
         });
      });
   }
}
