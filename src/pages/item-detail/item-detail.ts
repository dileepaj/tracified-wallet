import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Network, Operation, Server, TransactionBuilder, Asset, Keypair } from 'stellar-sdk';
import { AES, enc } from "crypto-js";
import { get } from 'request';
import { Api } from '../../providers';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
var server = new Server('https://horizon-testnet.stellar.org');

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  user: any;
  currentItems: any;
  receivers = [];
  loading;
  isLoadingPresent: boolean;
  // selectedItem: string;
  selectedReceiver: any;
  COCForm: { selectedItem: string, identifier: string, qty: string, receiver: string, vaidity: Date, } = {
    selectedItem: '',
    identifier: '',
    qty: '',
    receiver: '',
    vaidity: new Date()
  };
  BCAccounts: any;
  constructor(public navCtrl: NavController, private toastCtrl: ToastController,
    private api: Api, private connectivity: ConnectivityServiceProvider,
    private loadingCtrl: LoadingController, navParams: NavParams, public itemsProvider: Items, private alertCtrl: AlertController) {

    this.user = JSON.parse(localStorage.getItem('_user'))
    this.BCAccounts = JSON.parse(localStorage.getItem('_BCAccounts'))


    this.item = navParams.get('item');
    this.currentItems = navParams.get('currentItems') || this.currentItems.defaultItem;
    this.receivers = navParams.get('receivers');
    this.subAccountStatus();

  }

  ionViewDidLoad() {
    this.COCForm.selectedItem = this.item.asset_code;
    if (this.receivers[0]) {
      this.selectedReceiver = this.receivers[0].Receivers;
    }
  }

  passwordPrompt() {
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
              this.doCOC(this.decyrptSecret(this.BCAccounts[1].sk, data.password));
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

  subAccountValidator(receiver) {
    return new Promise((resolve, reject) => {
      var subAccounts = JSON.parse(localStorage.getItem('_subAccounts'));
      console.log(subAccounts)

      var availableArr = subAccounts.filter(function (al) {
        return al.available == true
      })
      console.log("availableArr");
      console.log(availableArr);
      var matchingArr = subAccounts.filter(function (ml) {
        return ml.available == false && ml.receiver == receiver
      })
      console.log("matchingArr");
      console.log(matchingArr.length);

      if (availableArr.length > 0) {
        console.log("found available")
        // availableArr[0].available = false
        resolve(availableArr[0]);
      } else if (availableArr.length == 0 && matchingArr.length >= 1) {
        console.log("seq No ++")
        // matchingArr[0].available = false
        resolve(matchingArr[0]);
      } else {
        this.createAddress().then((pair) => {

          this.multisignSubAccount(pair, this.BCAccounts[1].pk).then((pair) => {
            this.addSubAccount(pair).then(() => {
              console.log("create new subAcc")
              //@ts-ignore
              resolve({ subAccount: pair.publicKey(), sequenceNo: 0 });
            }).catch(e => {
              console.log(e)
              if (this.isLoadingPresent) {
                this.dissmissLoading();
                this.presentToast('Error! COCVerification unsuccesfull.');
              }
            })
          }).catch(e => {
            console.log(e)
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Error! COCVerification unsuccesfull.');
            }
          })
        }).catch(e => {
          console.log(e)
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Error! COCVerification unsuccesfull.');
          }
        })
      }
    })
  }

  doCOC(signerSK) {
    this.presentLoading();
    console.log(this.COCForm);
    try {
      this.getPreviousTXNID(this.COCForm.identifier).then((PreviousTXNID) => {
        this.COCVerification(PreviousTXNID, signerSK).then((proofObj) => {
          this.subAccountValidator(this.COCForm.receiver).then((subAcc) => {
            console.log(subAcc);
            //@ts-ignore
            this.AcceptBuild(PreviousTXNID, this.COCForm.identifier, proofObj, subAcc.subAccount, subAcc.sequenceNo, signerSK).then((resolveObj) => {
              //@ts-ignore
              this.RejectBuild(proofObj, subAcc.subAccount, subAcc.sequenceNo, signerSK).then((RejectXdr) => {
                const obj = {
                  "Sender": this.BCAccounts[1].pk,
                  "Receiver": this.COCForm.receiver,
                  //@ts-ignore
                  "SubAccount": subAcc.subAccount,
                  //@ts-ignore
                  "SeqNum": resolveObj.seqNum,
                  //@ts-ignore
                  "AcceptXdr": resolveObj.b64,
                  "RejectXdr": RejectXdr,
                  "Identifier": this.COCForm.identifier,
                  "Status": "pending"
                }
                console.log(obj)
                this.itemsProvider.addCOC(obj).subscribe((resp) => {
                  // this.navCtrl.push(MainPage);
                  console.log(resp)
                  // @ts-ignore
                  if (resp.Message == "Success" && this.isLoadingPresent) {
                    this.dissmissLoading();
                    this.presentToast(this.item.asset_code + ' transfered succesfully.');
                    //set local storage???
                  } else {
                    if (this.isLoadingPresent) {
                      this.dissmissLoading();
                      this.presentToast('Error! transaction unsuccesfull.');
                    }
                  }
                }, (err) => {
                  console.log(err);
                  if (this.isLoadingPresent) {
                    this.dissmissLoading();
                    this.presentToast('Error! transaction unsuccesfull.');
                  }
                });
              })
                .catch(e => {
                  console.log(e)
                  if (this.isLoadingPresent) {
                    this.dissmissLoading();
                    this.presentToast('Error! Processing RejectBuild unsuccesfull.');
                  }
                })
            }).catch(e => {
              console.log(e)
              if (this.isLoadingPresent) {
                this.dissmissLoading();
                this.presentToast('Error! Processing AcceptBuild unsuccesfull.');
              }
            })
          }).catch(e => {
            console.log(e)
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Error! subAccountValidator unsuccesfull.');
            }
          })
        }).catch(e => {
          console.log(e)
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Error! COCVerification unsuccesfull.');
          }
        })
      }).catch(e => {
        console.log(e)
        if (this.isLoadingPresent) {
          this.dissmissLoading();
          this.presentToast('Error! Processing getPreviousTXNID failed.');
        }
      })
    } catch (error) {
      console.log(error);
      if (this.isLoadingPresent) {
        this.dissmissLoading();
        this.presentToast('Error! COC transaction unsuccesfull.');
      }
    }

  }

  subAccountStatus() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      // console.log(this.BCAccounts[1].subAccounts)
      const subAccount = {
        "User": "UserNameNotVaildatingNow",
        "SubAccounts": this.BCAccounts[1].subAccounts
      };

      this.api.subAccountStatus(subAccount).then((res) => {
        console.log(res.body);
        this.dissmissLoading();
        if (res.status === 200) {
          localStorage.setItem('_subAccounts', JSON.stringify(res.body))

        } else {
          this.userError('authenticationFailed', 'authenticationFailedDescription');
        }
      })
        .catch((error) => {
          this.dissmissLoading();
          this.userError('authenticationFailed', 'authenticationFailedDescription');
          console.log(error);
        });
    } else {
      this.presentToast('noInternet');
    }
  }

  multisignSubAccount(subAccount, mainAccount) {
    return new Promise((resolve, reject) => {
      server
        .loadAccount(subAccount.publicKey())
        .then(function (account) {
          var transaction = new TransactionBuilder(account)
            .addOperation(Operation.setOptions({
              signer: {
                ed25519PublicKey: mainAccount,
                weight: 2
              }
            }))
            .addOperation(Operation.setOptions({
              masterWeight: 0, // set master key weight
              lowThreshold: 2,
              medThreshold: 2, // a payment is medium threshold
              highThreshold: 2 // make sure to have enough weight to add up to the high threshold!
            }))
            .build();

          transaction.sign(subAccount); // sign the transaction
          console.log(transaction);


          return server.submitTransaction(transaction);
        })
        .then(function (transactionResult) {
          console.log(transactionResult);
          resolve()
        })
        .catch(function (err) {
          console.error(err);
          reject()
        });
    })
  }

  AcceptBuild(PreviousTXNID, Identifier, proofHash, subAcc, sequenceNo, signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        let seqNum;
        const receiver = this.COCForm.receiver;
        const quantity = this.COCForm.qty;
        const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.BCAccounts[1].pk;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);

        var asset = new Asset(item, 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');
        var opts;
        if (sequenceNo != 0) {
          opts = { timebounds: { minTime: minTime, maxTime: maxTime }, bumpSequence: { bumpTo: sequenceNo } };
        } else {
          opts = { timebounds: { minTime: minTime, maxTime: maxTime } };
        }
        Network.useTestNetwork();
        var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(subAcc)
          .then(function (account) {
            var transaction = new TransactionBuilder(account, opts)
              .addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', }))
              .addOperation(Operation.manageData({ name: 'PreviousTXNID', value: PreviousTXNID, }))
              .addOperation(Operation.manageData({ name: 'Identifier', value: Identifier, }))
              .addOperation(Operation.manageData({ name: 'proofHash', value: proofHash, source: receiver }))
              .addOperation(Operation.payment({
                destination: receiver,
                asset: asset,
                amount: quantity,
                source: senderPublickKey
              }))
              .build();
            transaction.sign(sourceKeypair);

            // Let's see the XDR (encoded in base64) of the transaction we just built
            // console.log("envelope =>  "+transaction.toEnvelope());
            XDR = transaction.toEnvelope();
            seqNum = transaction.sequence;
            b64 = XDR.toXDR('base64');
            console.log('XDR in base64 =>  ' + JSON.stringify(b64));
            const resolveObj = {
              seqNum: seqNum,
              b64: b64
            }
            resolve(resolveObj);

          })
          .catch(function (e) {
            console.log(e);
            // reject(e)

          });

      } catch (error) {
        console.log(error)
      }
    })

  }

  RejectBuild(proofHash, subAcc, sequenceNo, signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        const receiver = subAcc;
        // const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.BCAccounts[1].pk;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        console.log(maxTime)

        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);
        var opts;
        if (sequenceNo != 0) {
          opts = { timebounds: { minTime: minTime, maxTime: maxTime }, bumpSequence: { bumpTo: sequenceNo } };

        } else {
          opts = { timebounds: { minTime: minTime, maxTime: maxTime } };
        }
        Network.useTestNetwork();
        var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(receiver)
          .then(function (account) {
            var transaction = new TransactionBuilder(account, opts)
              .addOperation(Operation.manageData({
                name: 'Status', value: 'rejected', source: senderPublickKey
              }))
              .addOperation(Operation.manageData({ name: 'proofHash', value: proofHash }))

              .build();
            transaction.sign(sourceKeypair);

            // Let's see the XDR (encoded in base64) of the transaction we just built
            // console.log("envelope =>  "+transaction.toEnvelope());
            XDR = transaction.toEnvelope();
            b64 = XDR.toXDR('base64');
            console.log('XDR in base64 =>  ' + JSON.stringify(b64));

            resolve(b64);
          })
          .catch(function (e) {
            // reject(e)
            console.log(e);
          });
      } catch (error) {
        console.log(error)
      }
      // return b64;
    })
  }

  COCVerification(PreviousTXNID, signerSK) {
    try {
      return new Promise((resolve, reject) => {
        console.log(PreviousTXNID)
        var sourceKeypair = Keypair.fromSecret(signerSK);
        var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(sourceKeypair.publicKey())
          .then(function (account) {
            var transaction = new TransactionBuilder(account)
              .addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', }))
              .addOperation(Operation.manageData({ name: 'PreviousTXNID', value: PreviousTXNID, }))
              .addOperation(Operation.manageData({ name: 'Identifier', value: "proof", }))
              .build();
            // sign the transaction
            transaction.sign(sourceKeypair);
            return server.submitTransaction(transaction);
          })
          .then(function (transactionResult) {
            // console.log(transactionResult.hash);
            resolve(transactionResult.hash);
          })
          .catch(function (err) {
            console.log(err);
            reject();
          });
      });
    }
    catch (err_1) {
      console.log(err_1);
    }
  }

  getPreviousTXNID(Identifier) {
    if (this.connectivity.onDevice) {
      return new Promise((resolve, reject) => {
        // this.presentLoading();

        //SHA256 the Identifier JSON

        this.api.getPreviousTXNID(Identifier).then((res) => {
          console.log(res.body)
          // this.dissmissLoading();
          if (res.status === 200) {
            resolve(res.body.LastTxn);
          } else if (res.status === 400) {
            this.userError('getPreviousTXNID', 'Identifier mapping not found!');
            reject();
          } else {
            this.dissmissLoading();
            this.userError('authenticationFailed', 'authenticationFailedDescription');
            reject();
          }
        })
          .catch((error) => {
            this.dissmissLoading();
            this.userError('authenticationFailed', 'authenticationFailedDescription');
            console.log(error);
            reject();
          });
      })
    } else {
      this.presentToast('noInternet');
    }
  }

  createAddress() {
    try {
      return new Promise((resolve, reject) => {
        var pair = Keypair.random();
        pair.secret();
        console.log(pair.publicKey())
        pair.publicKey();
        console.log(pair.secret())

        get({
          url: 'https://friendbot.stellar.org',
          qs: { addr: pair.publicKey() },
          json: true
        }, function (error, response, body) {
          if (error || response.statusCode !== 200) {
            console.error('ERROR!', error || body);
            reject(error);
          }
          else {
            console.log('SUCCESS! You have a new account :)\n', body);

            resolve(pair);

          }
        });
      })
    } catch (error) {
      console.log(error);

    }

  }

  addSubAccount(subAcc) {

    if (this.connectivity.onDevice) {
      this.presentLoading();
      return new Promise((resolve, reject) => {
        const account = {
          "account": {
            "subKey": subAcc,
            "pk": this.BCAccounts[1].pk
          }
        };

        this.api.addSubAccount(account).then((res) => {
          console.log(res.body);
          this.dissmissLoading();
          if (res.status === 200) {
            this.presentToast('sub Account successfully added');
            resolve();
          } else if (res.status === 406) {
            this.userError('Keys update failed', 'Main account not found or Sub account names or public key alredy exist');
          } else {
            this.userError('authenticationFailed', 'authenticationFailedDescription');
          }
        })
          .catch((error) => {
            this.dissmissLoading();
            this.userError('authenticationFailed', 'authenticationFailedDescription');
            console.log(error);
          });
      })
    } else {
      this.presentToast('noInternet');
    }
  }

  decyrptSecret(ciphertext, signer) {
    // Decrypt
    var decrypted = (AES.decrypt(ciphertext.toString(), signer)).toString(enc.Utf8);

    console.log("signer => " + signer);
    console.log("ciphertext => " + ciphertext);
    console.log("plaintext => " + decrypted);

    return decrypted;
  }

  userError(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: 'OK'
    });
    alert.present();
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
