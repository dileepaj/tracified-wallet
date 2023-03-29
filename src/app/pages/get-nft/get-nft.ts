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
   list: any = [
      'https://ionicframework.com/docs/img/demos/card-media.png',
      'https://ionicframework.com/docs/img/demos/card-media.png',
      'https://ionicframework.com/docs/img/demos/card-media.png',
      'https://ionicframework.com/docs/img/demos/card-media.png',
      'https://ionicframework.com/docs/img/demos/card-media.png',
   ];
   constructor(private loadCtrl: LoadingController, public apiService: ApiServiceProvider, private translate: TranslateService, private logger: LoggerService, private router: Router) {}
   ngOnInit(): void {
      // this.startloading();
      this.splitImage();
   }
   async splitImage() {
      for (let i = 0; i < this.list.length; i = i + 3) {
         this.imgrowlist.push(this.list.slice(i, i + 3));
         console.log('img', this.imgrowlist);
      }
      this.claimNft();
   }
   claimNft() {
      this.apiService
         .getAllNft()
         .then(res => {
            this.list = res;
            let hash: string = this.list[0].nftcontent;
            this.getSVG(hash);
            // console.log(res);
            // this.dissmissLoading();
         })
         .catch(error => {
            // this.dissmissLoading();
            console.log(error);
         });
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
      this.apiService.getSVGByHash(hash).subscribe((res: any) => {
         console.log('get svg by hash response: ', res);
         return res;
         // this.Decryption = res.Response;

         // const svgString = this.Decryption.toString();
         // console.log(svgString);

         // const base64String = btoa(svgString);

         // let imgElement = `data:image/svg+xml;base64,${base64String}`;
         // this.imageSrc = imgElement;
         // console.log(imgElement);
      });
   }

   // getOwnNFT() {
   //    let assetOwn = [];
   //    this.storage.getBcAccounts('mithilapanagoda@gmail.com').then((res1: any) => {
   //       console.log('retieved result ', res1);
   //       this.keypair = Keypair.fromSecret(res1);
   //       console.log('Public Key is', this.keypair.publicKey().toString());
   //    });
   //    this.apiService
   //       .retriveNFT('NOTFORSALE', this.mainAccount)
   //       .then(a => {
   //          console.log('size: ', a.body.length);
   //          console.log('all data: ', a.body);
   //          this.nft = a.body;
   //          for (let x = 0; x < this.nft.length; x++) {
   //             console.log('inside if condition');
   //             this.apiService.getSVGByHash(this.nft[x].ImageBase64).subscribe((res: any) => {
   //                console.log('reslts  svg: ', res);
   //                this.Decryption = res.Response.Base64ImageSVG;
   //                this.dec = btoa(this.Decryption);
   //                var str2 = this.dec.toString();
   //                var str1 = new String('data:image/svg+xml;base64,');
   //                var src = str1.concat(str2.toString());
   //                this.imageSrc = this._sanitizer.bypassSecurityTrustResourceUrl(src);
   //                let NFTModel = {
   //                   Owner: this.nft[x].CurrentOwnerNFTPK,
   //                   Name: this.nft[x].NftContentName,
   //                   Issuer: this.nft[x].InitialIssuerPK,
   //                   Txn: this.nft[x].NFTTXNhash,
   //                   ImageBase: this.imageSrc,
   //                   Hash: this.nft[x].ImageBase64,
   //                };
   //                assetOwn.push(NFTModel);
   //                console.log('data elements ', NFTModel);
   //                this.ownNFTs = assetOwn;
   //                console.log('list : ', this.ownNFTs);
   //             });
   //          }
   //          if (this.isLoadingPresent) {
   //             this.dissmissLoading();
   //          }
   //       })
   //       .catch(error => {
   //          this.logger.error("Couldn't retrive NFT from databse" + JSON.stringify(error));
   //          if (this.isLoadingPresent) {
   //             this.dissmissLoading();
   //          }
   //       });
   // }

   // LoadSVG(hash) {
   //    console.log('hash: ', hash);
   //    this.apiService.getSVGByHash(hash).subscribe((res: any) => {
   //       this.Decryption = res.Response.Base64ImageSVG;
   //       this.dec = btoa(this.Decryption);
   //       var str2 = this.dec.toString();
   //       var str1 = new String('data:image/svg+xml;base64,');
   //       var src = str1.concat(str2.toString());
   //       this.imageSrc = this._sanitizer.bypassSecurityTrustResourceUrl(src);
   //       console.log('this image: ', this.imageSrc);
   //       this.router.navigate(['./'], { state: this.imageSrc });
   //       // this.navCtrl.push(PagesLoadSvgPage, { st: this.imageSrc });
   //    });
   // }
}