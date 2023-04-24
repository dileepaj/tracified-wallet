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

   constructor(private loadCtrl: LoadingController, public apiService: ApiServiceProvider, private translate: TranslateService, private logger: LoggerService, private router: Router) {}
   ngOnInit() {
      this.checkScreenWidth();
   }

   async checkScreenWidth() {
      await this.startloading();
      let width = window.innerWidth;
      if (width < 429) {
         this.columCount = 2;
         this.colSize = 6;
      } else if (429 < width && width < 768) {
         this.columCount = 3;
         this.colSize = 4;
      } else if (768 < width && width < 1200) {
         this.columCount = 4;
         this.colSize = 3;
      } else if (1200 < width) {
         this.columCount = 6;
         this.colSize = 2;
      }
      this.claimNft();
   }

   claimNft() {
      this.apiService
         .getAllNft()
         .then(async (res: any) => {
            console.log(res);
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
      console.log(this.columCount);
      for (let i = 0; i < list.length; i = i + this.columCount) {
         this.imgrowlist.push(list.slice(i, i + this.columCount));
         console.log('img', this.imgrowlist);
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
      this.router.navigate(['/svg-preview'], { queryParams: hash });
   }

   goToStellar(hash) {
      console.log(hash);
      let url = 'https://stellar.expert/explorer/testnet/tx/' + hash;
      window.open(url, '_blank');
   }
}
