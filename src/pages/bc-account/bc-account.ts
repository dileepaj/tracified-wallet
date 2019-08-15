import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, ToastController, LoadingController, Toast } from 'ionic-angular';
import { AddAccountPage } from '../add-account/add-account';
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { AccountDetailsPage } from '../../pages/account-details/account-details';

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
    public alertCtrl: AlertController
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
    try {
      if (this.connectivity.onDevice) {
        return new Promise((resolve, reject) => {
          this.presentLoading();

          this.apiService.getBCAccountsN().then((res) => {
            console.log(res.body)
            this.dissmissLoading();
            if (res.status === 200) {
              this.userAcc = res.body.accounts.accounts
              resolve();
            } else {
              this.userError('Error', 'Duplicate main account found!');
            }
          }).catch((error) => {
            if (this.isLoadingPresent) {
              this.dissmissLoading();
            }
            this.userError('Authentication Failed', 'Retrieving blockchain accounts failed.');
            console.log(error);
            // reject();
          });
        })
      } else {
        this.presentToast('There is no internet connection to complete this operation. Please try again.');
      }
    } catch (error) {
      if (this.isLoadingPresent) {
        this.dissmissLoading();
      }
      console.log(error);

    }
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


