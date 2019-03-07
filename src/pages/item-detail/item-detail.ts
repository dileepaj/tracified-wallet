import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Items } from '../../providers/items/items';
import { Network, Operation, Server, TransactionBuilder, Asset, Keypair } from 'stellar-sdk';
import { AES, enc } from "crypto-js";
import { get } from 'request';
import { Api } from '../../providers';
var StellarSdk = require('stellar-sdk')
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
var server = new Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

@IonicPage()

@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  selectedItem2: any;
  itemRequired: any;
  itemList: any = [];
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

    this.itemList = this.receivers

  }

  ionViewDidLoad() {
    this.COCForm.selectedItem = this.item.asset_code;
    if (this.receivers[0]) {
      this.selectedReceiver = this.receivers[0];
    }
  }

  /**
* @desc opens modal to enter decrpting passphrase  
* @param 
* @author Jaje thananjaje3@gmail.com
* @return 
*/
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
              this.doCOC(this.decyrptSecret(this.BCAccounts[0].sk, data.password));
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

  /**
* @desc validates and provides available sub account to build the XDR (if nothing is available it will create one)
* @param string $receiver
* @author Jaje thananjaje3@gmail.com
* @return object which contains available sub account public key 
*/
  subAccountValidator(receiver) {
    return new Promise((resolve, reject) => {

      this.subAccountStatus().then((subAccounts: any) => {
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

            this.multisignSubAccount(pair, this.BCAccounts[0].pk).then(() => {
              this.addSubAccount(pair).then(() => {
                console.log("create new subAcc")
                //@ts-ignore
                resolve({ subAccount: pair.publicKey(), sequenceNo: 0 });
              }).catch(e => {
                console.log(e)
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                  this.presentToast('Error! addSubAccount failed.');
                }
              })
            }).catch(e => {
              console.log(e)
              if (this.isLoadingPresent) {
                this.dissmissLoading();
                this.presentToast('Error! multisignSubAccount unsuccesfull.');
              }
            })
          }).catch(e => {
            console.log(e)
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Error! createAddress unsuccesfull.');
            }
          })
        }
      })
        .catch(e => {
          console.log(e)
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Error! subAccountStatus unsuccesfull.');
          }
        })
    })
  }

  /**
* @desc handler function manages other async function to do COC  
* @param string $signerSK - the public key of main account
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  doCOC(signerSK) {
    this.presentLoading();
    console.log(this.COCForm);

    // Parallel
    Promise.all([this.subAccountValidator(this.COCForm.receiver), this.COCVerification(signerSK), this.getPreviousTXNID(this.COCForm.identifier)])
      .then((res2) => {
        // console.log(res2);
        //@ts-ignore
        Promise.all([this.AcceptBuild(this.COCForm.identifier, res2[1], res2[0].subAccount, res2[0], signerSK), this.RejectBuild(res2[1], res2[0].subAccount, res2[0], signerSK)])
          .then((res3) => {
            // console.log(res3);
            // console.log(res2);

            return res3;
          })
          .then((res4) => {

            this.addCOC(res2, res4)
              .catch((err) => {
                console.log(err)
              });

            // console.log(res4);
            // console.log(res2);

            console.log('done');
          })
          .catch((err) => {
            console.log(err); // something bad happened
          });
      })
      .catch((err) => {
        console.log(err); // something bad happened
      });

  }

  /**
* @desc send the COC object to gateway  
* @param object $res2 - previous Txn ID
* @param object $res4 - accept build and reject build XDRs
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  addCOC(res2, res4) {
    if (this.connectivity.onDevice) {
      // this.presentLoading();
      return new Promise((resolve, reject) => {
        const obj = {
          "Sender": this.BCAccounts[0].pk,
          "Receiver": this.COCForm.receiver,
          //@ts-ignore
          "SubAccount": res2[0].subAccount,
          //@ts-ignore
          "SequenceNo": Number(res4[0].seqNum + 2),
          // (subAcc) ? : ;
          //@ts-ignore
          "AcceptXdr": res4[0].b64,
          "RejectXdr": res4[1],
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
            resolve();
            this.presentToast(this.item.asset_code + ' transfered succesfully.');
            //set local storage???
          } else {
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Error! transaction unsuccesfull.');
            }
            reject();
          }
        }, (err) => {
          console.log(err);
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Error! transaction unsuccesfull.');
          }
          reject();
        });
      })

    } else {
      this.presentToast('noInternet');
    }
  }

  /**
* @desc retrieving sub acoount status from gateway  
* @param object $subAccount - the public and secret key pair of sub account
* @param string $mainAccount - the public key of main account
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  subAccountStatus() {
    if (this.connectivity.onDevice) {
      // this.presentLoading();
      return new Promise((resolve, reject) => {
        const subAccount = {
          "User": "UserNameNotVaildatingNow",
          "SubAccounts": this.BCAccounts[0].subAccounts
        };
        console.log(subAccount)
        this.api.subAccountStatus(subAccount).then((res) => {
          console.log(res.body);
          // this.dissmissLoading();
          if (res.status === 200) {
            // localStorage.setItem('_subAccounts', JSON.stringify(res.body))
            resolve(res.body)
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

  /**
* @desc making sub account signable by main account (multi-signature transaction)  
* @param object $subAccount - the public and secret key pair of sub account
* @param string $mainAccount - the public key of main account
* @author Jaje thananjaje3@gmail.com
* @return 
*/
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
          // console.log(transaction);


          return server.submitTransaction(transaction);
        })
        .then(function (transactionResult) {
          console.log(transactionResult.hash);
          resolve()
        })
        .catch(function (err) {
          console.error(err);
          reject()
        });
    })
  }

  /**
* @desc Building acceptance XDR  
* @param string $Identifier 
* @param string $proofHash 
* @param string $subAcc - sub account public key need to build the XDR
* @param object $subAccObj 
* @param object $signerSK - the public and secret key pair of main account
* @author Jaje thananjaje3@gmail.com
* @return sequence number and acceptance XDR
*/
  AcceptBuild(Identifier, proofHash, subAcc, subAccObj, signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        let seqNum;
        const receiver = this.COCForm.receiver;
        const quantity = this.COCForm.qty;
        const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.BCAccounts[0].pk;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);

        console.log(subAccObj);

        // var asset = new Asset(item, 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');
        var asset = new Asset(item, 'GA4DLKMMKKIWBAMR4EXHZ3I55PGHSC5OKAWUACM4Y7WWMONRYX72WN5L');
        // var asset2 = new Asset('Apple', 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');
        // var asset3 = new Asset('Grapes', 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');
        // var asset4 = new Asset('Mango', 'GC6TIYXKJOAIDHPUZNJXEEZKBG6GCIA6XT3EW2YZCL2PQ3LHUI6OGRM7');
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };

        // Network.useTestNetwork();
        // var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(subAcc)
          .then(function (account) {
            var transaction = new TransactionBuilder(account, opts)
            transaction.addOperation(Operation.manageData({ name: 'Transaction Type', value: '10', }))
            transaction.addOperation(Operation.manageData({ name: 'Identifier', value: Identifier, }))
            transaction.addOperation(Operation.manageData({ name: 'proofHash', value: proofHash, source: receiver }))
            transaction.addOperation(Operation.payment({
              destination: receiver,
              asset: asset,
              amount: quantity,
              source: senderPublickKey
            }))
            // transaction.addOperation(Operation.payment({
            //   destination: receiver,
            //   asset: asset2,
            //   amount: '50',
            //   source: senderPublickKey
            // }))
            // transaction.addOperation(Operation.payment({
            //   destination: receiver,
            //   asset: asset3,
            //   amount: '70',
            //   source: senderPublickKey
            // }))
            // transaction.addOperation(Operation.payment({
            //   destination: senderPublickKey,
            //   asset: asset4,
            //   amount: '100',
            //   source: receiver
            // }))

            if (!subAccObj.available) {
              transaction.addOperation(Operation.bumpSequence({ bumpTo: JSON.stringify(subAccObj.sequenceNo + 2) }))
            }

            const tx = transaction.build();
            tx.sign(sourceKeypair);

            // Let's see the XDR (encoded in base64) of the transaction we just built
            // console.log("envelope =>  "+transaction.toEnvelope());
            XDR = tx.toEnvelope();
            seqNum = tx.sequence;
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

  /**
* @desc Building rejectance XDR  
* @param string $proofHash 
* @param string $subAcc - sub account public key need to build the XDR
* @param object $subAccObj 
* @param object $signerSK - the public and secret key pair of main account
* @author Jaje thananjaje3@gmail.com
* @return sequence number and rejectance XDR
*/
  RejectBuild(proofHash, subAcc, subAccObj, signerSK) {

    return new Promise((resolve, reject) => {
      try {
        let XDR;
        let b64;
        const receiver = this.COCForm.receiver;
        // const item = this.COCForm.selectedItem;
        const time = new Date(this.COCForm.vaidity);
        const senderPublickKey = this.BCAccounts[0].pk;

        var minTime = Math.round(new Date().getTime() / 1000.0);
        // var myDate = new Date("July 1, 1978 02:30:00"); // Your timezone!
        var maxTime = time.getTime() / 1000.0;
        console.log(maxTime)
        // console.log(sequenceNo + 1);

        // var maxTime = 1542860820;
        var sourceKeypair = Keypair.fromSecret(signerSK);
        var opts = { timebounds: { minTime: minTime, maxTime: maxTime } };

        // StellarSdk.Network.useTestNetwork();
        // var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(subAcc)
          // var source = new StellarSdk.Account(receiver, "46316927324160");
          .then(function (account) {
            var transaction = new TransactionBuilder(account, opts)
              .addOperation(Operation.manageData({
                name: 'Status', value: 'rejected', source: receiver
              }))
              .addOperation(Operation.manageData({ name: 'proofHash', value: proofHash }))

            if (!subAccObj.available) {
              transaction.addOperation(Operation.bumpSequence({ bumpTo: JSON.stringify(subAccObj.sequenceNo + 2) }))
            }

            const tx = transaction.build();
            tx.sign(sourceKeypair);

            // Let's see the XDR (encoded in base64) of the transaction we just built
            // console.log("envelope =>  "+transaction.toEnvelope());
            XDR = tx.toEnvelope();
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
    })

  }

  /**
* @desc making a blockchain transaction to prove COC has been made
* @param object $signerSK - the public and secret key pair of main account
* @author Jaje thananjaje3@gmail.com
* @return Txn hash to be added in COCAcceptBuild & COC RejectBiuld
*/
  COCVerification(signerSK) {
    // console.log(this.COCForm);
    const form = this.COCForm

    try {
      return new Promise((resolve, reject) => {

        var sourceKeypair = Keypair.fromSecret(signerSK);
        var server = new Server('https://horizon-testnet.stellar.org');
        server.loadAccount(sourceKeypair.publicKey())
          .then(function (account) {
            var transaction = new TransactionBuilder(account)
              .addOperation(Operation.manageData({ name: 'Transaction Type', value: '11', }))
              .addOperation(Operation.manageData({ name: 'Identifier', value: form.identifier, }))
              .addOperation(Operation.manageData({ name: 'Receiver', value: form.receiver, }))
              .addOperation(Operation.manageData({ name: 'Asset', value: form.selectedItem, }))
              .addOperation(Operation.manageData({ name: 'Amount', value: form.qty, }))
              .addOperation(Operation.manageData({ name: 'MaxBound', value: JSON.stringify(form.vaidity), }))
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

  /**
* @desc retrieve previous transaction ID from gateway   
* @param string $Identifier 
* @author Jaje thananjaje3@gmail.com
* @return 
*/
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

  /**
* @desc communicate with stellar horizon to create and fund address.  
* @param 
* @author Jaje thananjaje3@gmail.com
* @return object key pair
*/
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
            console.log('SUCCESS! You have a new account :)\n', body.hash);

            resolve(pair);

          }
        });
      })
    } catch (error) {
      console.log(error);

    }

  }

  /**
* @desc add sub account public key to admin
* @param string $subAcc - the subAcc will be mapped with main account
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  addSubAccount(subAcc) {

    if (this.connectivity.onDevice) {
      // this.presentLoading();
      return new Promise((resolve, reject) => {
        console.log(subAcc);
        const account = {
          "account": {
            "subKey": subAcc.publicKey(),
            "pk": this.BCAccounts[0].pk
          }
        };

        this.api.addSubAccount(account).then((res) => {
          console.log(res.body);
          // this.dissmissLoading();
          if (res.status === 200) {
            this.presentToast('sub Account successfully added');
            this.BCAccounts[0].subAccounts.push(subAcc.publicKey())
            localStorage.setItem('_BCAccounts', JSON.stringify(this.BCAccounts));
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

  /**
 * @desc decyrpt the secret key with the signer   
 * @param string $ciphertext - the chiper to be decyrpted
 * @param string $signer - the signer to decyrpt the secret
 * @author Jaje thananjaje3@gmail.com
 * @return decyrpted plain text
 */
  decyrptSecret(ciphertext, signer) {
    // Decrypt
    try {
      var decrypted = (AES.decrypt(ciphertext.toString(), signer)).toString(enc.Utf8);

      console.log("signer => " + signer);
      console.log("ciphertext => " + ciphertext);
      console.log("plaintext => " + decrypted);

      return decrypted;
    } catch (error) {
      console.log(error);
    }
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
