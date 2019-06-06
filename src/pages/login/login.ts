import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, MenuController, AlertController, Toast, LoadingController } from 'ionic-angular';

import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { User } from '../../providers/user/user';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { TabsPage } from '../tabs/tabs';
import { AddAccountPage } from '../add-account/add-account';
import { StorageServiceProvider } from '../../providers/storage-service/storage-service';
import { Properties } from '../../shared/properties';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

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
    private apiService: ApiServiceProvider,
    private connectivity: ConnectivityServiceProvider,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private translateService: TranslateService,
    private storage: StorageServiceProvider,
    private properties: Properties
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
          try {
            this.getAccounts();
          } catch (error) {
            console.log(error)
            this.navCtrl.setRoot(TabsPage);
          }
        } else if (res.status === 205) {
          this.dissmissLoading();
          this.gotoPasswordResetPage(this.form.value.username, this.form.value.password);
        } else if (res.status === 403) {
          this.dissmissLoading();
          this.userError('Authentication Failed', 'Your account is blocked. Please contact an Admin.');
        } else {
          this.dissmissLoading();
          this.userError('Authentication Failed', 'Failed to log into your account.');
        }
      })
        .catch((error) => {
          this.dissmissLoading();
          this.userError('Authentication Failed', 'Failed to log into your account.');
          console.log(error);
        });
    } else {
      this.presentToast('There is no internet at the moment.');
    }
  }

  gotoPasswordResetPage(username, password) {
    this.navCtrl.push(ResetPasswordPage, { type: 'initial', username: username, code: password });
  }

  gotoForgotPasswordPage() {
    this.navCtrl.push(ResetPasswordPage, { type: 'forgotPassword' });
  }

  /**
  * @desc retrieve blockchain accounts from admin backend  
  * @param 
  * @author Jaje thananjaje3@gmail.com
  * @return 
  */
  getAccounts() {
    if (this.connectivity.onDevice) {
      this.apiService.getBCAccountsN().then((res) => {
        console.log(res);
        this.dissmissLoading();
        if (res.status === 200 && res.body.accounts.accounts) {
          const BCAccounts = res.body.accounts.accounts;
          this.storage.setBcAccount(this.properties.userName, BCAccounts);
          this.navCtrl.setRoot(TabsPage);
        } else {
          this.navCtrl.setRoot(TabsPage);
        }
      })
        .catch((error) => {
          if (error.status === 406) {
            this.dissmissLoading();
            this.navCtrl.setRoot(AddAccountPage);
            // this.userError('retrievingBCAccountsFailed', 'retrievingBCAccountsFailed');
          } else {

            this.dissmissLoading();
            // this.userError('retrievingBCAccountsFailed', 'retrievingBCAccountsFailed');
            console.log(error);
            this.navCtrl.setRoot(TabsPage);
          }
        });
    } else {
      this.presentToast('There is no internet at the moment.');
      this.navCtrl.setRoot(TabsPage);
    }
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
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
