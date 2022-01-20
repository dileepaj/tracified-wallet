import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, LoadingController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Network, Keypair, Transaction } from "stellar-base";
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';
import { AES, enc } from "crypto-js";
import { Logger } from 'ionic-logger-new';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { TranslateService } from '@ngx-translate/core';

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
  mainAccount: any;
  private cocSent = new Array();

  constructor(
    public navCtrl: NavController,
    public apiService: ApiServiceProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public itemsProvider: Items,
    private storage: StorageServiceProvider,
    private properties: Properties,
    private logger: Logger,
    private dataService: DataServiceProvider,
    private translate: TranslateService
  ) { }

  ngOnInit() { }

  ionViewDidLoad() {
    // this.setFilteredItems();
  }

  ionViewDidEnter() {
    this.mainAccount = this.properties.defaultAccount;
    this.getAllCoCs();
  }

  doRefresh(refresher) {
    this.getAllCoCs();
    refresher.complete();
  }

  // setFilteredItems() {
  //   this.Searcheditems = this.items.filter((item) => {
  //     return item.oname.toLowerCase().includes(this.searchTerm.toLowerCase());
  //   });

  // }

  getAllCoCs() {
    this.presentLoading();
    this.cocSent = [];
    this.dataService.getAllSentCoCs(this.mainAccount.pk).then((res) => {
      let cocs = res.body;
      if (cocs.length > 0) {
        let senderPks = new Array();
        for (let i = 0; i < cocs.length; i++) {
          senderPks.push(cocs[i].Receiver);
        }
        const param = {
          "account": {
            "accounts": senderPks
          }
        }

        this.dataService.getAccountNamesOfKeys(param).then((res) => {
          let accountNames = res.body.pk;
          cocs.forEach((coc) => {
            const transaction = new Transaction(coc.AcceptXdr);
            let minTime = new Date();
            let maxTime = new Date();

            let assetName;
            let amount;
            let receiver;

            transaction.operations.forEach((operation) => {
              if (operation.type == "payment") {
                assetName = operation.asset.code;
                amount = operation.amount;
                receiver = operation.destination;
              }
            });

            let cocObj = {
              AcceptTxn: coc.AcceptTxn,
              AcceptXdr: coc.AcceptXdr,
              RejectTxn: coc.RejectTxn,
              RejectXdr: coc.RejectXdr,
              Receiver: coc.Receiver,
              Sender: coc.Sender,
              SequenceNo: coc.SequenceNo,
              SubAccount: coc.SubAccount,
              TxnHash: coc.TxnHash,
              Status: coc.Status,
              Identifier: coc.Identifier,

              receiver: receiver,
              assetCode: assetName,
              quantity: amount,
              validTill: maxTime.toLocaleString(),
              sentDate: minTime.toLocaleString(),
              sentOriginal: minTime
            }
            cocObj.receiver = accountNames.find(o => cocObj.receiver == o.pk).accountName;
            this.cocSent.push(cocObj);
          });
          this.cocSent.sort((a, b) => (a.sentOriginal < b.sentOriginal) ? 1 : -1);
          this.dissmissLoading();
        }).catch((err) => {
          this.dissmissLoading();
          this.translate.get(['ERROR', 'FAILED_TO_FETCH_ACCOUNT_SENT']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_ACCOUNT_SENT']);
          });
          this.logger.error("Could not get the account names: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        });
      } else {
        this.dissmissLoading();
      }
    }).catch((err) => {
      this.dissmissLoading();
      if (err.status != 400) {
        this.translate.get(['ERROR', 'FAILED_TO_FETCH_SENT']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_SENT']);
        });
      }
      this.logger.error("Could not load CoCs: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
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

  presentAlert(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: 'OK'
    });
    alert.present();
  }

  // loadCOCSent() {
  //   try {
  //     this.itemsProvider.querycocbysender(this.mainAccount.pk).subscribe((resp) => {
  //       if (resp != null) {
  //         // @ts-ignore
  //         this.Citems = resp;
  //         const Tempitems = [];

  //         this.getNamesFromKeys(this.Citems).then((namedKeys) => {
  //           this.Citems.forEach(item => {
  //             const parsedTx = new Transaction(item.AcceptXdr)
  //             // @ts-ignore
  //             const oldDate: any = new Date(parsedTx.timeBounds.minTime * 1000);
  //             // @ts-ignore
  //             const newDate: any = new Date(parsedTx.timeBounds.maxTime * 1000);
  //             // @ts-ignore
  //             let now: number = new Date();
  //             var hoursAgo = this.timeDuration(now, oldDate);
  //             var validTill = this.timeDuration(newDate, now);

  //             let itemArr = [];
  //             parsedTx.operations.forEach(transac => {
  //               if (transac.type == 'payment') {
  //                 let i = 0;

  //                 let assetObj = {
  //                   "source": transac.source,
  //                   "sourcename": this.mainAccount.accountName,
  //                   "asset": transac.asset.code,
  //                   "amount": transac.amount,
  //                   "destination": transac.destination
  //                 }

  //                 itemArr.push(assetObj);
  //               }

  //             });
  //             const tempLast = itemArr.pop();

  //             const obj = {
  //               AcceptTxn: item.AcceptTxn,
  //               AcceptXdr: item.AcceptXdr,
  //               RejectTxn: item.RejectTxn,
  //               RejectXdr: item.RejectXdr,
  //               date: hoursAgo,
  //               itemArr: itemArr,
  //               uname: tempLast.destination,
  //               // @ts-ignore
  //               oname: tempLast.asset,
  //               // @ts-ignore
  //               qty: tempLast.amount,
  //               // @ts-ignore
  //               validity: newDate.toLocaleString(),
  //               time: validTill,
  //               status: item.Status,
  //               identifier: item.Identifier

  //             }
  //             // console.log(obj)
  //             Tempitems.push(obj)
  //             // console.log(Tempitems)
  //             this.items = Tempitems.reverse();
  //             // this.setFilteredItems();

  //           });
  //           return namedKeys
  //         }).then((namedKeys) => {
  //           this.items.forEach(element => {
  //             //@ts-ignore
  //             element.uname = namedKeys.find(o => element.uname === o.pk).accountName
  //           });

  //           if (this.isLoadingPresent) {
  //             this.dissmissLoading();
  //           }

  //         }).catch((err) => {
  //           console.log(err);
  //           if (this.isLoadingPresent) {
  //             this.dissmissLoading();
  //           }

  //         });
  //       } else {
  //         if (this.isLoadingPresent) {
  //           this.dissmissLoading();
  //         }
  //       }
  //     }, (err) => {
  //       if (this.isLoadingPresent) {
  //         this.dissmissLoading();
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     if (this.isLoadingPresent) {
  //       this.dissmissLoading();
  //     }
  //   }
  // }

  // getNamesFromKeys(receiverArr) {

  //   return new Promise((resolve, reject) => {

  //     // remove duplicates
  //     var obj = {};
  //     for (var i = 0, len = receiverArr.length; i < len; i++) {
  //       obj[receiverArr[i]['Receiver']] = receiverArr[i];
  //     }

  //     var receiverNames = new Array();

  //     for (var key in obj) {
  //       receiverNames.push(obj[key].Receiver);
  //     }

  //     const param = {
  //       "account": {
  //         "accounts": receiverNames
  //       }
  //     }

  //     this.apiService.getNames(param).subscribe((resp: any) => {
  //       console.log(resp);
  //       resolve(resp.body.pk)
  //     }, (err) => {
  //       if (this.isLoadingPresent) {
  //         this.dissmissLoading();
  //       }
  //       reject(err);
  //     });

  //     // resolve(["Sharmilan"]);
  //   });
  // }

  // timeDuration(now, oldDate) {
  //   // @ts-ignore
  //   var sec_num = (now - oldDate) / 1000;
  //   var days = Math.floor(sec_num / (3600 * 24));
  //   var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
  //   var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
  //   // var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));
  //   // @ts-ignore
  //   if (hours < 10) { hours = "0" + hours; }
  //   // @ts-ignore
  //   if (minutes < 10) { minutes = "0" + minutes; }

  //   return {
  //     'days': days,
  //     'hours': hours,
  //     'minutes': minutes
  //   };
  // }
}
