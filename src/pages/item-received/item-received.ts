import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
// import { Transaction } from 'stellar-sdk';
import { Network, Keypair, Transaction } from "stellar-base";
Network.useTestNetwork();
import { AES, enc } from "crypto-js";
import Duration from "duration";

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
  BCAccounts: any;

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private loadingCtrl: LoadingController,
    public toastCtrl: ToastController, public itemsProvider: Items) {
    this.user = JSON.parse(localStorage.getItem('_user'))
    this.BCAccounts = JSON.parse(localStorage.getItem('_BCAccounts'))
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
            if (data.password != "") {
              console.log(data);
              this.sendSignedXDR(item, buttonStatus, this.decyrptSecret(this.BCAccounts[1].sk, data.password));
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

  decyrptSecret(ciphertext, signer) {
    // Decrypt
    var decrypted = (AES.decrypt(ciphertext.toString(), signer)).toString(enc.Utf8);

    console.log("signer => " + signer);
    console.log("ciphertext => " + ciphertext);
    console.log("plaintext => " + decrypted);

    return decrypted;
  }

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
    try {
      // console.log(this.BCAccounts[1].pk);

      this.itemsProvider.querycocbyReceiver(this.BCAccounts[1].pk).subscribe((resp) => {
        // @ts-ignore
        // console.log(resp);
        this.Citems = resp;
        const Tempitems = []

        this.Citems.forEach(item => {
          const parsedTx = new Transaction(item.AcceptXdr)
          // @ts-ignore
          const oldDate: number = new Date(parsedTx.timeBounds.minTime * 1000);
          // @ts-ignore
          const newDate: number = new Date(parsedTx.timeBounds.maxTime * 1000);

          // @ts-ignore
          let now: number = new Date();
          var hoursAgo = this.timeDuration(now, oldDate);
          var validTill = this.timeDuration(newDate, now);

          let itemArr = [];
          parsedTx.operations.forEach(tansac => {
            if (tansac.type == 'payment') {
              // console.log(tansac)
              // let i = 0;

              let assetObj = {
                "source": tansac.source,
                "sourcename": this.BCAccounts[1].accountName,
                "asset": tansac.asset.code,
                "amount": tansac.amount
              }

              itemArr.push(assetObj);
            }

          });
          // console.log(itemArr)

          const tempLast = itemArr.pop();

          const obj = {
            AcceptTxn: item.AcceptTxn,
            AcceptXdr: item.AcceptXdr,
            RejectTxn: item.RejectTxn,
            RejectXdr: item.RejectXdr,
            // @ts-ignore
            // date: days + 'd ' + hours + 'h ' + minutes + 'm ago',
            date: hoursAgo,
            // date: oldDate.toLocaleString(),
            itemArr: itemArr,
            uname: tempLast.source,
            // @ts-ignore
            oname: tempLast.asset,
            // @ts-ignore
            qty: tempLast.amount,
            // @ts-ignore
            validity: newDate.toLocaleString(),
            time: validTill,
            // time: (Math.round((newDate - oldDate) / (1000 * 60 * 60 * 24))),
            status: item.Status,

            Identifier: item.Identifier,
            Receiver: item.Receiver,
            Sender: item.Sender,
            SequenceNo: item.SequenceNo,
            SubAccount: item.SubAccount,
            TxnHash: item.TxnHash
          }
          // console.log(obj)
          Tempitems.push(obj)
          // console.log(Tempitems)
          this.items = Tempitems.reverse();
          this.setFilteredItems();
        });
        if (this.isLoadingPresent) { this.dissmissLoading(); }

      }, (err) => {
        console.log('error in querying COCreceived')
        if (this.isLoadingPresent) { this.dissmissLoading(); }
      });
    } catch (error) {
      console.log(error)
      if (this.isLoadingPresent) { this.dissmissLoading(); }
    }
  }

  signXDR(item, status, signerSK) {
    return new Promise((resolve, reject) => {
      var sourceKeypair = Keypair.fromSecret(signerSK);
      if (status == 'accept') {
        item.status = 'accepted';
        const parsedTx = new Transaction(item.AcceptXdr)
        parsedTx.sign(sourceKeypair)
        let x = parsedTx.toEnvelope().toXDR().toString('base64')
        item.AcceptXdr = x;
        resolve(item);
      } else {
        item.status = 'rejected';
        const parsedTx = new Transaction(item.RejectXdr)
        parsedTx.sign(sourceKeypair)
        let x = parsedTx.toEnvelope().toXDR().toString('base64')
        item.RejectXdr = x;
        // console.log(x)
        resolve(item);
      }
    }).catch(function (e) {
      console.log(e);
      // reject(e)

    });
  }

  sendSignedXDR(item, status, signerSK) {
    this.presentLoading();
    this.signXDR(item, status, signerSK).then((obj) => {
      this.itemsProvider.updateStatusCOC(obj).subscribe((resp) => {
        console.log(obj)
        console.log(resp)
        // @ts-ignore
        if (resp.Body.Status == 'accepted') {
          this.presentToast('Transaction Success!');
          // @ts-ignore
        } else if (resp.Body.Status == 'rejected') {
          this.presentToast('Transaction Success!');
        }
        if (this.isLoadingPresent) { this.dissmissLoading(); }

      }, (err) => {
        console.log(err);
        item.status = 'pending';
        if (this.isLoadingPresent) { this.dissmissLoading(); }
        this.presentToast('Transaction Unsuccessfull');
      });
    }).catch(e => {
      console.log(e)
      if (this.isLoadingPresent) {
        this.dissmissLoading();
        this.presentToast('Error! signing Transaction.');
      }
    })
  }

  timeDuration(now, oldDate) {
    // @ts-ignore
    var sec_num = (now - oldDate) / 1000;
    var days = Math.floor(sec_num / (3600 * 24));
    var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
    var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
    // var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));
    // @ts-ignore
    if (hours < 10) { hours = "0" + hours; }
    // @ts-ignore
    if (minutes < 10) { minutes = "0" + minutes; }

    return {
      'days': days,
      'hours': hours,
      'minutes': minutes
    };
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

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 4000,
      position: 'middle'
    });
    toast.present();
  }
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