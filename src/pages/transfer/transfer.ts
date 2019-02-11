import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, LoadingController } from 'ionic-angular';
import { Item } from '../../models/item';
// import { Items } from '../../providers';
import { Server, Transaction } from 'stellar-sdk';
import { Items } from '../../providers/items/items';
import { ItemDetailPage } from '../item-detail/item-detail';

@IonicPage()
@Component({
  selector: 'page-transfer',
  templateUrl: 'transfer.html',
})
export class TransferPage {
  currentItems = [];
  user: any;
  loading;
  isLoadingPresent: boolean;
  receivers = [];
  Searcheditems: any;
  itemPresent: boolean;
  searchTerm: any;
  BCAccounts: any;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, private loadingCtrl: LoadingController, public itemsProvider: Items) {
    // this.currentItems = this.items.query();
    this.user = JSON.parse(localStorage.getItem('_user'))
    this.BCAccounts = JSON.parse(localStorage.getItem('_BCAccounts'))
    // this.user.PublicKey = 'GCZRSDPSU2TPDZMX4NFDE3OBQPACXVA4LH6E3LO3QXPBPONL4K6CTNBI';
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.getBalance();
    this.loadReceivers();
  }

  ionViewDidEnter() {

  }

  doRefresh(refresher) {
    this.presentLoading();
    console.log('Begin async operation', refresher);
    this.getBalance();
    // setTimeout(() => {
    //   console.log('Async operation has ended');
    refresher.complete();
    // }, 2000);
  }

  openItem(item: Item) {
    this.navCtrl.push(ItemDetailPage, {
      item: item,
      currentItems: this.currentItems,
      receivers: this.receivers
    });
  }

  setFilteredItems() {
    // console.log(this.searchTerm)
    this.Searcheditems = this.currentItems.filter((item) => {
      return item.asset_code.toLowerCase().includes(this.searchTerm.toLowerCase());
    });

  }

  getBalance() {
    let assets = [];

    var server = new Server('https://horizon-testnet.stellar.org');
    try {
      // the JS SDK uses promises for most actions, such as retrieving an account
      server.loadAccount(this.BCAccounts[0].pk).then(function (account) {
        // console.log('Balances for account: ' + JSON.stringify(account.balances));
        account.balances.forEach(function (balance) {
          // @ts-ignore
          console.log('Asset_code:', balance.asset_code, ', Balance:', balance.balance);
          let bal: number = parseFloat(balance.balance)
          // @ts-ignore
          assets.push({ 'asset_code': balance.asset_code, 'balance': bal.toFixed(0) });
        });
        assets.pop();
      });
      this.currentItems = assets;
      this.Searcheditems = this.currentItems;
      // console.log(this.currentItems)
      console.log(this.Searcheditems)
      // this.setFilteredItems();
    } catch (error) {
      console.log(error);
      if (this.isLoadingPresent) { this.dissmissLoading(); }

    }


    if (this.isLoadingPresent) { this.dissmissLoading(); }

  }

  loadReceivers() {
    try {
      // console.log(this.BCAccounts[0].pk);
      this.itemsProvider.querycocbysender(this.BCAccounts[0].pk).subscribe((resp) => {
        // @ts-ignore
        console.log(resp);
        // @ts-ignore
        this.receivers = resp;
        // console.log(this.receivers[0].Receiver);

        // remove duplicates
        var obj = {};
        for (var i = 0, len = this.receivers.length; i < len; i++)
          obj[this.receivers[i]['Receiver']] = this.receivers[i];

        this.receivers = new Array();

        for (var key in obj)
          this.receivers.push(obj[key].Receiver);

        console.log(this.receivers)

        console.log(this.receivers)
        if (this.isLoadingPresent) { this.dissmissLoading(); }


      }, (err) => {
        console.log('error in querying receivers')
        if (this.isLoadingPresent) { this.dissmissLoading(); }

      });
    } catch (error) {
      console.log(error);
      if (this.isLoadingPresent) { this.dissmissLoading(); }

    }
  }

  presentLoading() {
    this.isLoadingPresent = true;
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'pleasewait'
    });

    this.loading.present();
  }

  dissmissLoading() {
    this.isLoadingPresent = false;
    this.loading.dismiss();
  }

}
