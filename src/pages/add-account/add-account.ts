import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, Toast, AlertController } from 'ionic-angular';
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
import { get } from 'request';

import { BcAccountPage } from '../bc-account/bc-account';

// Service Providers
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';

// Shared Services
import { Properties } from '../../shared/properties';
import { Logger } from 'ionic-logger-new';

@IonicPage()
@Component({
  selector: 'page-add-account',
  templateUrl: 'add-account.html',
})
export class AddAccountPage {
  key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
  adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

  PasswordStrength = null;
  isLoadingPresent: boolean;
  StrengthPassword: any;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  private toastInstance: Toast;
  loading;
  form: FormGroup;

  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private apiService: ApiServiceProvider,
    private connectivity: ConnectivityServiceProvider,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private properties: Properties,
    private logger: Logger,
    private dataService: DataServiceProvider
  ) {

    this.form = new FormGroup({
      accName: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
      strength: new FormControl(''),
      password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required]))
    });
  }

  addMainAccount() {
    var publicKey;
    var secretKey;

    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.validateAccountName().then((status) => {
        if (!status) {
          this.dissmissLoading();
          this.presentAlert("Error", "Account name already exists. Please pick a different name for the account.");
        }
        this.createAddress().then((pair) => {
          this.createAddress().then((pair2) => {
            //@ts-ignore
            publicKey = pair.publicKey()
            //@ts-ignore
            secretKey = pair.secret();
            this.createMultipleTrustline(pair).then(() => {
              this.multisignSubAccount(pair2, publicKey).then(() => {
                this.encyrptSecret(secretKey, this.form.value.password).then((encSecretKey) => {
                  const account = {
                    "account": {
                      "mainAccount": {
                        "accountName": this.form.value.accName,
                        "pk": publicKey,
                        "sk": encSecretKey,
                        //@ts-ignore
                        "subAccounts": [pair2.publicKey()]
                      }
                    }
                  }
                  this.dataService.addTransactionAccount(account).then((res) => {
                    this.dissmissLoading();
                    if (res.status === 200) {
                      this.presentToast('Transaction account added successfully!');
                      this.navCtrl.push(BcAccountPage);
                    } else {
                      this.presentToast('Failed to add the transaction account.');
                    }
                  }, (err) => {
                    this.dissmissLoading();
                    if (err.status == 403) {
                      this.presentAlert('Authentication Failed', 'Your account is blocked. Please contact an admin.');
                    } else {
                      this.presentAlert('Authentication Failed', 'Could not authenticate the account.');
                    }
                  }).catch((error) => {
                    this.dissmissLoading();
                    this.presentAlert('Authentication Failed', 'Could not authenticate the account.');
                    this.logger.error("Failed to add transaction account: " + error, this.properties.skipConsoleLogs, this.properties.writeToFile);
                  });
                }).catch(() => {
                  if (this.isLoadingPresent) {
                    this.dissmissLoading();
                    this.presentToast('Error occured while encrypting the key. Please contact an admin.');
                  }
                });
              }).catch(e => {
                if (this.isLoadingPresent) {
                  this.dissmissLoading();
                  this.presentToast('Error occured. Could not create multiple trust lines.');
                }
              });
            }).catch(e => {
              if (this.isLoadingPresent) {
                this.dissmissLoading();
                this.presentToast('Ops! Something went wrong!');
              }
            });
          }).catch(e => {
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Ops! Something went wrong!');
            }
          });
        }).catch(e => {
          if (this.isLoadingPresent) {
            this.dissmissLoading();
            this.presentToast('Error! createAddress.');
          }
        });
      }).catch((error) => {
        if (this.isLoadingPresent) {
          this.dissmissLoading();
          this.presentToast('Could not check the transaction account name! Please try again.');
        }
      });
    } else {
      this.presentToast('There is no internet connection to complete this task. Please try again.');
    }
  }

  validateAccountName() {
    if (this.connectivity.onDevice) {
      return new Promise((resolve, reject) => {
        const account = {
          "account": {
            "accountName": this.form.value.accName
          }
        };
        this.apiService.validateMainAccountN(account).then((res) => {
          if (res.status === 200 && res.body.status == false) {
            resolve(true);
          } else {
            resolve(false);
          }
        }).catch((error) => {
          this.logger.error("Account name validation failed: " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject();
        });
      });
    } else {
      this.presentToast('There is no internet connection to complete this task. Please try again.');
    }
  }

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

  createAddress() {
    return new Promise((resolve, reject) => {
      var pair = Keypair.random();
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


          var assetArr = [Aple, Mango, Banana, Milk, Yoghurt];
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

  encyrptSecret(secret, signer) {
    return new Promise((resolve, reject) => {
      try {
        var encSecretKey = AES.encrypt(secret, signer);
        resolve(encSecretKey.toString());
      } catch {
        reject();
      }
    });
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
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

  presentToast(message) {
    if (this.toastInstance) {
      return;
    }

    this.toastInstance = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
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
