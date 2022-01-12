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
import { AES, enc } from "crypto-js";
import { ApiServiceProvider } from "../../providers/api-service/api-service";
import { StorageServiceProvider } from "../../providers/storage-service/storage-service";
import { Properties } from "../../shared/properties";
import { DataServiceProvider } from "../../providers/data-service/data-service";
import { Logger } from "ionic-logger-new";
import { BlockchainServiceProvider } from "../../providers/blockchain-service/blockchain-service";
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: "page-item-received",
  templateUrl: "item-received.html"
})
export class ItemReceivedPage {
  key: string = "ejHu3Gtucptt93py1xS4qWvIrweMBaO";
  adminKey: string = "hackerkaidagalbanisbaby".split("").reverse().join("");

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
  items = [];
  mainAccount: any;


  private cocReceived = new Array();

  constructor(
    public navCtrl: NavController,
    public apiService: ApiServiceProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public itemsProvider: Items,
    private properties: Properties,
    private dataService: DataServiceProvider,
    private logger: Logger,
    private blockchainService: BlockchainServiceProvider,
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

  getAllCoCs() {
    this.presentLoading();
    this.cocReceived = [];
    this.dataService.getAllReceivedCoCs(this.mainAccount.pk).then((res) => {
      let cocs = res.body;
      
      if (cocs && cocs.length > 0) {
        let senderPks = new Array();
        for (let i = 0; i < cocs.length; i++) {
          senderPks.push(cocs[i].Sender);
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
            let minTime = new Date(transaction.timeBounds.minTime * 1000);
            let maxTime = new Date(transaction.timeBounds.maxTime * 1000);

            let assetName;
            let amount;
            let sender;

            transaction.operations.forEach((operation) => {
              if (operation.type == "payment") {
                assetName = operation.asset.code;
                amount = operation.amount;
                sender = operation.source;
              }
            });

            let cocObj = {
              cocOriginal: {
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
                Identifier: coc.Identifier
              },
              sender: sender,
              assetCode: assetName,
              quantity: amount,
              validTill: maxTime.toLocaleString(),
              sentDate: minTime.toLocaleString(),
              sentOriginal: minTime
            }

            cocObj.sender = accountNames.find(o => cocObj.sender == o.pk).accountName;
            this.cocReceived.push(cocObj);
          });
          this.cocReceived.sort((a, b) => (a.sentOriginal < b.sentOriginal) ? 1 : -1);

          this.dissmissLoading();
        }).catch((err) => {
          this.dissmissLoading();
          this.translate.get(['ERROR', 'FAILED_TO_FETCH_ACCOUNT']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_ACCOUNT']);
          });
          this.logger.error("Could not get the account names: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        });
      } else {
        this.dissmissLoading();
      }
    }).catch((err) => {
      this.dissmissLoading();
      if (err.status != 400) {
        this.translate.get(['ERROR', 'FAILED_TO_FETCH_RECEIVED']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_RECEIVED']);
        });
      }
      this.logger.error("Could not load CoCs: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
    });
  }

  updateCoC(coc, status) {
    let count = this.pendingCoCCount(coc.sentOriginal, this.cocReceived);
    console.log(count)
    if(count > 0){
      this.translate.get(['ERROR', 'ACC_REJECT_PENDING_COC', 'PENDING_COC']).subscribe(text => {
        this.presentAlert("Error", text['ACC_REJECT_PENDING_COC '] + count + text[' PENDING_COC']);
      });
      return;
    }
    this.passwordPromptResponseWait().then((password) => {
      this.presentLoading();
      this.blockchainService.validateTransactionPassword(password, this.mainAccount.sk, this.mainAccount.pk).then((decKey) => {
        if (status == 'accept') {
          coc.cocOriginal.AcceptXdr = this.blockchainService.signXdr(coc.cocOriginal.AcceptXdr, decKey);
          coc.cocOriginal.Status = 'accepted';
        } else if (status == 'reject') {
          coc.cocOriginal.RejectXdr = this.blockchainService.signXdr(coc.cocOriginal.RejectXdr, decKey);
          coc.cocOriginal.Status = 'rejected';
        }
        this.dataService.updateCoC(coc.cocOriginal).then((res) => {
          this.dissmissLoading();
          if (status == 'accept') {
            this.translate.get(['SUCCESS', 'SUCCESS_ACCEPTED', 'UPDATED_RESULTS_TRANSFER']).subscribe(text => {
              this.presentAlert(text['SUCCESS'], text['SUCCESS_ACCEPTED ']  + coc.assetCode + ". " + text['UPDATED_RESULTS_TRANSFER']);
            });
          } else if (status == 'reject') {
            this.translate.get(['SUCCESS', 'SUCCESS_REJECTED', 'ASSET_NOT_CHANGE']).subscribe(text => {
              this.presentAlert(text['SUCCESS'], text['SUCCESS_REJECTED ']  + coc.assetCode + ". " + text['ASSET_NOT_CHANGE']);
            });
          }
        }).catch((err) => {
          console.log(err.error.error_code)
          coc.cocOriginal.Status = 'pending';
          this.dissmissLoading();
          if (err.error.error_code == "tx_bad_seq"){
            this.translate.get(['ERROR', 'BC_BAD_SEQ', 'BC_COULD_NOT_PROCEED']).subscribe(text => {
              this.presentAlert(text['ERROR'], text['BC_BAD_SEQ'] + text['BC_COULD_NOT_PROCEED'] + "Please contact admin");
            });
          }else if (err.error.error_code == "tx_too_late"){
            this.translate.get(['ERROR', 'BC_TOO_LATE', 'BC_COULD_NOT_PROCEED']).subscribe(text => {
              this.presentAlert(text['ERROR'], text['BC_TOO_LATE'] + text['BC_COULD_NOT_PROCEED']);
            });
          }
          this.logger.error("Failed to update the CoC: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        });
      }).catch((err) => {
        this.dissmissLoading();
        this.translate.get(['ERROR', 'INVALID_PASSWORD']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['INVALID_PASSWORD']);
        });
        this.logger.error("Validating password failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    }).catch((err) => {
      this.translate.get(['ERROR', 'INVALID_PASSWORD']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['INVALID_PASSWORD']);
      });
      this.logger.error("Invalid password: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
    });
  }

  passwordPromptResponseWait() {
    return new Promise((resolve, reject) => {
      let passwordPrompt = this.alertCtrl.create({
        title: 'Transaction Password',
        inputs: [
          {
            name: "password",
            placeholder: "Password...",
            type: "password"
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              reject();
            }
          },
          {
            text: "Submit",
            handler: data => {
              if (data.password != "") {
                resolve(data.password);
              }
            }
          }
        ]
      });
      passwordPrompt.present();
    });
  }

  pendingCoCCount(date: Date, array: any) {
    let count = 0;
     for (var i = 0; i < array.length; i++) {
        if (array[i].sentOriginal.getTime() < date.getTime() && array[i].cocOriginal.Status == 'pending'){
          count++;
        }
     }
     return count;
  }

  // setFilteredItems() {
  //   this.Searcheditems = this.items.filter(item => {
  //     return item.oname.toLowerCase().includes(this.searchTerm.toLowerCase());
  //   });
  // }

  doRefresh(refresher) {
    this.getAllCoCs();
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

  presentAlert(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: 'OK'
    });
    alert.present();
  }

  // getNamesFromKeys(receiverArr) {
  //   return new Promise((resolve, reject) => {
  //     console.log("Receiver Arr before: ", receiverArr);
  //     var obj = {};
  //     for (var i = 0, len = receiverArr.length; i < len; i++) {
  //       obj[receiverArr[i]["Sender"]] = receiverArr[i];
  //     }

  //     console.log("Receiver Obj: ", obj);
  //     console.log("Receiver Arr: ", receiverArr);

  //     var receiverNames = new Array();

  //     for (var key in obj) {
  //       receiverNames.push(obj[key].Sender);
  //     }
  //     console.log("Receiver Keys: ", receiverNames);
  //     const param = {
  //       "account": {
  //         "accounts": receiverNames
  //       }
  //     }

  //     this.apiService.getNames(param).subscribe(
  //       resp => {
  //         //@ts-ignore
  //         console.log(resp.body.pk);
  //         //@ts-ignore
  //         resolve(resp.body.pk);
  //       },
  //       err => {
  //         if (this.isLoadingPresent) {
  //           this.dissmissLoading();
  //         }
  //         reject(err);
  //       }
  //     );

  //   });
  // }

  // loadCOCReceived() {
  //   this.itemsProvider.querycocbyReceiver(this.mainAccount.pk).subscribe(
  //     resp => {
  //       console.log("Resp: ", resp);
  //       if (resp != null) {
  //         this.Citems = resp;
  //         const Tempitems = [];

  //         this.getNamesFromKeys(this.Citems).then(namedKeys => {
  //           this.Citems.forEach(item => {
  //             const parsedTx = new Transaction(item.AcceptXdr);
  //             console.log("Transaction: ", parsedTx);
  //             // @ts-ignore
  //             const oldDate: number = new Date(
  //               parsedTx.timeBounds.minTime * 1000
  //             );
  //             // @ts-ignore
  //             const newDate: number = new Date(
  //               parsedTx.timeBounds.maxTime * 1000
  //             );

  //             // @ts-ignore
  //             let now: number = new Date();
  //             var hoursAgo = this.timeDuration(now, oldDate);
  //             var validTill = this.timeDuration(newDate, now);

  //             let itemArr = [];
  //             parsedTx.operations.forEach(transac => {
  //               if (transac.type == "payment") {
  //                 let assetObj = {
  //                   "source": transac.source,
  //                   "sourcename": this.mainAccount.accountName,
  //                   "asset": transac.asset.code,
  //                   "amount": transac.amount
  //                 };

  //                 itemArr.push(assetObj);
  //               }
  //             });

  //             const tempLast = itemArr.pop();

  //             if (itemArr.length > 0) {
  //               tempLast.source = itemArr[0].source
  //             } else {
  //               tempLast.source = null;
  //             }

  //             const obj = {
  //               AcceptTxn: item.AcceptTxn,
  //               AcceptXdr: item.AcceptXdr,
  //               RejectTxn: item.RejectTxn,
  //               RejectXdr: item.RejectXdr,
  //               date: hoursAgo,
  //               itemArr: itemArr,
  //               uname: tempLast.source,
  //               oname: tempLast.asset,
  //               qty: tempLast.amount,
  //               validity: newDate.toLocaleString(),
  //               time: validTill,
  //               status: item.Status,

  //               Identifier: item.Identifier,
  //               Receiver: item.Receiver,
  //               Sender: item.Sender,
  //               SequenceNo: item.SequenceNo,
  //               SubAccount: item.SubAccount,
  //               TxnHash: item.TxnHash
  //             };
  //             Tempitems.push(obj);
  //             this.items = Tempitems.reverse();
  //             this.setFilteredItems();
  //           });
  //           return namedKeys;
  //         }).then((namedKeys: any) => {
  //           console.log("Named Keys: ", namedKeys);
  //           this.items.forEach(element => {
  //             element.uname = namedKeys.find(o => element.uname === o.pk).accountName;
  //           });

  //           if (this.isLoadingPresent) {
  //             this.dissmissLoading();
  //           }
  //         }).catch(err => {
  //           if (this.isLoadingPresent) {
  //             this.dissmissLoading();
  //           }
  //         });
  //       } else {
  //         if (this.isLoadingPresent) {
  //           this.dissmissLoading();
  //         }
  //       }
  //     },
  //     err => {
  //       if (this.isLoadingPresent) {
  //         this.dissmissLoading();
  //       }
  //     }
  //   );
  // }

  // timeDuration(now, oldDate) {
  //   // @ts-ignore
  //   var sec_num = (now - oldDate) / 1000;
  //   var days = Math.floor(sec_num / (3600 * 24));
  //   var hours = Math.floor((sec_num - days * (3600 * 24)) / 3600);
  //   var minutes = Math.floor(
  //     (sec_num - days * (3600 * 24) - hours * 3600) / 60
  //   );
  //   // @ts-ignore
  //   if (hours < 10) {
  //     hours = 0 + hours;
  //   }
  //   // @ts-ignore
  //   if (minutes < 10) {
  //     minutes = 0 + minutes;
  //   }

  //   return {
  //     days: days,
  //     hours: hours,
  //     minutes: minutes
  //   };
  // }

  // passwordPrompt(item, buttonStatus) {
  //   let alert = this.alertCtrl.create({
  //     title: "Transaction Password",
  //     inputs: [
  //       {
  //         name: "password",
  //         placeholder: "Password...",
  //         type: "password"
  //       }
  //     ],
  //     buttons: [
  //       {
  //         text: "Submit",
  //         handler: data => {
  //           if (data.password != "") {
  //             this.sendSignedXDR(
  //               item,
  //               buttonStatus,
  //               this.decyrptSecret(this.mainAccount.sk, data.password)
  //             );
  //           }
  //         }
  //       }
  //     ]
  //   });
  //   alert.present();
  // }

  // signXDR(item, status, signerSK) {
  //   return new Promise((resolve, reject) => {
  //     var sourceKeypair = Keypair.fromSecret(signerSK);

  //     if (status == "accept") {
  //       item.status = "accepted";
  //       const parsedTx = new Transaction(item.AcceptXdr);
  //       parsedTx.sign(sourceKeypair);
  //       let x = parsedTx.toEnvelope().toXDR().toString("base64");
  //       item.AcceptXdr = x;
  //       resolve(item);
  //     } else {
  //       item.status = "rejected";
  //       const parsedTx = new Transaction(item.RejectXdr);
  //       parsedTx.sign(sourceKeypair);
  //       let x = parsedTx.toEnvelope().toXDR().toString("base64");
  //       item.RejectXdr = x;
  //       resolve(item);
  //     }
  //   }).catch((e) => {
  //     // reject(e)
  //   });
  // }

  // sendSignedXDR(item, status, signerSK) {
  //   this.presentLoading();
  //   this.signXDR(item, status, signerSK).then(obj => {
  //     this.itemsProvider.updateStatusCOC(obj).subscribe(resp => {
  //       // @ts-ignore
  //       if (resp.Body.Status == "accepted") {
  //         this.presentAlert("Success", "Successfully transferred the assets. You can check available assets in Transfer page.");
  //         // @ts-ignore
  //       } else if (resp.Body.Status == "rejected") {
  //         this.presentAlert("Error", "Asset could not be accepted due to an error. Please try again or contact an admin.");
  //       }
  //       if (this.isLoadingPresent) {
  //         this.dissmissLoading();
  //       }
  //     }, err => {
  //       item.status = "pending";
  //       if (this.isLoadingPresent) {
  //         this.dissmissLoading();
  //       }
  //       this.presentAlert("Error", "Asset could not be accepted due to an error. Please try again or contact an admin.");
  //     });
  //   }).catch(e => {
  //     if (this.isLoadingPresent) {
  //       this.dissmissLoading();
  //       this.presentAlert("Error", "Asset could not be accepted due to an error. Please try again or contact an admin.");
  //     }
  //   });
  // }
}
