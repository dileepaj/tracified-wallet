import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, NavController, NavParams } from 'ionic-angular';
import { Properties } from '../../shared/properties';
import { ApiServiceProvider } from '../../providers';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';

/**
 * Generated class for the MarketPlaceNftPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-market-place-nft',
  templateUrl: 'market-place-nft.html',
})
export class MarketPlaceNftPage {
  currentSellingNFTs = [];
  loading;
  Item: any;
  isLoadingPresent: boolean;
  receivers = [];
  itemPresent: boolean;
  searchTerm: any;
  mainAccount: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams, 
    public apiService: ApiServiceProvider, 
    private loadingCtrl: LoadingController,
    private properties: Properties,
    private alertCtrl: AlertController,
    private bc: BlockchainServiceProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MarketPlaceNftPage');
  }

  ionViewDidEnter() {
    this.presentLoading();
    this.mainAccount = this.properties.defaultAccount;
    this.getSellingNFT();
  }

  doRefresh(refresher) {
    this.presentLoading();
    this.getSellingNFT();
    refresher.complete();
  }

  getSellingNFT() {
    let assets = [];
    this.apiService.retriveSellNFTStellar().then(a=>{
      a.body.forEach(element => {
        assets.push(element);
      });
      this.currentSellingNFTs = assets;
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
      console.log('a', a.body)
    }).catch(err=>console.log("aaaaaaaaaaerr",err))
  }

  sellNFT(item:any){
  console.log(`calling selnft`)
  console.log('   this.mainAccount', this.mainAccount);
  this.bc.sellNft(item.NftAssetName,item.OriginPK,this.mainAccount.skp)
  .then((a)=>console.log(`a`, a))
  .catch(err=>{console.log(`err`, err)})
  this.apiService.UpdateSellingStatusNFT(item.CurrentOwnerNFTPK,item.PreviousOwnerNFTPK,item.NFTTXNhash,"FORSELL")
  }

  buyNFT(item:any){
  console.log(`calling tustline  -----`)
  this.bc.trustlineByBuyer(item.NftAssetName,item.OriginPK,this.mainAccount.skp,this.mainAccount.pk)
  .then((a)=>console.log(`a`, a))
  .catch(err=>{console.log(`err`, err)})
  }

  aaa(item){
  this.bc.buyNft(item.NftAssetName,this.mainAccount.skp,item.OriginPK)
  .then((a)=>console.log(`a`, a))
  .catch(err=>{console.log(`err`, err)})
  this.apiService.UpdateSellingStatusNFT(this.mainAccount.pk,item.CurrentOwnerNFTPK,item.NFTTXNhash,"FORSELL")
  }

  presentLoading() {
    this.isLoadingPresent = true;
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Please Wait'
    });

    this.loading.present();
  }

  dissmissLoading() {
    this.isLoadingPresent = false;
    this.loading.dismiss();
  }

  dataError(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: 'close'
    });
    alert.present();
  }
}
