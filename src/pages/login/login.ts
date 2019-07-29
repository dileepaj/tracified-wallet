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

// Pages and Components
import { ResetPasswordPage } from '../reset-password/reset-password';
import { TabsPage } from '../tabs/tabs';
import { AddAccountPage } from '../add-account/add-account';

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
    private dataService: DataServiceProvider
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
          this.dataService.getBlockchainAccounts().then((res) => {
            if (res.status == 200) {
              let accounts = res.body.accounts.accounts;
              this.dataService.storeBlockchainAccounts(accounts).then(() => {
                this.navCtrl.setRoot(TabsPage);
                this.dissmissLoading();
              }).catch((err) => {
                this.dissmissLoading();
                this.presentAlert('Error', 'Failed to store transaction accounts in memory.');
                this.logger.error("Storing BC accounts error: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
              });              
            } else {
              this.dissmissLoading();
              this.presentAlert('Error', 'Failed to fetch transaction accounts.');
            }
          }, (err) => {
            if (err.status == 406) {
              this.dissmissLoading();
              this.navCtrl.push(AddAccountPage);
            } else {
              this.dissmissLoading();
              this.presentAlert('Error', 'Failed to fetch transaction accounts.');
            }
          }).catch((err) => {
            this.dissmissLoading();
            this.presentAlert('Error', 'Failed to fetch transaction accounts.');
            this.logger.error("Get Blockchain accounts error: " + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
          });
        } else if (res.status === 205) {
          this.dissmissLoading();
          this.navCtrl.push(ResetPasswordPage, { type: 'initial', username: this.form.value.username, code: this.form.value.password });
        } else {
          this.dissmissLoading();
          this.presentAlert('Authentication Failed', 'Failed to log into your account.');
        }
      }, (err) => {
        if (err.status === 403) {
          this.dissmissLoading();
          this.presentAlert('Authentication Failed', 'Your account is blocked. Please contact an Admin.');
        } else {
          this.dissmissLoading();
          this.presentAlert('Authentication Failed', 'Failed to log into your account.');
        }
      }).catch((error) => {
        this.dissmissLoading();
        this.presentAlert('Authentication Failed', 'Failed to log into your account.');
        this.logger.error("User validation error: " + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
      });
    } else {
      this.presentToast('There is no internet at the moment.');
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
