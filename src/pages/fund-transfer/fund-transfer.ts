import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController, MenuController } from 'ionic-angular';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Properties } from '../../shared/properties';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Logger } from 'ionic-logger-new';
import { BcAccountPage } from '../../pages/bc-account/bc-account';
import { TransferConfirmPage } from '../../pages/transfer-confirm/transfer-confirm';
import { Account } from 'stellar-sdk';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService
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
          this.translate.get(['ERROR', 'FALIED_TO_COPY_KEY']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['BALANCE_IS '] + effectiveBalance + text[' TRY_AGAIN_VALID_AMOUNT']);
          });
        } else if (this.transferAmount < 2) {
          this.dissmissLoading();
          this.translate.get(['ERROR', 'MINIMUM_TRANSFER_AMOUNT']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['MINIMUM_TRANSFER_AMOUNT']);
          });
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
        this.translate.get(['ERROR', 'FAIL_ACC_BAL']).subscribe(text => {
          this.presentAlert(text['ERROR'], text['FAIL_ACC_BAL']);
        });
        this.logger.error("Failure in retrieving account balance: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    } else {
      this.dissmissLoading();
      this.translate.get(['ERROR', 'FILL_REQUIRED']).subscribe(text => {
        this.presentAlert(text['ERROR'], text['FILL_REQUIRED']);
      });
    }
  }

  getMainAccounts() {
    return new Promise((resolve, reject) => {
      this.presentLoading();
      this.dataService.getBlockchainAccounts().then((accounts) => {
        this.dissmissLoading();

        if (accounts.length < 2) {
          this.translate.get(['WARNING', 'CANNOT_FIND_ACC']).subscribe(text => {
            this.goBackAlert(text['WARNING'], text['CANNOT_FIND_ACC']);
          });
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
        this.translate.get(['AUTHENTICATION_FAILED', 'RETRIEVE_ACC_FAILED']).subscribe(text => {
          this.presentAlert(text['AUTHENTICATION_FAILED'], text['RETRIEVE_ACC_FAILED']);
        });
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
