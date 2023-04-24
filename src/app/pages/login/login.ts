import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';

// Shared Services
import { Properties } from '../../shared/properties';

// Service Providers

import { DataServiceProvider } from '../../providers/data-service/data-service';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';

// Pages and Components
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { Router } from '@angular/router';

@Component({
   selector: 'page-login',
   templateUrl: 'login.html',
   styleUrls: ['login.scss'],
})
export class LoginPage {
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

   passwordType: string = 'password';
   passwordIcon: string = 'eye-off';
   private toastInstance;
   loading;

   private loginErrorString: string;
   form: any;

   constructor(
      private authService: AuthServiceProvider,
      private connectivity: ConnectivityServiceProvider,
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController,
      private translate: TranslateService,
      private properties: Properties,
      private logger: LoggerService,
      private dataService: DataServiceProvider,
      private router: Router
   ) {
      this.form = new FormGroup({
         username: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
         password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
      });

      this.translate.get('LOGIN_ERROR').subscribe(value => {
         this.loginErrorString = value;
      });
      this.connectivity.putMenuHide(true);
   }

   async login() {
      if (this.connectivity.onDevice) {
         await this.presentLoading();
         const authmodel = {
            userName: this.form.value.username,
            password: this.form.value.password,
            newPassword: 'none',
         };
         this.authService
            .validateUser(authmodel)
            .then(
               res => {
                  if (res.status === 200) {
                     this.dataService
                        .getBlockchainAccounts()
                        .then(accounts => {
                           this.properties.defaultAccount = accounts[0];
                           this.dataService.setDefaultAccount(accounts[0]);
                           this.dataService
                              .storeBlockchainAccounts(accounts)
                              .then(() => {
                                 this.dissmissLoading();
                                 this.connectivity.putMenuHide(false);
                                 this.router.navigate([''], { state: { navigation: 'initial' } });
                              })
                              .catch(err => {
                                 this.dissmissLoading();
                                 this.translate.get(['ERROR', 'FAILED_TO_STORE_TRANS_ACC']).subscribe(text => {
                                    this.presentAlert(text['ERROR'], text['FAILED_TO_STORE_TRANS_ACC']);
                                 });
                                 this.logger.error('Storing BC accounts error: ' + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
                              });
                        })
                        .catch(err => {
                           this.dissmissLoading();
                           if (err.status == 406) {
                              this.router.navigate(['/add-account'], { state: { navigation: 'initial' } });
                           } else {
                              this.translate.get(['ERROR', 'FAILED_TO_FETCH_TRANS']).subscribe(text => {
                                 this.presentAlert(text['ERROR'], text['FAILED_TO_FETCH_TRANS']);
                              });
                           }
                           this.logger.error('Get Blockchain accounts error: ' + JSON.stringify(err), this.properties.skipConsoleLogs, this.properties.writeToFile);
                        });
                  } else if (res.status === 205) {
                     this.dissmissLoading();
                     this.router.navigate(['/psw-reset'], {
                        queryParams: {
                           type: 'initial',
                           username: this.form.value.username,
                           code: this.form.value.password,
                        },
                     });
                  } else {
                     this.dissmissLoading();
                     this.translate.get(['AUTHENTICATION_FAILED', 'FAILED_TO_LOGIN']).subscribe(text => {
                        this.presentAlert(text['AUTHENTICATION_FAILED'], text['FAILED_TO_LOGIN']);
                     });
                  }
               },
               err => {
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
               }
            )
            .catch(error => {
               this.dissmissLoading();
               this.translate.get(['AUTHENTICATION_FAILED', 'FAILED_TO_LOGIN']).subscribe(text => {
                  this.presentAlert(text['AUTHENTICATION_FAILED'], text['FAILED_TO_LOGIN']);
               });
               this.logger.error('User validation error: ' + JSON.stringify(error), this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
      } else {
         this.translate.get(['NO_INTERNET_MOMENT']).subscribe(text => {
            this.presentToast(text['NO_INTERNET_MOMENT']);
         });
      }
   }

   gotoForgotPasswordPage() {
      this.router.navigate(['/psw-reset']);
   }

   hideShowPassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
   }

   async presentAlert(title, message) {
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
            },
         ],
      });
      await alert.present();
   }

   async presentToast(message) {
      if (this.toastInstance) {
         return;
      }

      this.toastInstance = await this.toastCtrl.create({
         message: message,
         duration: 2000,
         position: 'middle',
      });

      this.toastInstance.onDidDismiss(() => {
         this.toastInstance = null;
      });
      this.toastInstance.present();
   }

   async presentLoading() {
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         message: 'Please Wait',
      });
      this.loading.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }
}
