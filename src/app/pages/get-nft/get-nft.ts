import { Component } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
// import { Logger } from 'ionic-logger-new';
// import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { DomSanitizer } from '@angular/platform-browser';
// import { Dialogs } from '@ionic-native/dialogs';
import { PagesLoadSvgPage } from '../../pages/pages-load-svg/pages-load-svg';
import { TranslateService } from '@ngx-translate/core';
// import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
// import { Keypair } from 'stellar-sdk';

/**
 * Generated class for the GetNftPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
   selector: 'page-get-nft',
   templateUrl: 'get-nft.html',
})
export class GetNftPage {
   ownNFTs = [];
   // isLoadingPresent: boolean;
   mainAccount: any;
   result: any;
   loading: any;
   Decryption: any;
   dec: any;
   imageSrc: any;
   keypair: any;
   nft: any;
   constructor(
      public navCtrl: NavController,
      public navParams: NavParams,
      // public apiService: ApiServiceProvider,
      private _sanitizer: DomSanitizer,
      private translate: TranslateService // private dialogs: Dialogs,
   ) // private logger: Logger,
   // private storage: StorageServiceProvider
   {
      this.result = this.navParams.get('res');
      console.log('data passed ', this.result);
      this.mainAccount = this.result;
   }

   ionViewDidLoad() {
      console.log('ionViewDidLoad GetNftPage');
      this.getOwnNFT();
   }

   /**
    * @function getOwnNFT retrive the current wallet app user NFT fillter by NFTFORE
    * @param assetOwn @type array store the wallet user own NFT(assest) from gateway DB
    *
    */
   getOwnNFT() {
      // let assetOwn = [];
      // this.storage
      //   .getBcAccounts('mithilapanagoda@gmail.com')
      //   .then((res1: any) => {
      //     console.log('retieved result ', res1);
      //     this.keypair = Keypair.fromSecret(res1);
      //     console.log('Public Key is', this.keypair.publicKey().toString());
      //   });
      // this.apiService
      //   .retriveNFT('NOTFORSALE', this.mainAccount)
      //   .then((a) => {
      //     console.log('size: ', a.body.length);
      //     console.log('all data: ', a.body);
      //     this.nft = a.body;
      //     for (let x = 0; x < this.nft.length; x++) {
      //       console.log('inside if condition');
      //       this.apiService
      //         .getSVGByHash(this.nft[x].ImageBase64)
      //         .subscribe((res: any) => {
      //           console.log('reslts  svg: ', res);
      //           this.Decryption = res.Response.Base64ImageSVG;
      //           this.dec = btoa(this.Decryption);
      //           var str2 = this.dec.toString();
      //           var str1 = new String('data:image/svg+xml;base64,');
      //           var src = str1.concat(str2.toString());
      //           this.imageSrc =
      //             this._sanitizer.bypassSecurityTrustResourceUrl(src);
      //           let NFTModel = {
      //             Owner: this.nft[x].CurrentOwnerNFTPK,
      //             Name: this.nft[x].NftContentName,
      //             Issuer: this.nft[x].InitialIssuerPK,
      //             Txn: this.nft[x].NFTTXNhash,
      //             ImageBase: this.imageSrc,
      //             Hash: this.nft[x].ImageBase64,
      //           };
      //           assetOwn.push(NFTModel);
      //           console.log('data elements ', NFTModel);
      //           this.ownNFTs = assetOwn;
      //           console.log('list : ', this.ownNFTs);
      //         });
      //     }
      //     if (this.isLoadingPresent) {
      //       this.dissmissLoading();
      //     }
      //   })
      //   .catch((error) => {
      //     this.logger.error(
      //       "Couldn't retrive NFT from databse" + JSON.stringify(error)
      //     );
      //     if (this.isLoadingPresent) {
      //       this.dissmissLoading();
      //     }
      //   });
   }

   dissmissLoading() {
      // this.isLoadingPresent = false;
      // this.loading.dismiss();
   }

   // LoadSVG(hash) {
   // console.log('hash: ', hash);
   // this.apiService.getSVGByHash(hash).subscribe((res: any) => {
   //   this.Decryption = res.Response.Base64ImageSVG;
   //   this.dec = btoa(this.Decryption);
   //   var str2 = this.dec.toString();
   //   var str1 = new String('data:image/svg+xml;base64,');
   //   var src = str1.concat(str2.toString());
   //   this.imageSrc = this._sanitizer.bypassSecurityTrustResourceUrl(src);
   //   console.log('this image: ', this.imageSrc);
   //   this.navCtrl.push(PagesLoadSvgPage, { res: this.imageSrc });
   // });
   // }
}
