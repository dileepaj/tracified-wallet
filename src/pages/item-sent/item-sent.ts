import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Transaction } from 'stellar-sdk';

/**
 * Generated class for the ItemSentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-item-sent',
  templateUrl: 'item-sent.html',
})
export class ItemSentPage {
  // @Input() status: string;
  searchTerm: any = '';

  items = []
  Searcheditems: { date: string; uname: string; oname: string; qty: string; validity: string; time: number; status: string; }[];
  user: any;
  loading;
  isLoadingPresent: boolean;
  Citems: any;
  BCAccounts: any;

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private loadingCtrl: LoadingController, public itemsProvider: Items) {
    this.user = JSON.parse(localStorage.getItem('_user'))
    this.BCAccounts = JSON.parse(localStorage.getItem('_BCAccounts'))
    // this.loadCOCSent();
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.loadCOCSent();

    this.setFilteredItems();
  }

  ionViewDidEnter() {

  }

  doRefresh(refresher) {
    this.presentLoading();
    console.log('Begin async operation', refresher);
    this.loadCOCSent();
    // setTimeout(() => {
    //   console.log('Async operation has ended');
    refresher.complete();
    // }, 2000);
  }

  setFilteredItems() {
    this.Searcheditems = this.items.filter((item) => {
      return item.oname.toLowerCase().includes(this.searchTerm.toLowerCase());
    });

  }


  loadCOCSent() {
    try {
      console.log(this.BCAccounts[1].pk);

    this.itemsProvider.querycocbysender(this.BCAccounts[1].pk).subscribe((resp) => {
      // @ts-ignore
      console.log(resp);
      this.Citems = resp;
      const Tempitems = []
      this.Citems.forEach(item => {
        const parsedTx = new Transaction(item.AcceptXdr)
        // @ts-ignore
        const oldDate: any = new Date(parsedTx.timeBounds.minTime * 1000);
        // @ts-ignore
        const newDate: any = new Date(parsedTx.timeBounds.maxTime * 1000);

        let itemArr = [];
        parsedTx.operations.forEach(tansac => {
          if (tansac.type == 'payment') {
            console.log(tansac)
            let i = 0;

            let assetObj = {
              "source": tansac.source,
              "asset": tansac.asset.code,
              "amount": tansac.amount
            }

            itemArr.push(assetObj);
          }

        });
        console.log(itemArr)

        const tempLast = itemArr.pop();
        const obj = {
          AcceptTxn: item.AcceptTxn,
          AcceptXdr: item.AcceptXdr,
          RejectTxn: item.RejectTxn,
          RejectXdr: item.RejectXdr,
          // @ts-ignore
          date: oldDate.toLocaleString(),
          itemArr: itemArr,
          uname: tempLast.source,
          // @ts-ignore
          oname: tempLast.asset,
          // @ts-ignore
          qty: tempLast.amount,
          // @ts-ignore
          validity: newDate.toLocaleString(),
          time: (Math.round((newDate - oldDate) / (1000 * 60 * 60 * 24))),
          status: item.Status
        }
        // console.log(obj)
        Tempitems.push(obj)
        // console.log(Tempitems)
        this.items = Tempitems;
        this.setFilteredItems();

      });

    }, (err) => {
      console.log('error in querying COC Sent')
      if (this.isLoadingPresent) { this.dissmissLoading(); }

    });

    if (this.isLoadingPresent) { this.dissmissLoading(); }
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
