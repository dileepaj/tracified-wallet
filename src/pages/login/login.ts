import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController, MenuController, AlertController, Toast, LoadingController } from 'ionic-angular';

import { User } from '../../providers';
import { MainPage } from '../';
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
  }

  // Attempt to login in through our User service
  // doLogin() {
  //   console.log(this.form.value);
  //   this.user.login(this.form.value).subscribe((resp) => {
  //     this.navCtrl.push(MainPage);
  //   }, (err) => {
  //     // this.navCtrl.push(MainPage);
  //     // Unable to log in
  //     let toast = this.toastCtrl.create({
  //       message: this.loginErrorString,
  //       duration: 3000,
  //       position: 'bottom'
  //     });
  //     toast.present();
  //   });
  // }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }
  doLogin() {
    if (this.connectivity.onDevice) {
      this.presentLoading();
      const authmodel = {
        userName: this.form.value.username,
        password: this.form.value.password,
        newPassword: 'none'
      };
      // this.gotoPasswordResetPage(this.form.value.username, this.form.value.password);

      this.authService.validateUser(authmodel).then((res) => {
        console.log(res);
        this.dissmissLoading();
        if (res.status === 200) {
          // this.authService.getUser(this.properties.userName)
          // .then((token) => this.dataService.updateLocalProcessFlowDetails(token))
          // .then((uiJSON) => this.dataService.updateLocalArtifactDetails(uiJSON.artifactIds))
          // .then(() => this.dataService.updateLocalItemList())
          // .then(() => console.log('Initial data update finsihed'));
          // this.properties.scannerStatus === 'connected' ? this.navCtrl.setRoot(ExternalScannerPage) : this.navCtrl.setRoot(DeviceScannerPage);
          this.navCtrl.setRoot(TabsPage);
        } else if (res.status === 205) {
          this.gotoPasswordResetPage(this.form.value.username, this.form.value.password);
        } else if (res.status === 403) {
          // this.translate.get(['authenticationFailed', 'accountIsBlocked']).subscribe(text => {
          this.userError('authenticationFailed', 'accountIsBlocked');
          // });
        } else {
          // this.translate.get(['authenticationFailed', 'authenticationFailedDescription']).subscribe(text => {
          this.userError('authenticationFailed', 'authenticationFailedDescription');
          // });
        }
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
