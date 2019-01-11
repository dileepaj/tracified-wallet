import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, MenuController, AlertController, Toast, LoadingController } from 'ionic-angular';

import { User, Api } from '../../providers';
// import { MainPage } from '../';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { TabsPage } from '../tabs/tabs';

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

  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type

  // Our translated text strings
  private loginErrorString: string;
  form: any;

  constructor(public navCtrl: NavController,
    public menuCtrl: MenuController,
    public user: User,
    private authService: AuthServiceProvider,
    private api: Api,
    private connectivity: ConnectivityServiceProvider,
    public toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public translateService: TranslateService) {
    this.form = new FormGroup({
      username: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
      password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required]))
      // password: new FormControl('', Validators.compose([Validators.maxLength(30), Validators.minLength(8), Validators.pattern('[a-zA-Z ]*'), Validators.required]))
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
    this.getAccounts();
  }

  doLogin() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      const authmodel = {
        userName: this.form.value.username,
        password: this.form.value.password,
        newPassword: 'none'
      };

      this.authService.validateUser(authmodel).then((res) => {
        console.log(res.body.Token);
        this.dissmissLoading();
        if (res.status === 200) {
          localStorage.setItem('_token', JSON.stringify(res.body.Token))
          this.navCtrl.setRoot(TabsPage);
        } else if (res.status === 205) {
          this.gotoPasswordResetPage(this.form.value.username, this.form.value.password);
        } else if (res.status === 403) {
          this.userError('authenticationFailed', 'accountIsBlocked');
        } else {
          this.userError('authenticationFailed', 'authenticationFailedDescription');
        }
      })
        .catch((error) => {
          this.dissmissLoading();
          this.userError('authenticationFailed', 'authenticationFailedDescription');
          console.log(error);
        });
    } else {
      this.presentToast('noInternet');
    }
  }

  gotoPasswordResetPage(username, password) {
    this.navCtrl.push(ResetPasswordPage, { type: 'initial', username: username, code: password });
  }

  gotoForgotPasswordPage() {
    this.navCtrl.push(ResetPasswordPage, { type: 'forgotPassword' });
  }

  getAccounts() {
    if (this.connectivity.onDevice) {
      this.presentLoading();

      this.api.getBCAccount().then((res) => {
        console.log(res);
        this.dissmissLoading();
        //@ts-ignore
        if (res.status === 200) {
          //@ts-ignore
          const BCAccounts = res.body.accounts.accounts
          localStorage.setItem('_BCAccounts', JSON.stringify(BCAccounts));

        } else {
          console.log('Error! requesting BC Accounts')
          this.userError('retrievingBCAccountsFailed', 'retrievingBCAccountsFailed');
        }
      })
        .catch((error) => {
          this.dissmissLoading();
          this.userError('retrievingBCAccountsFailed', 'retrievingBCAccountsFailed');
          console.log(error);
        });
    } else {
      this.presentToast('noInternet');
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
    // this.translate.get(['pleasewait']).subscribe(text => {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      content: 'pleasewait'
    });
    // });
    this.loading.present();
  }

  dissmissLoading() {
    this.loading.dismiss();
  }

}
