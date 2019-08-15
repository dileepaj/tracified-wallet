import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Keypair } from 'stellar-sdk';
import { Properties } from '../../shared/properties';

@IonicPage()
@Component({
  selector: 'page-account-details',
  templateUrl: 'account-details.html',
})
export class AccountDetailsPage {

  private account;
  private privateKey: string;
  private keyDecrypted: boolean = false;
  private notDefaultAccount: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private mappingService: MappingServiceProvider,
    private properties: Properties
  ) {
    this.account = this.navParams.get("account");
    this.defaultAccountCheck();
  }

  decryptSecretKey() {
    this.transactionPasswordPopUp().then((password) => {
      this.mappingService.decryptSecret(this.account.sk, password).then((secretKey) => {
        let pair = Keypair.fromSecret(secretKey.toString());
        if (pair.publicKey() === this.account.pk) {
          this.keyDecrypted = true;
          this.privateKey = secretKey.toString();
        } else {
          console.log("Password incorrect.");
          this.presentAlert("Error", "Incorrect password. Please try again");
        }
      }).catch((err) => {
        console.log("Error: ", err);
        this.presentAlert("Error", "Incorrect password. Please try again");
      });
    });
  }

  ionViewDidLeave() {
    console.log("Secret Key: ");
    this.keyDecrypted = false;
    this.privateKey = "";
  }

  transactionPasswordPopUp(): Promise<string> {
    let resolveFunction: (password: string) => void;

    let promise = new Promise<string>(resolve => {
      resolveFunction = resolve;
    });

    let popup = this.alertCtrl.create({
      title: "Transaction Password",
      inputs: [
        {
          name: "password",
          placeholder: "Password",
          type: "password"
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // Cancel action
          }
        },
        {
          text: 'OK',
          handler: data => {
            if (data.password) {
              resolveFunction(data.password);
            }
          }
        }
      ]
    });

    popup.present();

    return promise;
  }

  defaultAccountCheck() {
    if (this.account.pk != this.properties.defaultAccountPk) {
      this.notDefaultAccount = true;
    } else {
      this.notDefaultAccount = false;
    }
  }

  makeDefaultAccount() {
    let alert = this.alertCtrl.create({
      title: 'Default Account',
      message: 'Are you sure you want to make this account the default account?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: data => {

          }
        },
        {
          text: 'Yes',
          handler: data => {
            this.properties.defaultAccountPk = this.account.pk;
            this.defaultAccountCheck();
          }
        }
      ]
    });

    alert.present();
  }

  presentAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {

          }
        }
      ]
    });

    alert.present();
  }

}
