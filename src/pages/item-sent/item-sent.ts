import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Transaction } from 'stellar-sdk';
import Duration from "duration";
import { Api } from '../../providers';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { AES, enc } from "crypto-js";

@IonicPage()
@Component({
  selector: 'page-item-sent',
  templateUrl: 'item-sent.html',
})
export class ItemSentPage {
  key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
  adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

  searchTerm: any = '';
  items = []
  Searcheditems: { date: string; uname: string; oname: string; qty: string; validity: string; time: number; status: string; }[];
  user: any;
  loading;
  isLoadingPresent: boolean;
  Citems: any;
  BCAccounts: any;

  constructor(
    public navCtrl: NavController,
    public api: Api,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public itemsProvider: Items,
    private storage: StorageServiceProvider,
    private properties: Properties
  ) {}

  ionViewDidLoad() {
    this.presentLoading();
    this.storage.getBcAccount(this.properties.userName).then((accounts) => {
      this.BCAccounts = accounts;
      this.BCAccounts = JSON.parse(AES.decrypt(this.BCAccounts, this.key).toString(enc.Utf8));
      if(this.BCAccounts){
        this.loadCOCSent();
      }
    }).catch((error)=>{
      console.log(error);
      this.dataError("Error","There should be at least one account.");
    });

    this.setFilteredItems();
  }

  ionViewDidEnter() {

  }

  doRefresh(refresher) {
    this.presentLoading();
    this.loadCOCSent();
    refresher.complete();
  }

  setFilteredItems() {
    this.Searcheditems = this.items.filter((item) => {
      return item.oname.toLowerCase().includes(this.searchTerm.toLowerCase());
    });

  }

  /**
* @desc retrieve COC transaction from gateway
* @param
* @author Jaje thananjaje3@gmail.com
* @return
*/
  loadCOCSent() {
    try {
      console.log(this.BCAccounts[0].pk);

      this.itemsProvider.querycocbysender(this.BCAccounts[0].pk).subscribe((resp) => {
        if (resp != null) {
          // @ts-ignore
          console.log(resp);
          this.Citems = resp;
          const Tempitems = []

          this.getNamesFromKeys(this.Citems)
            .then((namedKeys) => {
              this.Citems.forEach(item => {
                const parsedTx = new Transaction(item.AcceptXdr)
                // @ts-ignore
                const oldDate: any = new Date(parsedTx.timeBounds.minTime * 1000);
                // @ts-ignore
                const newDate: any = new Date(parsedTx.timeBounds.maxTime * 1000);

                // @ts-ignore
                let now: number = new Date();
                var hoursAgo = this.timeDuration(now, oldDate);
                var validTill = this.timeDuration(newDate, now);

                let itemArr = [];
                parsedTx.operations.forEach(tansac => {
                  if (tansac.type == 'payment') {
                    console.log(tansac)
                    let i = 0;

                    let assetObj = {
                      "source": tansac.source,
                      "sourcename": this.BCAccounts[0].accountName,
                      "asset": tansac.asset.code,
                      "amount": tansac.amount,
                      "destination": tansac.destination
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
                  // date: oldDate.toLocaleString(),
                  date: hoursAgo,
                  itemArr: itemArr,
                  uname: tempLast.destination,
                  // @ts-ignore
                  oname: tempLast.asset,
                  // @ts-ignore
                  qty: tempLast.amount,
                  // @ts-ignore
                  validity: newDate.toLocaleString(),
                  time: validTill,
                  status: item.Status
                }
                // console.log(obj)
                Tempitems.push(obj)
                // console.log(Tempitems)
                this.items = Tempitems.reverse();
                this.setFilteredItems();

              });
              return namedKeys
            })
            .then((namedKeys) => {
              console.log(namedKeys);

              this.items.forEach(element => {
                //@ts-ignore
                element.uname = namedKeys.find(o => element.uname === o.pk).accountName
              });

              if (this.isLoadingPresent) { this.dissmissLoading(); }

            })
            .catch((err) => {
              console.log(err);
              if (this.isLoadingPresent) { this.dissmissLoading(); }

            })
        } else {
          if (this.isLoadingPresent) { this.dissmissLoading(); }

        }
      }, (err) => {
        // console.log('error in querying COC Sent')
        console.log(err.error.Status)
        if (this.isLoadingPresent) { this.dissmissLoading(); }

      });
    } catch (error) {
      console.log(error);
      if (this.isLoadingPresent) { this.dissmissLoading(); }
    }

  }

  /**
* @desc retrieve names against account public keys from admin
* @param stringArray $receiverArr - publick key array
* @author Jaje thananjaje3@gmail.com
* @return account names object for public keys
*/
  getNamesFromKeys(receiverArr) {

    return new Promise((resolve, reject) => {

      // remove duplicates
      var obj = {};
      for (var i = 0, len = receiverArr.length; i < len; i++)
        obj[receiverArr[i]['Receiver']] = receiverArr[i];

      var receiverNames = new Array();

      for (var key in obj)
        receiverNames.push(obj[key].Receiver);

      console.log(receiverNames)

      const param = {
        "account": {
          "accounts": receiverNames
        }
      }

      this.api.getNames(param).subscribe((resp) => {
        //@ts-ignore
        console.log(resp.body.pk);
        //@ts-ignore
        resolve(resp.body.pk)
      }, (err) => {
        if (this.isLoadingPresent) { this.dissmissLoading(); }
        reject(err)

      });
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
