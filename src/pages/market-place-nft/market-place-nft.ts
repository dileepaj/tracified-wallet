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
  ownNFTs=[];
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
    this.getOwnNFT();
  }

  doRefresh(refresher) {
    this.presentLoading();
    this.getSellingNFT();
    this.getOwnNFT();
    refresher.complete();
  }

  getSellingNFT() {
    let assetsMarketPlace = [];
   
    this.apiService.retriveNFT("FORSALE","withoutKey").then(a=>{
      a.body.forEach(element => {
        assetsMarketPlace.push(element);
      });
      this.currentSellingNFTs = assetsMarketPlace;
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
      console.log('a', a.body)
    }).catch(err=>console.log("aaaaaaaaaaerr",err))
  }
  getOwnNFT(){
    let assetOwn=[];
    this.apiService.retriveNFT("NOTFORSALE",this.mainAccount.pk).then(a=>{
      a.body.forEach(element => {
        assetOwn.push(element);
      });
      this.ownNFTs = assetOwn;
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
      console.log('a', a.body)
    }).catch(err=>console.log("aaaaaaaaaaerr",err))
  }

  sellNFT(item:any){
  console.log(`calling selnft`)
  console.log('   this.mainAccount', this.mainAccount);
  this.bc.sellNft(item.NftAssetName,item.InitialIssuerPK,this.mainAccount.skp)
  .then((ab)=>{
    console.log('ab', item);
    this.apiService.UpdateSellingStatusNFT(item.CurrentOwnerNFTPK,item.PreviousOwnerNFTPK,item.NFTTXNhash,"FORSALE").catch(err2=>console.log('err2', err2))
  }).then(a=>console.log('a', a)).catch(err=>console.log('err', err))
  .catch(err=>{console.log(`err`, err)})
  }

  buyNFT(item:any){
  console.log(`calling tustline  -----`,item,this.mainAccount)
  this.bc.trustlineByBuyer(item.NftAssetName,item.InitialIssuerPK,this.mainAccount.skp,this.mainAccount.pk)
  .then((a)=>console.log(`a`, a))
  .catch(err=>{console.log(`err`, err)})
  }

  aaa(item){
  this.bc.buyNft(item.NftAssetName,this.mainAccount.skp,item.InitialIssuerPK,"GC6SZI57VRGFULGMBEJGNMPRMDWEJYNL647CIT7P2G2QKNLUHTTOVFO3","50")
  .then((a)=>{
    console.log('aaaaaresult', a);
    this.apiService.UpdateSellingStatusNFT(this.mainAccount.pk,item.CurrentOwnerNFTPK,item.NFTTXNhash,"NOTFORSALE")
  })
  .catch(err=>{console.log(`err`, err)})
  
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
