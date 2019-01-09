import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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
  StrengthPassword: any;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  form: FormGroup;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
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

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  gotoBlockchainAccPage() {
    this.navCtrl.pop();

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
    var password = this.form.value.password;
    var name = this.form.value.username;
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
      }
      else {
        console.log('SUCCESS! You have a new account :)\n', body);

        // the JS SDK uses promises for most actions, such as retrieving an account
        server.loadAccount(pair.publicKey()).then(function (account) {
          console.log('Balances for account: ' + pair.publicKey());
          account.balances.forEach(function (balance) {
            console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
          });
        });

        this.createTrustline(pair);


        try {
          var x = this.encyrptSecret(pair.secret(), password);
          console.log(x)

        } catch (error) {
          console.log(error)
        }

      }
    });

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
              limit: '1000'
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
        });
    })
  }

//   import { Network, Server, TransactionBuilder, Operation, Asset, Keypair } from 'stellar-sdk';
// Network.useTestNetwork();
// var server = new Server('https://horizon-testnet.stellar.org');
// var server = new Server('https://horizon-testnet.stellar.org');
// Network.useTestNetwork();
// server.loadAccount('GC4FNHE5ULNGHUWE3CQEZ43P6NYTO7CI4QT4KTRDI6AARWXKN7IT5E4J')
//     .then(function (account) {
//         const txBuilder = new TransactionBuilder(account)
//         for (let index = 0; index < 2; index++) {
//             // add operation
//             txBuilder.addOperation(Operation.payment({
//                 destination: 'GD2UYAH7OHWCU5QV3LGIJIE542WEGJMKJ7GHRDXTCN6Y4ACZWG3CRKQ5',
//                 asset: Asset.native(),
//                 amount: '1.5',
//             }))

//         }
//         const tx = txBuilder.build();
//         var sourceKeypair = Keypair.fromSecret('SAGN5POVNGKNPGD2VRVUDQ2T5EEJY255BYEIDY7UY4L6XW2DZPCKS4FV');

//         tx.sign(sourceKeypair);
//         let XDR;
//         // console.log(tx);
//         console.log("XDR............");
//         console.log(tx.toEnvelope().toXDR('base64'));

//         server.submitTransaction(tx)
//             .then(function (transactionResult) {
//                 console.log(transactionResult);
//             }).catch(function (err) {
//                 console.log(err);
//             })

//     })

  encyrptSecret(secret, signer) {
    // Encrypt
    var ciphertext = AES.encrypt(secret, signer);

    // Decrypt
    var decrypted = AES.decrypt(ciphertext.toString(), signer);
    var plaintext = decrypted.toString(enc.Utf8);

    console.log("secret => " + secret);
    console.log("signer => " + signer);
    console.log("ciphertext => " + ciphertext);
    console.log("plaintext => " + plaintext);

    // return ciphertext;
  }

}
