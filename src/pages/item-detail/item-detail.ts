import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Network, Operation, Server, TransactionBuilder, Asset, Keypair } from 'stellar-sdk';
import { AES, enc } from "crypto-js";

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
  COCForm: { selectedItem: string, qty: string, receiver: string, vaidity: Date, } = {
    selectedItem: '',
    qty: '',
    receiver: '',
    vaidity: new Date()
  };
  constructor(public navCtrl: NavController, private toastCtrl: ToastController,
    private loadingCtrl: LoadingController, navParams: NavParams, public itemsProvider: Items, private alertCtrl: AlertController) {

    this.user = JSON.parse(localStorage.getItem('_user'))

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
              this.doCOC(this.decyrptSecret(this.user.PrivateKey, data.password));
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
        return ml.available == false && receiver == ml.receiver
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

      this.COCVerification(signerSK).then((proofObj) => {
        this.subAccountValidator(this.COCForm.receiver).then((subAccObj) => {
          //@ts-ignore
          this.AcceptBuild('PreviousTXNID', 'Identifier', proofObj, subAccObj.subAcc, signerSK).then((resolveObj) => {
            this.RejectBuild(signerSK).then((RejectXdr) => {
              const obj = {
                "Sender": this.user.PublicKey,
                "Receiver": this.COCForm.receiver,
                //@ts-ignore
                "SubAccount": subAccObj.subAcc,
                //@ts-ignore
                "SeqNum": resolveObj.seqNum,
                //@ts-ignore
                "AcceptXdr": resolveObj.b64,
                "RejectXdr": RejectXdr,
                "Identifier": "Identifier1002030",
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
                  this.presentToast('Error! transaction unsuccesfull.');
                }
              })
          }).catch(e => {
            console.log(e)
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Error! transaction unsuccesfull.');
            }
          })
        }).catch(e => {
          console.log(e)
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Error! transaction unsuccesfull.');
          }
        })
      }).catch(e => {
        console.log(e)
        if (this.isLoadingPresent) {
          this.dissmissLoading();
          this.presentToast('Error! Processing COC Verification transaction failed.');
        }
      })
    } catch (error) {
      console.log(error);
      if (this.isLoadingPresent) {
        this.dissmissLoading();
        this.presentToast('Error! transaction unsuccesfull.');
      }
    }

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
        const senderPublickKey = this.user.PublicKey;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);

        var asset = new Asset(item, 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
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

  RejectBuild(signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        const receiver = this.COCForm.receiver;
        const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.user.PublicKey;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        console.log(maxTime)

        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);

        // var asset = new Asset(item, 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime }, bumpSequence: { bumpTo: '2284484514807850' } };
        Network.useTestNetwork();
        var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(receiver)
          .then(function (account) {
            var transaction = new TransactionBuilder(account, opts)
              .addOperation(Operation.manageData({
                name: 'acceptance', value: 'rejected', source: senderPublickKey
              }))
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

  async COCVerification(signerSK) {
    try {
      return new Promise((resolve, reject) => {
        var sourceKeypair = Keypair.fromSecret(signerSK);
        var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(sourceKeypair.publicKey())
          .then(function (account) {
            var transaction = new TransactionBuilder(account)
              .addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', }))
              .addOperation(Operation.manageData({ name: 'PreviousTXNID', value: "PreviousTXNID", }))
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
          });
      });
    }
    catch (err_1) {
      console.log(err_1);
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
