import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,  LoadingController, AlertController } from 'ionic-angular';
import { FundTransferPage } from '../../pages/fund-transfer/fund-transfer';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Logger } from 'ionic-logger-new';
import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Properties } from '../../shared/properties';

@IonicPage()
@Component({
  selector: 'page-transfer-confirm',
  templateUrl: 'transfer-confirm.html',
})
export class TransferConfirmPage {

  private transferAmount;
  private senderPK;
  private receiverPK;
  private senderName;
  private receiverName;
  loading;
  isLoadingPresent: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataServiceProvider,
    private logger: Logger,  private blockchainService: BlockchainServiceProvider, private properties: Properties, public loadingCtrl: LoadingController, private alertCtrl: AlertController) {
    this.transferAmount = this.navParams.get('transferAmount');
    this.senderPK = this.navParams.get('senderPK');
    this.receiverPK = this.navParams.get('recieverPK');
    this.senderName = this.navParams.get('senderName');
    this.receiverName = this.navParams.get('recieverName');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TransferConfirmPage');
  }

  confirm() {
    this.presentLoading();
    // SECURITY: Anyone can change the HTML and pass an outside public key as the receiver. Can transfer money out of the tenant.
    this.passwordPrompt().then((password) => {
      this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk).then((decKey) => {
        this.blockchainService.checkAccountValidity(this.receiverPK).then((status) => {
          if (status) {
            this.blockchainService.transferFunds(decKey, this.receiverPK, this.transferAmount).then((status) => {
              this.dissmissLoading();
              this.logger.info("Successfully transferred funds: " + JSON.stringify(status), this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.logger.info("[FUND_TRANSFER][RECEIVER] " + this.receiverPK, this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.logger.info("[FUND_TRANSFER][AMOUNT] " + this.transferAmount, this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.presentAlert("Success", "Successfully transferred " + this.transferAmount + " lumens. View account information to see the updated amount.");
              this.navCtrl.setRoot(FundTransferPage);
              this.transferAmount = "";
              this.receiverPK = "";
            }).catch((err) => {
              this.dissmissLoading();
              this.logger.error("Transfer fund transaction submission failed: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.presentAlert("Error", "Failed to transfer funds for the account.");
            });
          } else {
            this.blockchainService.transferFundsForNewAccounts(decKey, this.receiverPK, this.transferAmount).then(() => {
              this.transferAmount = "";
              this.receiverPK = "";
              this.dissmissLoading();
              this.logger.info("Successfully transferred funds: " + JSON.stringify(status), this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.logger.info("[FUND_TRANSFER][RECEIVER] " + this.receiverPK, this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.logger.info("[FUND_TRANSFER][AMOUNT] " + this.transferAmount, this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.presentAlert("Success", "Successfully transferred " + this.transferAmount + " lumens. View account information to see the updated amount.");
              this.navCtrl.setRoot(FundTransferPage);
            }).catch((err) => {
              this.dissmissLoading();
              this.logger.error("Transfer fund transaction submission failed: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
              this.presentAlert("Error", "Failed to transfer funds for the account.");
            });
          }
        }).catch(err => {
          this.dissmissLoading();
          this.presentAlert("Error", "Failed to identify the receivers account. Please try again.");
          this.logger.error("Failed to validate account ID: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        });
      }).catch((err) => {
        this.dissmissLoading();
        this.presentAlert("Error", "Invalid transaction password. Please try again.");
        this.logger.error("Password validation failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    }).catch((err) => {
      this.dissmissLoading();
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
            role: 'cancel',
            handler: data => {
              reject();
            }
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
        ],
        enableBackdropDismiss: false
      });
      alert.present();
    });
  }

  cancel() {
    this.navCtrl.setRoot(FundTransferPage);
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

  presentAlert(title, message) {
    let alert = this.alertCtrl.create();
    alert.setTitle(title);
    alert.setMessage(message);
    alert.addButton({
      text: 'OK'
    });
    alert.present();
  }

}
