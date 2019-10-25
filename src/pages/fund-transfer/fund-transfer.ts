import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,  AlertController, LoadingController, ToastController, MenuController } from 'ionic-angular';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Properties } from '../../shared/properties';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Logger } from 'ionic-logger-new';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';

@IonicPage()
@Component({
  selector: 'page-fund-transfer',
  templateUrl: 'fund-transfer.html',
})
export class FundTransferPage {
  loading;
  isLoadingPresent: boolean;
  mainAccount: any;
  userAcc;
  transferAmount;
  receiverPK;

  constructor(
  public navCtrl: NavController,
  public navParams: NavParams,
  private alertCtrl: AlertController,
  private loadingCtrl: LoadingController,
  private toastCtrl: ToastController,
  private blockchainService: BlockchainServiceProvider,
  private properties: Properties,
  public dataService: DataServiceProvider,
  private logger: Logger,
  public menuCtrl: MenuController,
  private apiService: ApiServiceProvider,
  private connectivity: ConnectivityServiceProvider,
  ) {
    this.mainAccount = this.properties.defaultAccount;
  }

  ionViewDidLoad() {
    this.logger.info("Fund Transfer Page Load", this.properties.skipConsoleLogs, this.properties.writeToFile);
  }

  transferFunds() {
    this.presentLoading();
    this.blockchainService.accountBalance(this.mainAccount.pk).then((balance) => {
      if ((Number(balance))  < this.transferAmount) {
        this.dissmissLoading();
        this.presentAlert("Error", "There are no sufficient funds to transfer funds in your account.");
      }
      else {
        this.passwordPrompt().then((password) => {
          this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk).then((decKey) => {
            this.blockchainService.transferFunds(decKey, this.receiverPK , this.transferAmount).then((status) => {
              this.dissmissLoading();
              this.logger.info("Successfully transferred funds: " + JSON.stringify(status), this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.presentAlert("Success", "Transfer of funds successful to the account.");
            }).catch((err) => {
              this.dissmissLoading();
              this.logger.error("Transfer fund transaction submission failed: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.presentAlert("Error", "Failed to transfer funds for the account.");
            });
        }).catch(err => {
          this.dissmissLoading();
          this.presentAlert("Error", "Invalid transaction password. Please try again.");
          this.logger.error("Password validation failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        });
       });
      }
    });
  }

  passwordPrompt(): Promise<any> {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: 'Transaction Password',
        inputs: [
          {
            name: 'password',
            type: 'password',
            placeholder: 'Password...'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Submit',
            handler: data => {
              if (data.password) {
                resolve(data.password);
              } else {
                console.log("Empty Password");
              }
            }
          },
        ]
      });
      alert.present();
    });
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

  presentToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

}
