import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController, MenuController } from 'ionic-angular';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Properties } from '../../shared/properties';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Logger } from 'ionic-logger-new';
import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { TransferConfirmPage } from '../../pages/transfer-confirm/transfer-confirm';
import { Account } from 'stellar-sdk';

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
    if (this.transferAmount && this.receiverPK) {
      this.presentLoading();
      this.blockchainService.accountBalanceBoth(this.mainAccount.pk).then((balances: any) => {
        let minBalance = 1.5 + (Number(balances.assetCount) * 0.5);
        let effectiveBalance = Number(balances.balance) - minBalance;

        if (effectiveBalance < 0) {
          effectiveBalance = 0;
        }

        if (effectiveBalance < this.transferAmount) {
          this.dissmissLoading();
          this.presentAlert("Error", "Your transferable balance is " + effectiveBalance + " lumens. Please try again with a valid amount.");
        } else if (this.transferAmount < 2) {
          this.dissmissLoading();
          this.presentAlert("Error", "Minimum transfer amount should be greater than 2 lumens. Please try again with a valid amount.");
        } else {
          this.dissmissLoading();
          this.navCtrl.setRoot(TransferConfirmPage, {
            transferAmount: this.transferAmount,
            senderName: this.mainAccount.accountName,
            senderPK: this.mainAccount.pk,
            recieverPK: this.receiverPK,
            recieverName: this.receiverPK
          });
        }
      }).catch(err => {
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

        if (accounts.length < 2) {
          this.goBackAlert("Warning", "Could not find any other accounts. Please try again after creating a new Transaction account.");
          return;
        }

        this.userAcc = accounts;
        for (var i = 0; i < Object.keys(this.userAcc).length; i++) {
          if (this.properties.defaultAccount.accountName != this.userAcc[i].accountName) {
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

  goBackAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "Go Back",
          handler: data => {
            this.navCtrl.setRoot(BcAccountPage);
          }
        }
      ],
      enableBackdropDismiss: false
    });

    alert.present();
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
