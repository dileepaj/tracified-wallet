import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController, Toast, AlertController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Keypair } from 'stellar-sdk';
import { AES, enc } from "crypto-js";
import { TranslateService } from '@ngx-translate/core';

// Network.usePublicNetwork();
// var server = new Server(stellarNet);
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
import CryptoJS from 'crypto-js';
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

  PasswordStrength = null;
  isLoadingPresent: boolean;
  StrengthPassword: any;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  confirmPasswordType: string = 'password';
  confirmPasswordIcon: string = 'eye-off';
  loading: any;
  form: FormGroup;
  private navigation: any;
  private toastInstance: Toast;
  hash: any;
  pgpMainKeyPair: any;

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
    private navParams: NavParams,
    private translate: TranslateService,
    private service:ApiServiceProvider,
  ) {

    this.form = new FormGroup({
      accName: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
      strength: new FormControl(''),
      email:new FormControl('',[Validators.email,Validators.required]),
      password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
      confirmPassword: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
    });

    this.navigation = this.navParams.get('navigation');
  }

  addMainAccount() {

    let password = this.form.get('password').value;
    let confirmPassword = this.form.get('confirmPassword').value;

    if (password != confirmPassword) {
      this.translate.get(['ERROR', 'PASSWORD_DONOT_MATCH']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['PASSWORD_DONOT_MATCH']);
      });
      return;
    }

    if (this.connectivity.onDevice) {
      this.presentLoading();
      console.log("------------test1---------------")
      this.validateAccountName(this.form.value.accName).then(async (status) => {
        if (status) {
          let mainPair = this.createKeyPair();
          this.pgpMainKeyPair= await this.generatePGPGkeypari()

          this.mappingService.encyrptSecret(mainPair.secret(), this.form.value.password).then(async (encMainSecretKey) => {
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
                  "subAccounts": [ ]
                }
              }
            }

            await this.dataService.addTransactionAccount(account).then((res:any) => {
              this.dataService.storeBlockchainAccounts(account).then((res1:any)=>{
                  console.log("result 1: ",res1)
                  this.dataService.retrieveBlockchainAccounts().then((res2:any)=>{
                    console.log("result 2: ",res2)
                  })
              })
              //TODO : 
              const PGPAccount = {
                "pgppublickkey":this.pgpMainKeyPair.publicKeyArmored,
                "pgppksha256": this.hash,
                "stellarpublickey":mainAccount.publicKey,
                "username": this.form.value.accName
              }
              const fullAccount = {
                accName: mainAccount.accName,
                publicKey: mainAccount.publicKey,
                privateKey: mainAccount.privateKey,
                pgpPublickKey:this.pgpMainKeyPair.publicKeyArmored,
                pgpPrivateKey:this.pgpMainKeyPair.privateKeyArmored
              }
              console.log("PGP modal : ",PGPAccount)
              this.service.SavePGPkeyForEndorsment(PGPAccount)
              this.dataService.storePGPAccounts(this.pgpMainKeyPair).then(() => {

              })
              this.dissmissLoading();
              console.log("Response :",res)
              if (res.status === 200) {
                this.translate.get(['TRANSACTION_ACCOUNT_ADDED']).subscribe(text => {
                  this.presentToast(text['TRANSACTION_ACCOUNT_ADDED']);
                });
                this.navCtrl.setRoot(AccountInfoPage, { account: fullAccount, navigation: this.navigation });
              } else {
                this.translate.get(['ERROR', 'FAILED_ADD_TRANSACTION']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAILED_ADD_TRANSACTION']);
                  console.log("Response :",res)
                });
              }
            }, (err) => {
              this.dissmissLoading();
              if (err.status == 403) {
                this.translate.get(['AUTHENTICATION_FAILED', 'ACC_BLOCKED']).subscribe(text => {
                  this.presentAlert(text['AUTHENTICATION_FAILED'], text['ACC_BLOCKED']);
                });
              } else {
                this.translate.get(['ERROR', 'FAILED_ADD_TRANSACTION']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAILED_ADD_TRANSACTION']);
                  console.log("error msg1:",err)
                });
              }
            }).catch((error) => {
              this.dissmissLoading();
              this.translate.get(['ERROR', 'FAILED_ADD_TRANSACTION']).subscribe(text => {
                this.presentAlert(text['ERROR'], text['FAILED_ADD_TRANSACTION']);
                console.log("pgp pair2:",this.pgpMainKeyPair)
                console.log("error msg2:",error)
              });
              this.logger.error("Failed to add transaction account: " + error, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
          }).catch((err) => {
            this.dissmissLoading();
            this.logger.error("Encrypting private key failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          });
        } else {
          this.dissmissLoading();
          this.translate.get(['ERROR', 'ACC_NAME_EXISTS']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['ACC_NAME_EXISTS']);
          });
        }
      }).catch((error) => {
        if (this.isLoadingPresent) {
          this.dissmissLoading();
          console.log("------------inside catch----------",error)
          this.translate.get(['NOT_VALIDATE_ACC_NAME']).subscribe(text => {
            this.presentToast(text['NOT_VALIDATE_ACC_NAME']);
          });
        }
      });
    } else {
      this.translate.get(['NO_CONNECTION']).subscribe(text => {
        this.presentToast(text['NO_CONNECTION']);
      });
    }
  }

  validateAccountName(accName) {
    return new Promise((resolve, reject) => {
      this.apiService.validateMainAccountN(accName).then((res) => {
        console.log("------------validate1----------",res)
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

  hideShowPassword(option) {
    if (option == 1) {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
    } else if (option == 2) {
      this.confirmPasswordType = this.confirmPasswordType === 'text' ? 'password' : 'text';
      this.confirmPasswordIcon = this.confirmPasswordIcon === 'eye-off' ? 'eye' : 'eye-off';
    }
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

  async generatePGPGkeypari(){
    const openpgp = require('openpgp');
    let key
    await (async () => {
          key = await openpgp.generateKey({
          userIds: [{name:this.form.value.accName,email:this.form.value.email}], // you can pass multiple user IDs
          rsaBits: 2048,                                              // RSA key size
          passphrase: 'hackerseatthegalbanis'           // protects the private key
      });
      console.log("public key: ",key.publicKeyArmored)
      console.log("private key: ",key.privateKeyArmored)
      this.hash = CryptoJS.SHA256(key.publicKeyArmored).toString(CryptoJS.enc.Hex);
      console.log("SHA256-hash:",this.hash)

      // this.service.saveRSAkeyData(this.hash,key.publicKeyArmored,key.privateKeyArmored)  //? remove
      //this.createDigitalSginature(key.publicKeyArmored,key.privateKeyArmored)
      
      })(); 
      return key
      
     
  }


}
