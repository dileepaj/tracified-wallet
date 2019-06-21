import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Server, Transaction } from 'stellar-sdk';
import { Items } from '../../providers/items/items';
import { ItemDetailPage } from '../item-detail/item-detail';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { AES, enc } from "crypto-js";

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
  BCAccounts: any;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private itemsProvider: Items,
    private storage: StorageServiceProvider,
    private properties: Properties,
    private alertCtrl: AlertController
    ) {

  }

  ngOnInit(){
    this.presentLoading();
    this.storage
      .getBcAccount(this.properties.userName)
      .then(accounts => {
        this.BCAccounts = JSON.parse(AES.decrypt(accounts.toString(), this.key).toString(enc.Utf8));
        if(this.BCAccounts) {
          this.getBalance();
          this.loadReceivers();
        }
        else {
          console.log("There should be at least one account.");
          this.dataError("Error","There should be at least one account.");
          this.dissmissLoading();
        }
      });
  }

  ionViewDidLoad() {}

  ionViewDidEnter() {}

  doRefresh(refresher) {
    this.presentLoading();
    console.log('Begin async operation', refresher);
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

    var server = new Server('https://horizon-testnet.stellar.org');
    // the JS SDK uses promises for most actions, such as retrieving an account
    server.loadAccount(this.BCAccounts[0].pk)
      .then(function (account) {
        // console.log('Balances for account: ' + JSON.stringify(account.balances));
        account.balances.forEach(function (balance) {
          // @ts-ignore
          console.log('Asset_code:', balance.asset_code, ', Balance:', balance.balance);
          let bal: number = parseFloat(balance.balance)
          // @ts-ignore
          assets.push({ 'asset_code': balance.asset_code, 'balance': bal.toFixed(0) });
        });
        assets.pop();
      })
      .catch(function (err) {
        console.error(err);
      });
    this.currentItems = assets;
    this.Searcheditems = this.currentItems;
    console.log(this.Searcheditems)
    if (this.isLoadingPresent) { this.dissmissLoading(); }
  }

  /**
* @desc retrieve receivers from the gateway
* @param string $pk - the public key of main account
* @author Jaje thananjaje3@gmail.com
* @return
*/
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
