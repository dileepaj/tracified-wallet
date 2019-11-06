import { Component} from '@angular/core';
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
  showaccount: Array<string> = [];

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
  ) {
    this.mainAccount = this.properties.defaultAccount;
    this.getMainAccounts();
  }

  ionViewDidLoad() {
    this.logger.info("Fund Transfer Page Load", this.properties.skipConsoleLogs, this.properties.writeToFile);
  }

  transferFunds() {
    if(this.transferAmount !== "" && this.receiverPK !== "") {
      this.presentLoading();
      this.blockchainService.accountBalance(this.mainAccount.pk).then((balance) => {
        if ((Number(balance))  < this.transferAmount) {
          this.dissmissLoading();
          this.presentAlert("Error", "No sufficient funds. Please try again.");
        } else {
          this.passwordPrompt().then((password) => {
            this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk).then((decKey) => {
            this.blockchainService.transferFunds(decKey, this.receiverPK , this.transferAmount).then((status) => {
              this.transferAmount = "";
              this.receiverPK = "";
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
        }).catch((err) => {
         this.dissmissLoading();
        });
        }
      }).catch (err => {
        this.dissmissLoading();
        this.presentAlert("Error", "Failure to retrieve account balance.");
        this.logger.error("Failure in retrieving account balance: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    } else {
      this.dissmissLoading();
      this.presentAlert("Error", "Please fill in all the required fields.");
    }
  }

  getMainAccounts() {
    return new Promise((resolve, reject) => {
      this.presentLoading();
      this.dataService.getBlockchainAccounts().then((accounts) => {
        this.dissmissLoading();
          this.userAcc = accounts;
          for(var i = 0; i < Object.keys(this.userAcc).length; i++) {
            if(this.properties.defaultAccount.accountName != this.userAcc[i].accountName) {
              this.showaccount.push(this.userAcc[i]);
            }
          }
          resolve();
      }).catch((error) => {
        if (this.isLoadingPresent) {
          this.dissmissLoading();
        }
        this.presentAlert('Authentication Failed', 'Retrieving blockchain accounts failed.');
        this.logger.error("Failure to retrieve blockchain accounts" + error, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject();
      });
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

}
