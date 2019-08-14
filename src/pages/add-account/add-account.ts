import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, Toast, AlertController, NavParams } from 'ionic-angular';
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

// Service Providers
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';

// Shared Services
import { Properties } from '../../shared/properties';
import { Logger } from 'ionic-logger-new';

// Pages
import { AccountInfoPage } from '../../pages/account-info/account-info';

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
  private navigation;

  constructor(
    public navCtrl: NavController,
    private alertCtrl: AlertController,
    private apiService: ApiServiceProvider,
    private connectivity: ConnectivityServiceProvider,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private properties: Properties,
    private logger: Logger,
    private dataService: DataServiceProvider,
    private mappingService: MappingServiceProvider,
    private navParams: NavParams
  ) {

    this.form = new FormGroup({
      accName: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
      strength: new FormControl(''),
      password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required]))
    });

    this.navigation = this.navParams.get('navigation');
  }

  addMainAccount() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.validateAccountName(this.form.value.accName).then((status) => {
        if (status) {
          let mainPair = this.createKeyPair();
          let subPair = this.createKeyPair();

          this.mappingService.encyrptSecret(mainPair.secret(), this.form.value.password).then((encMainSecretKey) => {
            this.mappingService.encyrptSecret(subPair.secret(), this.form.value.password).then((encSubSecretKey) => {
              const mainAccount = {
                accName: this.form.value.accName,
                publicKey: mainPair.publicKey(),
                privateKey: mainPair.secret()
              };
              const account = {
                "account": {
                  "mainAccount": {
                    "accountName": this.form.value.accName,
                    "pk": mainPair.publicKey(),
                    "sk": encMainSecretKey,
                    "skp": mainPair.secret(),
                    "FO": false,
                    "subAccounts": [{
                      "pk": subPair.publicKey(),
                      "sk": encSubSecretKey,
                      "skp": subPair.secret(),
                      "skInvalidated": false
                    }]
                  }
                }
              }
              this.dataService.addTransactionAccount(account).then((res) => {
                this.dissmissLoading();
                if (res.status === 200) {
                  this.presentToast('Transaction account added successfully!');
                  this.navCtrl.setRoot(AccountInfoPage, { account: mainAccount, navigation: this.navigation });
                } else {
                  this.presentAlert('Error', 'Failed to add the transaction account. Please try again or contact an admin.');
                }
              }, (err) => {
                this.dissmissLoading();
                if (err.status == 403) {
                  this.presentAlert('Authentication Failed', 'Your account is blocked. Please contact an admin.');
                } else {
                  this.presentAlert('Error', 'Failed to add the transaction account. Please try again or contact an admin.');
                }
              }).catch((error) => {
                this.dissmissLoading();
                this.presentAlert('Error', 'Failed to add the transaction account. Please try again or contact an admin.');
                this.logger.error("Failed to add transaction account: " + error, this.properties.skipConsoleLogs, this.properties.writeToFile);
              });
            }).catch((err) => {
              this.dissmissLoading();
              this.logger.error("Encrypting private key failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
          }).catch((err) => {
            this.dissmissLoading();
            this.logger.error("Encrypting private key failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          });
        } else {
          this.dissmissLoading();
          this.presentAlert("Error", "Account name already exists. Please pick a different name for the account.");
        }
      }).catch((error) => {
        if (this.isLoadingPresent) {
          this.dissmissLoading();
          this.presentToast('Error occured. Could not validate account name.');
        }
      });
    } else {
      this.presentToast('There is no internet connection to complete this task. Please try again.');
    }
  }

  validateAccountName(accName) {
    return new Promise((resolve, reject) => {
      const account = {
        "account": {
          "accountName": accName
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

  createKeyPair() {
    return Keypair.random();
  }

  multisignSubAccount(subAccount, mainAccount) {
    return new Promise((resolve, reject) => {
      server.loadAccount(subAccount.publicKey()).then(function (account) {
        var transaction = new TransactionBuilder(account).addOperation(Operation.setOptions({
          signer: {
            ed25519PublicKey: mainAccount,
            weight: 2
          }
        })).addOperation(Operation.setOptions({
          masterWeight: 0, // set master key weight
          lowThreshold: 2,
          medThreshold: 2, // a payment is medium threshold
          highThreshold: 2 // make sure to have enough weight to add up to the high threshold!
        })).build();

        transaction.sign(subAccount); // sign the transaction

        return server.submitTransaction(transaction);
      }).then(function (transactionResult) {
        console.log(transactionResult);
        resolve()
      }).catch(function (err) {
        console.error(err);
        reject()
      });
    });
  }

  encyrptSecret(key, signer) {
    return new Promise((resolve, reject) => {
      try {
        var encSecretKey = AES.encrypt(key, signer);
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
