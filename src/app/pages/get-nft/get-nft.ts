import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
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

   constructor(
      private properties: Properties,
      private loadCtrl: LoadingController,
      public apiService: ApiServiceProvider,
      private translate: TranslateService,
      private logger: LoggerService,
      private router: Router,
      private storage: StorageServiceProvider
   ) {}
   ngOnInit() {
      this.checkScreenWidth();
      this.mainAccount = this.properties.defaultAccount;
   }

   async checkScreenWidth() {
      await this.startloading();
      let width = window.innerWidth;
      if (width <= 430) {
         this.columCount = 2;
         this.colSize = 6;
      } else if (430 < width && width <= 820) {
         this.columCount = 4;
         this.colSize = 3;
      } else if (820 < width && width <= 1800) {
         this.columCount = 6;
         this.colSize = 2;
      } else if (1800 < width) {
         this.columCount = 12;
         this.colSize = 1;
      }

      this.storage
         .getMnemonic()
         .then(data => {
            console.log('data: ', data);
            this.mnemonic = data;
            this.keypair = SeedPhraseService.generateAccountsFromMnemonic(BlockchainType.Stellar, 0, this.mnemonic) as StellerKeyPair;
            this.claimNft(this.keypair.publicKey().toString());
         })
         .catch(error => {
            console.log(error);
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
               let reverseArray = await this.reverseArray(res.Response);
               this.splitImage(reverseArray);
            } else {
               await this.dissmissLoading();
            }
         })
         .catch(async error => {
            await this.dissmissLoading();
            console.log(error);
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

   async getSVG(hash: any) {
      this.router.navigate(['/svg-preview'], { state: hash });
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
}
