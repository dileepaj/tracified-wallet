import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Server, Transaction, Network } from 'stellar-sdk';
import { Items } from '../../providers/items/items';
import { ItemDetailPage } from '../item-detail/item-detail';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { blockchainNet } from '../../shared/config';
import { blockchainNetType } from '../../shared/config';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';

@IonicPage()
@Component({
  selector: 'page-transfer',
  templateUrl: 'transfer.html',
})
export class TransferPage {
  key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
  adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

  currentItems = [];
  user: any;
  loading;
  Item: any;
  isLoadingPresent: boolean;
  receivers = [];
  Searcheditems: any;
  itemPresent: boolean;
  searchTerm: any;
  mainAccount: any;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private itemsProvider: Items,
    private storage: StorageServiceProvider,
    private properties: Properties,
    private alertCtrl: AlertController,
    private bc:BlockchainServiceProvider
  ) { }

  ionViewDidLoad() { }


  ionViewDidEnter() {
    this.presentLoading();
    this.mainAccount = this.properties.defaultAccount;
    this.getBalance();
    // this.loadReceivers();
  }

  doRefresh(refresher) {
    this.presentLoading();
    this.getBalance();
    refresher.complete();
  }

  openItem(item) {
    this.navCtrl.push(ItemDetailPage, {
      item: item,
      currentItems: this.currentItems
      // receivers: this.receivers
    });
  }

  setFilteredItems() {
    this.Searcheditems = this.currentItems.filter((item) => {
      return item.asset_code.toLowerCase().includes(this.searchTerm.toLowerCase());
    });

  }

  getBalance() {
    let assets = [];
    if (blockchainNetType === 'live') {
      Network.usePublicNetwork();
    } else {
      Network.useTestNetwork();
    }
    let server = new Server(blockchainNet);
    server.loadAccount(this.mainAccount.pk).then((account) => {
      account.balances.forEach((balance: any) => {
        let bal: number = parseFloat(balance.balance);
        assets.push({ 'asset_code': balance.asset_code, 'balance': bal.toFixed(0) });
      });
      assets.pop();
      this.currentItems = assets;
      this.Searcheditems = this.currentItems;
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
    }).catch((err) => {
      console.error(err);
      this.dissmissLoading();
    });

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
sellNft(){
  console.log(`calling selnft`)
this.bc.sellNft("kiri","GC6SZI57VRGFULGMBEJGNMPRMDWEJYNL647CIT7P2G2QKNLUHTTOVFO3","SBX7R5IQV4SXQ7CFV7OEEQ6NHU3SBEXCODW4476FQJC7RUFARK2JSSNY").then((a)=>console.log(`a`, a)).catch(err=>{console.log(`err`, err)})
}
buyNft(){
  console.log(`calling tustline  -----`)
  this.bc.trustlineByBuyer("kiri","GC6SZI57VRGFULGMBEJGNMPRMDWEJYNL647CIT7P2G2QKNLUHTTOVFO3","SCW3PPPHYXXVQBBMLG5LBSQ376PRQV7NJ4RLRVJOTM7IPUCAJBKHLQBT").then((a)=>console.log(`a`, a)).catch(err=>{console.log(`err`, err)})
}

aaa(){
  console.log(`calling by buyer -----`)
  this.bc.buyNft("kiri","SCW3PPPHYXXVQBBMLG5LBSQ376PRQV7NJ4RLRVJOTM7IPUCAJBKHLQBT","GC6SZI57VRGFULGMBEJGNMPRMDWEJYNL647CIT7P2G2QKNLUHTTOVFO3").then((a)=>console.log(`a`, a)).catch(err=>{console.log(`err`, err)})
}

}



//show mange data(asset) in items===>asset===in wallet app
// add new screen as market palce for buy NFT and buy button in  NFT does not show to owner of NFT(in marketplace item statue take filter by statusSelling="selling" )
//  when buy button click got another screen show input filed for price and ammount ==
//  marketplaceNFT====NFTSellardetails +statusSelling ,priviousOwner and currentowner and issuer(orgin)

// create new collections for nft as  marketplaceNFT ,put NFT details to this when creating and NFT ,statusSelling=false  priviousOwner="tracified" currentowner="distibutorkey"   orgin "tracied"  get this as DOC1""
// when creating the manageselloffer update that marketplaceNFT detail's statusSelling=true  (DOC1)
// after someone buy it  
//1)update that marketplaceNFT detail's statusSelling=false  (DOC1)
//2)create new doc2 for again marketplaceNFT  collection statusSelling=false  priviousOwner="doc 1's cuurent owner" currentowner="third part buyer ""get this as DOC2"" orgin tracified