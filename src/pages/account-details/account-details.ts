import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController} from 'ionic-angular';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Keypair } from 'stellar-sdk';
import { Properties } from '../../shared/properties';
import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { TranslateService } from '@ngx-translate/core';
import { AccountRegisterPage } from '../../pages/account-register/account-register';
import { Organization } from 'shared/models/organization';
import { Clipboard } from '@ionic-native/clipboard/index';
import { Logger } from 'ionic-logger-new';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
// import { ApiServiceProvider } from 'providers';

@IonicPage()
@Component({
  selector: 'page-account-details',
  templateUrl: 'account-details.html',
})
export class AccountDetailsPage {

  public account: any;
  public privateKey: string;
  public keyDecrypted: boolean = false;
  public defaultAccount: boolean = true;
  public accountFunds: string = 'Calculating...';
  public pgpaccount: any;
  notDefaultAccount: boolean;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private mappingService: MappingServiceProvider,
    private properties: Properties,
    private dataService: DataServiceProvider,
    private blockchainService: BlockchainServiceProvider,
    private translate: TranslateService,
    private clipboard: Clipboard,
    private logger: Logger,
    public toastCtrl: ToastController,
    private service:ApiServiceProvider
  ) {
    this.account = this.navParams.get("account");
    this.checkIfRegistered(this.account.pk)
    this.defaultAccountCheck();
    this.blockchainService.accountBalance(this.account.pk).then((balance) => {
      this.accountFunds = balance.toString();
    }).catch((err) => {
      this.accountFunds = '0 ';
    });
  }

  checkIfRegistered(publicKey: string) {
    this.dataService.getOrganization(publicKey).then(res => {
      const data: Organization = res.body;
      this.account.status = (data && data.Status) ? data.Status : "none"
    }).catch((err) => {
      this.account.status = "none"
      console.log(err);
    })
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
          this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
          });
        }
      }).catch((err) => {
        console.log("Error: ", err);
        this.translate.get(['ERROR', 'INCORRECT_PASSWORD']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['INCORRECT_PASSWORD']);
        });
      });
    });
  }

  encryptSecretKey() {
    this.keyDecrypted = false;
    this.privateKey = "";
  }

  ionViewDidLeave() {
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
    if (this.account.pk != this.properties.defaultAccount.pk) {
      this.notDefaultAccount = true;
      console.log("account pk:",this.account.pk)
      this.service.GetAccountDetailsforEndorsment(this.account.pk).then(res=>{
        console.log("stellar ac info recived : ",res)
        this.dataService.retrievePGPAccounts().then(accres=>{
          console.log("pgp account: ",accres)
          //TODO: Write code to check and see if the pgp ac recived == the account in the DB
          //* to define the PGP key use this variable IF NECESSARY pgpaccount
        })
      })
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
          handler: data => { }
        },
        {
          text: 'Yes',
          handler: data => {
            this.properties.defaultAccount = this.account;
            this.dataService.setDefaultAccount(this.account);
            this.defaultAccountCheck();
          }
        }
      ]
    });

    alert.present();
  }

  goToRegister(organizationKey: string) {
    this.navCtrl.push(AccountRegisterPage, { organizationKey });
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

  backButton() {
    this.navCtrl.setRoot(BcAccountPage);
  }
   
  copyToClipboard(option) {
    if (option == 1) {
      this.clipboard.copy(this.account.pk).then(() => {
        this.translate.get(['PUBLIC_KEY_COPIED']).subscribe(text => {
          this.presentToast(text['PUBLIC_KEY_COPIED']);
        });
      }).catch((err) => {
        this.translate.get(['ERROR', 'FALIED_TO_COPY_KEY']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['FALIED_TO_COPY_KEY']);
        });
        this.logger.error("Copying to clipboard failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    } else if(option == 2){
      this.clipboard.copy(this.privateKey).then(() => {
        this.translate.get(['PRIVATE_KEY_COPIED']).subscribe(text => {
          this.presentToast(text['PRIVATE_KEY_COPIED']);
        });
      }).catch((err) => {
        this.translate.get(['ERROR', 'FALIED_TO_COPY_KEY']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['FALIED_TO_COPY_KEY']);
        });
        this.logger.error("Copying to clipboard failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    }

  }

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: "bottom"
    });
    toast.present();
  }
}
