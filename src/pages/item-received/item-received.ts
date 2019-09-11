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
Network.usePublicNetwork();
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
  key: string = "ejHu3Gtucptt93py1xS4qWvIrweMBaO";
  adminKey: string = "hackerkaidagalbanisbaby"
    .split("")
    .reverse()
    .join("");

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
  mainAccount: any;

  constructor(
    public navCtrl: NavController,
    public apiService: ApiServiceProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public itemsProvider: Items,
    private storage: StorageServiceProvider,
    private properties: Properties
  ) { }

  ngOnInit() { }

  ionViewDidLoad() {
    this.setFilteredItems();
  }

  ionViewDidEnter() {
    this.presentLoading();
    this.mainAccount = this.properties.defaultAccount;
    this.loadCOCReceived();
  }

  loadCOCReceived() {
    // try {
    this.itemsProvider.querycocbyReceiver(this.mainAccount.pk).subscribe(
      resp => {
        console.log("Resp: ", resp);
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
              parsedTx.operations.forEach(transac => {
                if (transac.type == "payment") {
                  let assetObj = {
                    "source": transac.source,
                    "sourcename": this.mainAccount.accountName,
                    "asset": transac.asset.code,
                    "amount": transac.amount
                  };

                  itemArr.push(assetObj);
                }
              });

              const tempLast = itemArr.pop();

              if (itemArr.length > 0) {
                tempLast.source = itemArr[0].source
              } else {
                tempLast.source = null;
              }

              // console.log("tempLast.source: ", tempLast.source);

              const obj = {
                AcceptTxn: item.AcceptTxn,
                AcceptXdr: item.AcceptXdr,
                RejectTxn: item.RejectTxn,
                RejectXdr: item.RejectXdr,
                date: hoursAgo,
                itemArr: itemArr,
                uname: 'GB6LZPFMYLHY3EYFXAO7H7257QWHIFVFOMQ4ECFXF43FUQ5NH74ULWD3',
                // uname: tempLast.source,
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
              console.log("Named Keys: ", namedKeys);
              console.log("Uname: ", element.uname);
              //@ts-ignore
              element.uname = namedKeys.find(o => element.uname === o.pk ).accountName;
            });

            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
          }).catch(err => {
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

    }).catch((e) => {
      // reject(e)
    });
  }

  sendSignedXDR(item, status, signerSK) {
    this.presentLoading();
    this.signXDR(item, status, signerSK).then(obj => {
      this.itemsProvider.updateStatusCOC(obj).subscribe(resp => {
        // @ts-ignore
        if (resp.Body.Status == "accepted") {
          this.presentAlert("Success", "Successfully transferred the assets. You can check available assets in Transfer page.");
          // @ts-ignore
        } else if (resp.Body.Status == "rejected") {
          this.presentAlert("Error", "Asset could not be accepted due to an error. Please try again or contact an admin.");
        }
        if (this.isLoadingPresent) {
          this.dissmissLoading();
        }
      }, err => {
        item.status = "pending";
        if (this.isLoadingPresent) {
          this.dissmissLoading();
        }
        this.presentAlert("Error", "Asset could not be accepted due to an error. Please try again or contact an admin.");
      });
    }).catch(e => {
      if (this.isLoadingPresent) {
        this.dissmissLoading();
        this.presentAlert("Error", "Asset could not be accepted due to an error. Please try again or contact an admin.");
      }
    });
  }

  getNamesFromKeys(receiverArr) {
    return new Promise((resolve, reject) => {
      var obj = {};
      for (var i = 0, len = receiverArr.length; i < len; i++) {
        obj[receiverArr[i]["Sender"]] = receiverArr[i];
      }

      var receiverNames = new Array();

      for (var key in obj) {
        receiverNames.push(obj[key].Sender);
      }

      const param = {
        "account": {
          "accounts": receiverNames
        }
      }

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
          placeholder: "",
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
                this.decyrptSecret(this.mainAccount.sk, data.password)
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
      duration: 2500,
      position: "bottom"
    });
    toast.present();
  }

  dataError(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: "close"
    });
    alert.present();
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
}
