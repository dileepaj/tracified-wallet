import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
// import { Transaction } from 'stellar-sdk';
import { Network, Keypair, Transaction } from "stellar-base";
Network.useTestNetwork();
/**
 * Generated class for the ItemReceivedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-item-received',
  templateUrl: 'item-received.html',
})
export class ItemReceivedPage {
  searchTerm: any = '';
  Searcheditems: { date: string; uname: string; oname: string; qty: string; validity: string; time: string; status: string; }[];
  timeBound: number;
  user: any;
  loading;
  isLoadingPresent: boolean;
  Citems: any;

  items = [];

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private loadingCtrl: LoadingController,
    public toastCtrl: ToastController, public itemsProvider: Items) {
    this.user = JSON.parse(localStorage.getItem('_user'))
    // this.loadCOCReceived();
  }


  ionViewDidLoad() {
    this.presentLoading();
    this.loadCOCReceived();

    this.setFilteredItems();
  }

  ionViewDidEnter() {

  }

  passwordPrompt(item, buttonStatus) {
    let alert = this.alertCtrl.create({
      cssClass: 'submitPassword',
      title: 'Enter Password : ',
      inputs: [
        {
          name: 'password',
          placeholder: '***********',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Submit',
          handler: data => {
            if (data) {
              console.log(data);
              this.signXDR(item, buttonStatus, data.password);
            } else {
              // console.log(data);
              // return data;
            }
          }
        }
      ]
    });
    alert.present();
  }

  setFilteredItems() {
    this.Searcheditems = this.items.filter((item) => {
      return item.oname.toLowerCase().includes(this.searchTerm.toLowerCase());
    });

  }

  // doInfinite(infiniteScroll) {
  //   console.log('Begin async operation');

  //   setTimeout(() => {
  //     for (let i = 0; i < this.items.length; i++) {
  //       this.items.push( this.items.length );
  //     }

  //     console.log('Async operation has ended');
  //     infiniteScroll.complete();
  //   }, 500);
  // }


  doRefresh(refresher) {
    this.presentLoading();
    console.log('Begin async operation', refresher);
    this.loadCOCReceived();
    // setTimeout(() => {
    //   console.log('Async operation has ended');
    refresher.complete();
    // }, 2000);
  }

  loadCOCReceived() {
    console.log(this.user.PublicKey);
    // this.toast.present();

    this.itemsProvider.querycocbyReceiver(this.user.PublicKey).subscribe((resp) => {
      // @ts-ignore
      console.log(resp);
      this.Citems = resp;
      const Tempitems = []

      this.Citems.forEach(item => {
        const parsedTx = new Transaction(item.AcceptXdr)
        // @ts-ignore
        const oldDate: number = new Date(parsedTx.timeBounds.minTime * 1000);
        // @ts-ignore
        const newDate: number = new Date(parsedTx.timeBounds.maxTime * 1000);
        
        const obj = {
          AcceptTxn: item.AcceptTxn,
          AcceptXdr: item.AcceptXdr,
          RejectTxn: item.RejectTxn,
          RejectXdr: item.RejectXdr,
          // @ts-ignore
          date: oldDate.toLocaleString(),
          uname: parsedTx.operations[3].source,
          // @ts-ignore
          oname: parsedTx.operations[3].asset.code,
          // @ts-ignore
          qty: parsedTx.operations[3].amount,
          // @ts-ignore
          validity: newDate.toLocaleString(),
          time: (Math.round((newDate - oldDate) / (1000 * 60 * 60 * 24))),
          status: item.Status.toUpperCase()
        }
        // console.log(obj)
        Tempitems.push(obj)
        // console.log(Tempitems)
        this.items = Tempitems;
        this.setFilteredItems();
      });
      if (this.isLoadingPresent) { this.dissmissLoading(); }

    }, (err) => {
      console.log('error in querying COCreceived')
      if (this.isLoadingPresent) { this.dissmissLoading(); }
    });
  }

  signXDR(item, status, signerSK) {

    try {
      this.presentLoading();
      var sourceKeypair = Keypair.fromSecret(signerSK);
      // Keypair.fromSecret(signerSK)
      if (status == 'accept') {
        var sendItem = item
        sendItem.status = 'accepted';
        const parsedTx = new Transaction(sendItem.AcceptXdr)
        parsedTx.sign(sourceKeypair)
        let x = parsedTx.toEnvelope().toXDR().toString('base64')
        sendItem.AcceptXdr = x;
        console.log(x);

      } else {
        sendItem = item
        sendItem.status = 'rejected';
        const parsedTx = new Transaction(sendItem.RejectXdr)
        parsedTx.sign(sourceKeypair)
        let x = parsedTx.toEnvelope().toXDR().toString('base64')
        sendItem.RejectXdr = x;
        console.log(x)

      }

      this.itemsProvider.updateStatusCOC(sendItem).subscribe((resp) => {
        console.log(sendItem)
        console.log(resp)
        // @ts-ignore
        if (resp.Body.Status == 'accepted') {
          item.status = 'ACCEPTED';
          if (this.isLoadingPresent) { this.dissmissLoading(); }

          // this.toast.present();
          // @ts-ignore
        } else if (resp.Body.Status == 'rejected') {
          item.status = 'REJECTED';
          // this.toast.present();
          if (this.isLoadingPresent) { this.dissmissLoading(); }

        }

      }, (err) => {
        console.log(err);
        item.status = 'PENDING';
        if (this.isLoadingPresent) { this.dissmissLoading(); }

        // this.toast.present();

        //   this.navCtrl.push(MainPage);
        //   // Unable to log in
        //   let toast = this.toastCtrl.create({
        //     message: this.loginErrorString,
        //     duration: 3000,
        //     position: 'bottom'
        //   });
        //   toast.present();
      });
    } catch (error) {
      console.log(error)
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


    // {
    //   date: 'today',
    //   uname: 'jack',
    //   oname: 'Apple',
    //   qty: '10',
    //   validity: 'VALIDITY',
    //   time: '30-D',
    //   status: 'pending'
    // },
    // {
    //   date: 'yesterday',
    //   uname: 'Murtaza',
    //   oname: 'Orange',
    //   qty: '10',
    //   validity: 'VALIDITY',
    //   time: '30-D', status: 'pending'
    // },
    // {
    //   date: '12th November 2018',
    //   uname: 'Azeem',
    //   oname: 'Banana',
    //   qty: '10',
    //   validity: 'VALIDITY',
    //   time: '30-D', status: 'pending'
    // },
    // {
    //   date: 'today',
    //   uname: 'Azkar',
    //   oname: 'Grapes',
    //   qty: '10',
    //   validity: 'VALIDITY',
    //   time: '30-D', status: 'pending'
    // },
    // {
    //   date: 'today',
    //   uname: 'Azkar',
    //   oname: 'Apple',
    //   qty: '10',
    //   validity: 'VALIDITY',
    //   time: '30-D', status: 'pending'
    // },