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
// import { BcAccountPage } from '../bc-account/bc-account';

/**
 * Generated class for the AddAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private api: Api,
    private connectivity: ConnectivityServiceProvider,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController) {
    this.form = new FormGroup({
      username: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
      strength: new FormControl(''),
      password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required]))
      // password: new FormControl('', Validators.compose([Validators.maxLength(30), Validators.minLength(8), Validators.pattern('[a-zA-Z ]*'), Validators.required]))
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddAccountPage');
  }

  addMainAccount() {
    var publicKey;
    var secretKey;
    if (this.connectivity.onDevice) {
      this.presentLoading();
      this.validateMainAccount().then(() => {
        this.createAddress().then((pair) => {
          //@ts-ignore
          publicKey = pair.publicKey()
          //@ts-ignore
          secretKey = pair.secret();
          //@ts-ignore
          console.log(publicKey)
          console.log(secretKey)
          this.createMultipleTrustline(pair).then(() => {
            //@ts-ignore
            this.encyrptSecret(secretKey, this.form.value.password).then((ciphertext) => {
              console.log(ciphertext);
              const account = {
                "account": {
                  "mainAccount": {
                    "accountName": this.form.value.username,
                    //@ts-ignore
                    "pk": publicKey,
                    "sk": ciphertext,
                    "subAccounts": []
                  }
                }
              }
              this.api.addMainAccount(account).then((res) => {
                this.dissmissLoading();
                if (res.status === 200) {
                  console.log(res)
                  // localStorage.setItem('_token', JSON.stringify(res.body.Token))
                  this.gotoBlockchainAccPage();
                } else if (res.status === 205) {

                } else if (res.status === 403) {
                  this.userError('authenticationFailed', 'accountIsBlocked');
                } else {
                  this.userError('authenticationFailed', 'authenticationFailedDescription');
                }
              })
                .catch((error) => {
                  this.dissmissLoading();
                  this.userError('authenticationFailed', 'authenticationFailedDescription');
                  console.log(error);
                });
            }).catch(e => {
              console.log(e)
              if (this.isLoadingPresent) {
                this.dissmissLoading();
                this.presentToast('Error! encyrptSecret.');
              }
            })
          }).catch(e => {
            console.log(e)
            if (this.isLoadingPresent) {
              this.dissmissLoading();
              this.presentToast('Error! createMultipleTrustline.');
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
            this.presentToast('Error! validateMainAccount.');
          }
        })

    } else {
      this.presentToast('noInternet');
    }
  }

  addSubAccount() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      const account = {
        "account": {
          "subKey": "abcd1234",
          "pk": "ssdvsdsvsqwwbgfbffddcccdfcdclddggg"
        }
      };

      this.api.addSubAccount(account).then((res) => {
        console.log(res.body.Token);
        this.dissmissLoading();
        if (res.status === 200) {
          localStorage.setItem('_token', JSON.stringify(res.body.Token))
          this.gotoBlockchainAccPage();
        } else if (res.status === 205) {

        } else if (res.status === 403) {
          this.userError('authenticationFailed', 'accountIsBlocked');
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
          } else{
            this.dissmissLoading();
            this.userError('Main Account', 'Duplicate Main Account found!');
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

  checkStrength() {
    // console.log(this.form.valid)
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
    // // this.form.value.strength = hsimp(this.strength).time;
    // console.log("HowSecureIsMyPassword");
    // console.log(hsimp("HowSecureIsMyPassword?"));

  }

  createAddress() {
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

          // // the JS SDK uses promises for most actions, such as retrieving an account
          // server.loadAccount(pair.publicKey()).then(function (account) {
          //   console.log('Balances for account: ' + pair.publicKey());
          //   account.balances.forEach(function (balance) {
          //     console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
          //   });
          // });

          resolve(pair);
          // resolve({'pk': pair.publicKey(), 'sk': pair.secret()});

        }
      });
    })

  }

  createTrustline(pair) {
    return new Promise((resolve, reject) => {
      // Keys for accounts to issue and receive the new asset
      var issuingKeys = Keypair
        .fromSecret('SBIGRT2A5VONIWTKOTDRW6TFABDAC7GG4COE3LQBR6I6B7UPR3WBDIXU');
      var receivingKeys = pair;

      // var receivingKeys = StellarSdk.Keypair
      //   .fromSecret('SDNW4TVMRPTO7NPSBYHYA2ESHOWQLQLOVDN3AKW6Q65YOVT7DIC3KYPO');

      // Create an object to represent the new asset
      var Aple = new Asset('Aple', issuingKeys.publicKey());

      // First, the receiving account must trust the asset
      server.loadAccount(receivingKeys.publicKey())
        .then(function (receiver) {
          var transaction = new TransactionBuilder(receiver)
            // The `changeTrust` operation creates (or alters) a trustline
            // The `limit` parameter below is optional
            .addOperation(Operation.changeTrust({
              asset: Aple,
              limit: '10'
            }))
            .build();
          transaction.sign(receivingKeys);
          server.submitTransaction(transaction);
        })
        .then(() => {
          //  this.encyrptSecret(pair.secret(), password);
          // this.navCtrl.push(BcAccountPage, { "name": name, "publicKey": pair.publicKey(), "secretKey": this.encyrptSecret(pair.secret(), "this.form") });
          resolve()
        })
        .catch(function (error) {
          console.log('Error!', error);
          reject();
        });
    })
  }


  createMultipleTrustline(pair) {
    return new Promise((resolve, reject) => {
      var receivingKeys = pair;
      server.loadAccount(receivingKeys.publicKey())
        .then(function (account) {
          const txBuilder = new TransactionBuilder(account)

          // Create an object to represent the new asset
          var Aple = new Asset('Aple', 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
          // var Grap = new Asset('Grap', 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
          // var Orng = new Asset('Orng', 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
          // var Bana = new Asset('Bana', 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');
          // var Carr = new Asset('Carr', 'GDOPTRADBVWJR6BMB6H5ACQTAVUS6XMT53CDNAJZLOSTIUICIW57ISMF');

          // var assetArr = [Grap, Orng, Bana, Aple, Carr];
          var assetArr = [Aple];
          assetArr.forEach(element => {
            // add operation
            txBuilder.addOperation(Operation.changeTrust({
              asset: element,
              limit: '1000'
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

  }

  encyrptSecret(secret, signer) {
    return new Promise((resolve, reject) => {
      // Encrypt
      var ciphertext = AES.encrypt(secret, signer);

      // // Decrypt
      // var decrypted = AES.decrypt(ciphertext.toString(), signer);
      // var plaintext = decrypted.toString(enc.Utf8);

      console.log("secret => " + secret);
      console.log("signer => " + signer);
      console.log("ciphertext => " + ciphertext);
      // console.log("plaintext => " + plaintext);

      resolve(ciphertext.toString());
    })
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
    // this.translate.get(['pleasewait']).subscribe(text => {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'pleasewait'
    });
    // });
    this.loading.present();
  }

  dissmissLoading() {
    this.loading.dismiss();
  }
}
