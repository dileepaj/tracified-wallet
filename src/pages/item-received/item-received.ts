import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  AlertController,
  ToastController,
  LoadingController
} from "ionic-angular";
import { Items } from "../../providers/items/items";
import { Network, Keypair, Transaction } from "stellar-base";
Network.useTestNetwork();
import { AES, enc } from "crypto-js";
import { ApiServiceProvider } from "../../providers/api-service/api-service";
import { StorageServiceProvider } from "../../providers/storage-service/storage-service";
import { Properties } from "../../shared/properties";

@IonicPage()
@Component({
  selector: "page-item-received",
  templateUrl: "item-received.html"
})
export class ItemReceivedPage {
  key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
  adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

  searchTerm: any = "";
  Searcheditems: {
    date: string;
    uname: string;
    oname: string;
    qty: string;
    validity: string;
    time: string;
    status: string;
  }[];
  timeBound: number;
  user: any;
  loading;
  isLoadingPresent: boolean;
  Citems: any;

  items = [];
  BCAccounts: any;

  constructor(
    public navCtrl: NavController,
    public apiService: ApiServiceProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public itemsProvider: Items,
    private storage: StorageServiceProvider,
    private properties: Properties
  ) {}

  ngOnInit() {
    this.storage
      .getBcAccount(this.properties.userName)
      .then(accounts => {
        this.BCAccounts = JSON.parse(AES.decrypt(accounts.toString(), this.key).toString(enc.Utf8));
        if(this.BCAccounts){
        this.loadCOCReceived();
        }
      })
      .catch(error => {
        console.log(error);
        this.dataError("Error","There should be at least one account.");
      });
  }

  ionViewDidLoad() {
    this.presentLoading();
    this.setFilteredItems();
  }

  ionViewDidEnter() { }

  loadCOCReceived() {
    // try {
    this.itemsProvider.querycocbyReceiver(this.BCAccounts[0].pk).subscribe(
      resp => {
        if (resp != null) {
          this.Citems = resp;
          const Tempitems = [];

          this.getNamesFromKeys(this.Citems).then(namedKeys => {
            this.Citems.forEach(item => {
              const parsedTx = new Transaction(item.AcceptXdr);
              // @ts-ignore
              const oldDate: number = new Date(
                parsedTx.timeBounds.minTime * 1000
              );
              // @ts-ignore
              const newDate: number = new Date(
                parsedTx.timeBounds.maxTime * 1000
              );

              // @ts-ignore
              let now: number = new Date();
              var hoursAgo = this.timeDuration(now, oldDate);
              var validTill = this.timeDuration(newDate, now);

              let itemArr = [];
              parsedTx.operations.forEach(tansac => {
                if (tansac.type == "payment") {
                  let assetObj = {
                    source: tansac.source,
                    sourcename: this.BCAccounts[0].accountName,
                    asset: tansac.asset.code,
                    amount: tansac.amount
                  };

                  itemArr.push(assetObj);
                }
              });

              const tempLast = itemArr.pop();
              itemArr.length > 0
                ? (tempLast.source = itemArr[0].source)
                : null;
              const obj = {
                AcceptTxn: item.AcceptTxn,
                AcceptXdr: item.AcceptXdr,
                RejectTxn: item.RejectTxn,
                RejectXdr: item.RejectXdr,
                date: hoursAgo,
                itemArr: itemArr,
                uname: tempLast.source,
                oname: tempLast.asset,
                qty: tempLast.amount,
                validity: newDate.toLocaleString(),
                time: validTill,
                status: item.Status,

                Identifier: item.Identifier,
                Receiver: item.Receiver,
                Sender: item.Sender,
                SequenceNo: item.SequenceNo,
                SubAccount: item.SubAccount,
                TxnHash: item.TxnHash
              };
              Tempitems.push(obj);
              this.items = Tempitems.reverse();
              this.setFilteredItems();
            });
            return namedKeys;
          }).then(namedKeys => {
            this.items.forEach(element => {
              //@ts-ignore
              element.uname = namedKeys.find((o) => { element.uname === o.pk }).accountName;
            });

            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
          }).catch(err => {
            console.log(err);
            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
          });
        } else {
          if (this.isLoadingPresent) {
            this.dissmissLoading();
          }
        }
      },
      err => {
        console.log(err);
        if (this.isLoadingPresent) {
          this.dissmissLoading();
        }
      }
    );
  }

  signXDR(item, status, signerSK) {
    return new Promise((resolve, reject) => {
      var sourceKeypair = Keypair.fromSecret(signerSK);
      if (status == "accept") {
        item.status = "accepted";
        const parsedTx = new Transaction(item.AcceptXdr);
        parsedTx.sign(sourceKeypair);
        let x = parsedTx
          .toEnvelope()
          .toXDR()
          .toString("base64");
        item.AcceptXdr = x;
        resolve(item);
      } else {
        item.status = "rejected";
        const parsedTx = new Transaction(item.RejectXdr);
        parsedTx.sign(sourceKeypair);
        let x = parsedTx
          .toEnvelope()
          .toXDR()
          .toString("base64");
        item.RejectXdr = x;
        resolve(item);
      }
    }).catch(function (e) {
      console.log(e);
      // reject(e)
    });
  }

  sendSignedXDR(item, status, signerSK) {
    this.presentLoading();
    this.signXDR(item, status, signerSK)
      .then(obj => {
        console.log(obj);
        this.itemsProvider.updateStatusCOC(obj).subscribe(resp => {
          console.log(resp);
          // @ts-ignore
          if (resp.Body.Status == "accepted") {
            this.presentToast("Transaction Success!");
            // @ts-ignore
          } else if (resp.Body.Status == "rejected") {
            this.presentToast("Transaction Success!");
          }
          if (this.isLoadingPresent) {
            this.dissmissLoading();
          }
        },
          err => {
            console.log(err);
            item.status = "pending";
            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
            this.presentToast("Transaction Unsuccessfull");
          }
        );
      })
      .catch(e => {
        console.log(e);
        if (this.isLoadingPresent) {
          this.dissmissLoading();
          this.presentToast("Error! signing Transaction.");
        }
      });
  }

  getNamesFromKeys(receiverArr) {
    return new Promise((resolve, reject) => {
      var obj = {};
      for (var i = 0, len = receiverArr.length; i < len; i++)
        obj[receiverArr[i]["Sender"]] = receiverArr[i];

      var receiverNames = new Array();

      for (var key in obj) receiverNames.push(obj[key].Sender);

      console.log(receiverNames);

      const param = {
        account: {
          accounts: receiverNames
        }
      };

      this.apiService.getNames(param).subscribe(
        resp => {
          //@ts-ignore
          console.log(resp.body.pk);
          //@ts-ignore
          resolve(resp.body.pk);
        },
        err => {
          if (this.isLoadingPresent) {
            this.dissmissLoading();
          }
          reject(err);
        }
      );
    });
  }

  timeDuration(now, oldDate) {
    // @ts-ignore
    var sec_num = (now - oldDate) / 1000;
    var days = Math.floor(sec_num / (3600 * 24));
    var hours = Math.floor((sec_num - days * (3600 * 24)) / 3600);
    var minutes = Math.floor(
      (sec_num - days * (3600 * 24) - hours * 3600) / 60
    );
    // @ts-ignore
    if (hours < 10) {
      hours = 0 + hours;
    }
    // @ts-ignore
    if (minutes < 10) {
      minutes = 0 + minutes;
    }

    return {
      days: days,
      hours: hours,
      minutes: minutes
    };
  }

  passwordPrompt(item, buttonStatus) {
    let alert = this.alertCtrl.create({
      cssClass: "submitPassword",
      title: "Enter Password : ",
      inputs: [
        {
          name: "password",
          placeholder: "***********",
          type: "password"
        }
      ],
      buttons: [
        {
          text: "Submit",
          handler: data => {
            if (data.password != "") {
              this.sendSignedXDR(
                item,
                buttonStatus,
                this.decyrptSecret(this.BCAccounts[0].sk, data.password)
              );
            }
          }
        }
      ]
    });
    alert.present();
  }

  setFilteredItems() {
    this.Searcheditems = this.items.filter(item => {
      return item.oname.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  decyrptSecret(ciphertext, signer) {
    var decrypted = AES.decrypt(ciphertext.toString(), signer).toString(
      enc.Utf8
    );
    return decrypted;
  }

  doRefresh(refresher) {
    this.presentLoading();
    this.loadCOCReceived();
    refresher.complete();
  }

  presentLoading() {
    this.isLoadingPresent = true;
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: "Please Wait"
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
      position: "middle"
    });
    toast.present();
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
