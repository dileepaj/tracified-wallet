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

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private loadingCtrl: LoadingController, public itemsProvider: Items) {
    this.user = JSON.parse(localStorage.getItem('_user'))
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

    console.log(this.user.PublicKey);
    this.itemsProvider.querycocbysender(this.user.PublicKey).subscribe((resp) => {
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
        console.log(parsedTx)
        // console.log(parsedTx.timeBounds.maxTime)
        // console.log(parsedTx.timeBounds.minTime)
        // console.log(parsedTx.operations[3].asset.code)
        // console.log(parsedTx.operations[3].amount)
        // console.log('sender : ' + parsedTx.operations[3].source)
        // console.log('receiver : ' + parsedTx.source)
        const obj = {
          AcceptTxn: item.AcceptTxn,
          AcceptXdr: item.AcceptXdr,
          RejectTxn: item.RejectTxn,
          RejectXdr: item.RejectXdr,
          // @ts-ignore
          date: oldDate.toLocaleString(),
          uname: parsedTx.source,
          // @ts-ignore
          oname: parsedTx.operations[3].asset.code,
          // @ts-ignore
          qty: parsedTx.operations[3].amount,
          // @ts-ignore
          validity: newDate.toLocaleString(),
          time: (Math.round((newDate - oldDate) / (1000 * 60 * 60 * 24))),
          status: item.Status.toUpperCase()
        }
        console.log(obj)
        Tempitems.push(obj)
        console.log(Tempitems)
        this.items = Tempitems;
        this.setFilteredItems();

      });

      // @ts-ignore
      // console.log(this.receivers[0].Receiver);

      // console.log(this.receivers)

    }, (err) => {
      console.log('error in querying COCreceived')
      if (this.isLoadingPresent) { this.dissmissLoading(); }

    });

    if (this.isLoadingPresent) { this.dissmissLoading(); }
  
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
