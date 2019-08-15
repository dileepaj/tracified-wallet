import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Server, Transaction } from 'stellar-sdk';
import { Items } from '../../providers/items/items';
import { ItemDetailPage } from '../item-detail/item-detail';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { AES, enc } from "crypto-js";
import { stellarNet } from '../../shared/config';

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
    private alertCtrl: AlertController
  ) { }

  ionViewDidLoad() { }


  ionViewDidEnter() {
    this.presentLoading();
    this.mainAccount = this.properties.defaultAccount;
    this.getBalance();
    this.loadReceivers();
  }

  doRefresh(refresher) {
    this.presentLoading();
    this.getBalance();
    refresher.complete();
  }

  openItem(item) {
    this.navCtrl.push(ItemDetailPage, {
      item: item,
      currentItems: this.currentItems,
      receivers: this.receivers
    });
  }

  setFilteredItems() {
    this.Searcheditems = this.currentItems.filter((item) => {
      return item.asset_code.toLowerCase().includes(this.searchTerm.toLowerCase());
    });

  }

  getBalance() {
    let assets = [];
    var server = new Server(stellarNet);
    server.loadAccount(this.mainAccount.pk).then((account) => {
      account.balances.forEach((balance) => {
        let bal: number = parseFloat(balance.balance);
        // @ts-ignore
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

  loadReceivers() {
    try {
      this.itemsProvider.querycocbysender(this.mainAccount.pk).subscribe((resp) => {
        // @ts-ignore
        console.log(resp);
        // @ts-ignore
        this.receivers = resp;
        var obj = {};
        for (var i = 0, len = this.receivers.length; i < len; i++)
          obj[this.receivers[i]['Receiver']] = this.receivers[i];

        this.receivers = new Array();

        for (var key in obj)
          this.receivers.push(obj[key].Receiver);

        if (this.isLoadingPresent) {
          this.dissmissLoading();
        }
      }, (err) => {
        if (this.isLoadingPresent) {
          this.dissmissLoading();
        }
      });
    } catch (error) {
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
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
