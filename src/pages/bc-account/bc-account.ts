import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, ToastController, LoadingController, Toast } from 'ionic-angular';
import { AddAccountPage } from '../add-account/add-account';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { AccountDetailsPage } from '../../pages/account-details/account-details';
import { FundTransferPage } from '../../pages/fund-transfer/fund-transfer';
import { DataServiceProvider } from '../../providers/data-service/data-service';

@IonicPage()
@Component({
  selector: 'page-bc-account',
  templateUrl: 'bc-account.html',
})
export class BcAccountPage {
  private toastInstance: Toast;
  loading;
  userAcc;
  isLoadingPresent: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private apiService: ApiServiceProvider,
    private connectivity: ConnectivityServiceProvider,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public dataService: DataServiceProvider
  ) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BcAccountPage');
    this.getMainAccounts();
  }

  goToAddAccount() {
    this.navCtrl.push(AddAccountPage);

  }

  doRefresh(refresher) {
    this.getMainAccounts();
    refresher.complete();
  }

  getMainAccounts() {
    return new Promise((resolve, reject) => {
      this.presentLoading();
      this.dataService.getBlockchainAccounts().then((accounts) => {
        this.dissmissLoading();
          this.userAcc = accounts;
          resolve(accounts);
      }).catch((error) => {
        if (this.isLoadingPresent) {
          this.dissmissLoading();
        }
        this.userError('Authentication Failed', 'Retrieving blockchain accounts failed.');
        console.log(error);
        reject();
      });
    });
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

  presentLoading() {
    this.isLoadingPresent = true;
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Pleaes Wait'
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
      duration: 4000,
      position: 'middle'
    });
    toast.present();
  }

  viewAccount(account) {
    this.navCtrl.push(AccountDetailsPage, { account: account });
  }
}


