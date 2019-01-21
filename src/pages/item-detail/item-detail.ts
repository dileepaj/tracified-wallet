import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Network, Operation, Server, TransactionBuilder, Asset, Keypair } from 'stellar-sdk';
import { AES, enc } from "crypto-js";
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

    console.log(this.COCForm.selectedItem)
    console.log(this.item)
    console.log(this.currentItems)
    console.log(this.receivers)
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
      var subAccounts = [
        {
          receiver: "GD4PIV4DVVKMJRJLERGTTNTKNG6Z67V7JFHYCJNWXMPR2DSQ5FDI2QCT",
          subAcc: "GDAFIFK6GFJBCBMYJNC5PVMC6AGTN4EDU34DOUBLK4S3YQAOLBLPWUH6",
          seqNum: 6546484621,
          available: true
        },
        {
          receiver: "GCKUXI3JRJANYOF3AM35Z22FGUGYYUIEBPE5TTZ7P3G6XAEFGYZC2POM",
          subAcc: "GBPBSQWA4WNTCVD3VULEUIT3QDTIOFVSFVU6BRK6AQFQURQBBNPK27PS",
          seqNum: 0,
          available: true
        },
        {
          receiver: "GCKUXI3JRJANYOF3AM35Z22FGUGYYUIEBPE5TTZ7P3G6XAEFGYZC2POM",
          subAcc: "GCNFOGGQ32EHZSL33JVH55GOTVXIGP5SALMQ26MERTLUTTJRFXYBI7NC",
          seqNum: 0,
          available: true
        },
        {
          receiver: "GD4PIV4DVVKMJRJLERGTTNTKNG6Z67V7JFHYCJNWXMPR2DSQ5FDI2QCT",
          subAcc: "GCNFOGGQ32EHZSL33JVH55GOTVXIGP5SALMQ26MERTLUTTJRFXYBI7NC",
          seqNum: 0,
          available: true
        },
        {
          receiver: "GD4PIV4DVVKMJRJLERGTTNTKNG6Z67V7JFHYCJNWXMPR2DSQ5FDI2QCT",
          subAcc: "GCNFOGGQ32EHZSL33JVH55GOTVXIGP5SALMQ26MERTLUTTJRFXYBI7NC",
          seqNum: 0,
          available: true
        }
      ]

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
        availableArr[0].available = false
        resolve(availableArr[0]);
      } else if (availableArr.length == 0 && matchingArr.length >= 1) {
        console.log("seq No ++")
        matchingArr[0].available = false
        resolve(matchingArr[0]);
      } else {
        console.log("create new subAcc")
        resolve({
          subAcc: "GC4FNHE5ULNGHUWE3CQEZ43P6NYTO7CI4QT4KTRDI6AARWXKN7IT5E4J"
        });
      }
    })
  }

  doCOC(signerSK) {
    this.presentLoading();
    console.log(this.COCForm);
    try {
      this.getPreviousTXNID(this.COCForm.identifier).then((PreviousTXNID) => {
        this.COCVerification(PreviousTXNID, signerSK).then((proofObj) => {
          //@ts-ignore
          this.AcceptBuild(PreviousTXNID, this.COCForm.identifier, proofObj, this.COCForm.receiver, signerSK).then((resolveObj) => {
            this.RejectBuild(proofObj, signerSK).then((RejectXdr) => {
              const obj = {
                "Sender": this.BCAccounts[1].pk,
                "Receiver": this.COCForm.receiver,
                //@ts-ignore
                "SubAccount": this.COCForm.receiver,
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

  createMultipleTrustline(pair) {
    try {
      return new Promise((resolve, reject) => {
        var receivingKeys = pair;
        server.loadAccount(receivingKeys.publicKey())
          .then(function (account) {
            const txBuilder = new TransactionBuilder(account)

            // Create an object to represent the new asset
            var Aple = new Asset('Apple', 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');
            var Mango = new Asset('Mango', 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');
            var Banana = new Asset('Banana', 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');
            var Grapes = new Asset('Grapes', 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');

            // var assetArr = [Grap, Orng, Bana, Aple, Carr];
            var assetArr = [Aple, Mango, Banana, Grapes];
            assetArr.forEach(element => {
              // add operation
              txBuilder.addOperation(Operation.changeTrust({
                asset: element,
                limit: '10'
              }))

              const tx = txBuilder.build();
              tx.sign(receivingKeys);
              let XDR;
              // console.log(tx);
              console.log("XDR............");
              console.log(tx.toEnvelope().toXDR('base64'));

              server.submitTransaction(tx)
                .then(function (transactionResult) {
                  console.log(transactionResult);
                }).catch(function (err) {
                  console.log(err);
                })
            })
            resolve();
          })
      })
    } catch (error) {
      console.log(error);

    }

  }

  multisignSubAccount(subAccount, mainAccount) {
    return new Promise((resolve, reject) => {
      var secondaryAddress = "GA3RFKVJ5KAY7H7JHN6WK2XEMQDRE54KONEW5HF6JG3MIGN4UTIIOSIC";

      server
        .loadAccount('GBPBSQWA4WNTCVD3VULEUIT3QDTIOFVSFVU6BRK6AQFQURQBBNPK27PS')
        .then(function (account) {
          var transaction = new TransactionBuilder(account)
            .addOperation(Operation.setOptions({
              signer: {
                ed25519PublicKey: secondaryAddress,
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

          transaction.sign(Keypair.fromSecret('SAFWINRZUI7KIOZ3UICQNXPNVSWDGACLUVXGZNGFWKDPSPRIJHNNYLP4')); // sign the transaction
          console.log(transaction);


          return server.submitTransaction(transaction);
        })
        .then(function (transactionResult) {
          console.log(transactionResult);
        })
        .catch(function (err) {
          console.error(err);
        });
    })
  }

  AcceptBuild(PreviousTXNID, Identifier, proofHash, subAcc, signerSK) {

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
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };
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

  RejectBuild(proofHash, signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        const receiver = this.COCForm.receiver;
        // const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.BCAccounts[1].pk;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        console.log(maxTime)

        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);

        // var asset = new Asset(item, 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
        // var opts = { timebounds: { minTime: minTime, maxTime: maxTime }, bumpSequence: { bumpTo: '2284484514807850' } };
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };
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
