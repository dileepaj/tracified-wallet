import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Toast, AlertController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Network, Server, Keypair, Asset, TransactionBuilder, Operation } from 'stellar-sdk';
import { AES, enc } from "crypto-js";
Network.useTestNetwork();
var server = new Server('https://horizon-testnet.stellar.org');
const setup = require("hsimp-purescript");
const periods = require("hsimp-purescript/dictionaries/periods");
const top10 = require("hsimp-purescript/dictionaries/top10");
const patterns = require("hsimp-purescript/dictionaries/patterns");
const checks = require("hsimp-purescript/dictionaries/checks");
const namedNumbers = require("hsimp-purescript/dictionaries/named-Numbers");
const CharacterSets = require("hsimp-purescript/dictionaries/character-Sets");
Network.useTestNetwork();
import { get } from 'request';
import { Api } from '../../providers';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { BcAccountPage } from '../bc-account/bc-account';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';

@IonicPage()
@Component({
  selector: 'page-add-account',
  templateUrl: 'add-account.html',
})
export class AddAccountPage {
  PasswordStrength = null;
  isLoadingPresent: boolean;
  StrengthPassword: any;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  private toastInstance: Toast;
  loading;
  form: FormGroup;
  BCAccounts: any;

  constructor(public navCtrl: NavController,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private api: Api,
    private connectivity: ConnectivityServiceProvider,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private storage: StorageServiceProvider,
    private properties: Properties
    ) {

    this.form = new FormGroup({
      username: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
      strength: new FormControl(''),
      password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required]))
    });

    this.storage.getBcAccount(this.properties.userName).then((accounts) => {
      this.BCAccounts = accounts;
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddAccountPage');
  }

  /**
* @desc handler function managing other promise function to add main account to admin 
* @param  
* @author Jaje thananjaje3@gmail.com
* @return  
*/
  addMainAccount() {
    var publicKey;
    var secretKey;
    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.validateMainAccount().then(() => {
        this.createAddress().then((pair) => {
          this.createAddress().then((pair2) => {
            //@ts-ignore
            publicKey = pair.publicKey()
            //@ts-ignore
            secretKey = pair.secret();
            //@ts-ignore
            console.log(publicKey)
            console.log(secretKey)
            this.createMultipleTrustline(pair).then(() => {
              this.multisignSubAccount(pair2, publicKey).then(() => {
                this.encyrptSecret(secretKey, this.form.value.password).then((ciphertext) => {
                  const account = {
                    "account": {
                      "mainAccount": {
                        "accountName": this.form.value.username,
                        "pk": publicKey,
                        "sk": ciphertext,
                        //@ts-ignore
                        "subAccounts": [pair2.publicKey()]
                      }
                    }
                  }
                  this.api.addMainAccount(account).then((res) => {
                    this.dissmissLoading();
                    if (res.status === 200) {
                      console.log(res)
                      this.presentToast('Blockchain Account added successfully!');
                      this.gotoBlockchainAccPage();
                    } else if (res.status === 205) {

                    } else if (res.status === 403) {
                      this.userError('Authentication Failed', 'Your account is blocked. Please contact an admin.');
                    } else {
                      this.userError('Authentication Failed', 'Could not authenticate the account.');
                    }
                  })
                    .catch((error) => {
                      this.dissmissLoading();
                      this.userError('Authentication Failed', 'authenticationFailedDescription');
                      console.log(error);
                    });
                }).catch(e => {
                  console.log(e)
                  if (this.isLoadingPresent) {
                    this.dissmissLoading();
                    this.presentToast('Error occured while encrypting the key. Please contact an admin.');
                  }
                })
              }).catch(e => {
                console.log(e)
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                  this.presentToast('Error occured. Could not create multiple trust lines.');
                }
              })
            }).catch(e => {
              console.log(e)
              if (this.isLoadingPresent) {
                this.dissmissLoading();
                this.presentToast('Ops! Something went wrong!');
              }
            })
          }).catch(e => {
            console.log(e)
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Ops! Something went wrong!');
            }
          })
        }).catch(e => {
          console.log(e)
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Error! createAddress.');
          }
        })
      })
        .catch(e => {
          console.log(e)
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Could not validate the main account! Please try again.');
          }
        })

    } else {
      this.presentToast('There is no internet connection to complete this task. Please try again.');
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
      this.presentLoading();
      return new Promise((resolve, reject) => {
        const account = {
          "account": {
            "subKey": subAcc,
            "pk": this.BCAccounts[0].pk
          }
        };

        this.api.addSubAccount(account).then((res) => {
          console.log(res.body);
          this.dissmissLoading();
          if (res.status === 200) {
            this.presentToast('Sub account successfully added.');
            resolve();

          } else if (res.status === 406) {
            this.userError('Keys update failed', 'Main account not found or Sub account names or public key alredy exist');
          } else {
            this.userError('Authentication Failed', 'Could not authenticate the account.');
          }
        }).catch((error) => {
            this.dissmissLoading();
            this.userError('Authentication Failed', 'Could not authenticate the account.');
            console.log(error);
          });
      })
    } else {
      this.presentToast('There is no internet connection to complete this task. Please try again.');
    }
  }

  /**
* @desc validate the main account name whether its already present (globally unique)  
* @param string $username - the username as main account name
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  validateMainAccount() {
    if (this.connectivity.onDevice) {
      return new Promise((resolve, reject) => {
        // this.presentLoading();
        const account = {
          "account": {
            "accountName": this.form.value.username
          }
        };

        this.api.validateMainAccount(account).then((res) => {
          console.log(res.body)
          // this.dissmissLoading();
          if (res.status === 200 && res.body.status == false) {
            resolve();
          } else {
            this.dissmissLoading();
            this.userError('Error', 'Duplicate main account found!');
            reject();
          }
        }).catch((error) => {
            this.dissmissLoading();
            this.userError('Authentication Failed', 'Could not authenticate the account.');
            console.log(error);
            reject();
          });
      })
    } else {
      this.presentToast('There is no internet connection to complete this task. Please try again.');
    }
  }

  /**
* @desc check the time need to crack the password that user inputs  
* @param string $StrengthPassword - StrengthPassword to check strength
* @author Jaje thananjaje3@gmail.com
* @return password strenth as time
*/
  checkStrength() {
    const hsimp = setup({
      calculation: {
        calcs: 40e9,
        characterSets: CharacterSets
      },
      time: {
        periods: periods,
        namedNumbers: namedNumbers,
        forever: "Forever",
        instantly: "Instantly",
      },
      checks: {
        dictionary: top10,
        patterns: patterns,
        messages: checks
      },
    });

    this.PasswordStrength = hsimp(this.StrengthPassword).time;

  }

  /**
* @desc communicate with stellar horizon to create and fund address.  
* @param 
* @author Jaje thananjaje3@gmail.com
* @return object key pair
*/
  createAddress() {
    return new Promise((resolve, reject) => {
      //generate address pair
      var pair = Keypair.random();

      //funds address with XLM
      get({
        url: 'https://friendbot.stellar.org',
        qs: { addr: pair.publicKey() },
        json: true
      }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
          reject(error);
        }
        else {
          resolve(pair);
        }
      });
    })
  }

  /**
* @desc create trust line for multipe assets dynamically for a Stellar account  
* @param object $pair - the public and secret key pair
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  createMultipleTrustline(pair) {
    return new Promise((resolve, reject) => {
      var receivingKeys = pair;
      server.loadAccount(receivingKeys.publicKey())
        .then(function (account) {
          const txBuilder = new TransactionBuilder(account);

          var Aple = new Asset('Apple', 'GA4DLKMMKKIWBAMR4EXHZ3I55PGHSC5OKAWUACM4Y7WWMONRYX72WN5L');
          var Mango = new Asset('Mango', 'GA4DLKMMKKIWBAMR4EXHZ3I55PGHSC5OKAWUACM4Y7WWMONRYX72WN5L');
          var Banana = new Asset('Sugar', 'GA4DLKMMKKIWBAMR4EXHZ3I55PGHSC5OKAWUACM4Y7WWMONRYX72WN5L');
          var Milk = new Asset('Milk1', 'GA4DLKMMKKIWBAMR4EXHZ3I55PGHSC5OKAWUACM4Y7WWMONRYX72WN5L');
          var Yoghurt = new Asset('Yoghurt', 'GA4DLKMMKKIWBAMR4EXHZ3I55PGHSC5OKAWUACM4Y7WWMONRYX72WN5L');


          var assetArr = [Aple, Mango, Banana, Milk,Yoghurt];
          assetArr.forEach(element => {
            // add operation
            txBuilder.addOperation(Operation.changeTrust({
              asset: element,
              limit: '1000'
            }))

            const tx = txBuilder.build();
            tx.sign(receivingKeys);

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

  /**
* @desc encrypt the secret key with the signer   
* @param string $secret - the secret to be encrypted
* @param string $signer - the signer to encrypt the secret
* @author Jaje thananjaje3@gmail.com
* @return encrypted secret chiper
*/
  encyrptSecret(secret, signer) {
    try {
      return new Promise((resolve, reject) => {
        // Encrypt
        var ciphertext = AES.encrypt(secret, signer);
        resolve(ciphertext.toString());
      })
    } catch (error) {
      console.log(error)
    }
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  gotoBlockchainAccPage() {
    // this.navCtrl.push(BcAccountPage);
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
 
  presentToast(message) {
    if (this.toastInstance) {
      return;
    }

    this.toastInstance = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });

    this.toastInstance.onDidDismiss(() => {
      this.toastInstance = null;
    });
    this.toastInstance.present();
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

}
