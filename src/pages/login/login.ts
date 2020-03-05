import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, MenuController, AlertController, Toast, LoadingController } from 'ionic-angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AES } from 'crypto-js';

// Shared Services
import { Properties } from '../../shared/properties';

// Service Providers

import { DataServiceProvider } from '../../providers/data-service/data-service';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { Logger } from 'ionic-logger-new';
import { User } from '../../providers/user/user';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';

// Pages and Components
import { ResetPasswordPage } from '../reset-password/reset-password';
import { TabsPage } from '../tabs/tabs';
import { AddAccountPage } from '../add-account/add-account';
import { WaitingFundsPage } from '../../pages/waiting-funds/waiting-funds';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
  adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  private toastInstance: Toast;
  loading;

  private loginErrorString: string;
  form: any;

  constructor(
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private user: User,
    private authService: AuthServiceProvider,
    private connectivity: ConnectivityServiceProvider,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private properties: Properties,
    private logger: Logger,
    private dataService: DataServiceProvider,
    private blockchainService: BlockchainServiceProvider,
    private translate: TranslateService
  ) {
    this.form = new FormGroup({
      username: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
      password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required]))
    });

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  ionViewDidLoad() {
    this.menuCtrl.enable(false);
  }

  ionViewWillLeave() {
    this.menuCtrl.enable(true);
  }

  login() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      const authmodel = {
        userName: this.form.value.username,
        password: this.form.value.password,
        newPassword: 'none'
      };
      this.authService.validateUser(authmodel).then((res) => {
        if (res.status === 200) {
          this.dataService.getBlockchainAccounts().then((accounts) => {
            this.properties.defaultAccount = accounts[0];
            this.dataService.setDefaultAccount(accounts[0]);
            this.dataService.storeBlockchainAccounts(accounts).then(() => {
              this.dissmissLoading();
              this.navCtrl.setRoot(TabsPage);
            }).catch((err) => {
              this.dissmissLoading();
              this.translate.get(['ERROR', 'FAILED_TO_STORE_TRANS_ACC']).subscribe(text => {
                this.presentAlert(text['ERROR'], text['FAILED_TO_STORE_TRANS_ACC']);
              });
              this.logger.error("Storing BC accounts error: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
          }).catch((err) => {
            this.dissmissLoading();
            if (err.status == 406) {
              this.navCtrl.push(AddAccountPage, { navigation: 'initial' });
            } else {
              this.translate.get(['ERROR', 'FAILED_TO_FETCH_TRANS']).subscribe(text => {
                this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_TRANS']);
              });
            }
            this.logger.error("Get Blockchain accounts error: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
          });
        } else if (res.status === 205) {
          this.dissmissLoading();
          this.navCtrl.push(ResetPasswordPage, { type: 'initial', username: this.form.value.username, code: this.form.value.password });
        } else {
          this.dissmissLoading();
          this.translate.get(['AUTHENTICATION_FAILED', 'FAILED_TO_LOGIN']).subscribe(text => {
            this.presentAlert(text['AUTHENTICATION_FAILED'], text['FAILED_TO_LOGIN']);
          });
        }
      }, (err) => {
        if (err.status === 403) {
          this.dissmissLoading();
          this.translate.get(['AUTHENTICATION_FAILED', 'ACCOUNT_BLOCKED']).subscribe(text => {
            this.presentAlert(text['AUTHENTICATION_FAILED'], text['ACCOUNT_BLOCKED']);
          });
        } else {
          this.dissmissLoading();
          this.translate.get(['AUTHENTICATION_FAILED', 'FAILED_TO_LOGIN']).subscribe(text => {
            this.presentAlert(text['AUTHENTICATION_FAILED'], text['FAILED_TO_LOGIN']);
          });
        }
      }).catch((error) => {
        this.dissmissLoading();
        this.translate.get(['AUTHENTICATION_FAILED', 'FAILED_TO_LOGIN']).subscribe(text => {
          this.presentAlert(text['AUTHENTICATION_FAILED'], text['FAILED_TO_LOGIN']);
        });
        this.logger.error("User validation error: " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    } else {
      this.translate.get(['NO_INTERNET_MOMENT']).subscribe(text => {
        this.presentToast(text['NO_INTERNET_MOMENT']);
      });
    }
  }

  gotoForgotPasswordPage() {
    this.navCtrl.push(ResetPasswordPage, { type: 'forgotPassword' });
  }


  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
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

  presentToast(message) {
    if (this.toastInstance) {
      return;
    }

    this.toastInstance = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });

    this.toastInstance.onDidDismiss(() => {
      this.toastInstance = null;
    });
    this.toastInstance.present();
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'Please Wait'
    });
    this.loading.present();
  }

  dissmissLoading() {
    this.loading.dismiss();
  }

}
