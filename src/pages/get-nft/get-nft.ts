import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Logger } from 'ionic-logger-new';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { DomSanitizer } from '@angular/platform-browser';
import { Dialogs } from '@ionic-native/dialogs';
import { PagesLoadSvgPage } from '../../pages/pages-load-svg/pages-load-svg';

/**
 * Generated class for the GetNftPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-get-nft',
  templateUrl: 'get-nft.html',
})
export class GetNftPage {
  ownNFTs = [];
  isLoadingPresent: boolean;
  mainAccount: any;
  result:any;
  loading: any;
  Decryption:any;
  dec:any;
  imageSrc:any;
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     public apiService: ApiServiceProvider,
     private _sanitizer: DomSanitizer,
     private dialogs: Dialogs,
     private logger: Logger) {
      this.result = this.navParams.get("res")
      console.log("data passed ",this.result)
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
    let assetOwn = [];
    this.apiService.retriveNFT("NOTFORSALE", 'GDIQVRTOA62JEM4VGM6WBYXLGDSUTN25FPV3L3FDLMWILKLIFYAOCXYZ').then(a => {//this.mainAccount.pk
      a.body.forEach(element => {
        assetOwn.push(element);
      });
      this.ownNFTs = assetOwn;
      
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
    }).catch(error => {
      this.logger.error("Couldn't retrive NFT from databse" + JSON.stringify(error))
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
    })
  }

  dissmissLoading() {
    this.isLoadingPresent = false;
    this.loading.dismiss();
  }

  LoadSVG(hash){
    console.log("hash: ",hash)
        this.apiService.getSVGByHash(hash).subscribe((res:any)=>{
          this.Decryption = res.Response.Base64ImageSVG
         this.dec = btoa(this.Decryption);
        var str2 = this.dec.toString(); 
        var str1 = new String( "data:image/svg+xml;base64,"); 
        var src = str1.concat(str2.toString());
        this.imageSrc = this._sanitizer.bypassSecurityTrustResourceUrl(src);
        console.log("this image: ",this.imageSrc)
        this.navCtrl.push(PagesLoadSvgPage,{res:this.imageSrc});
        })

       
       
  }

}

