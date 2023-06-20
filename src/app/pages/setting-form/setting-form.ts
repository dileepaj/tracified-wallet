import { Component } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators, MinLengthValidator } from '@angular/forms';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';
import { Properties } from '../../shared/properties';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { SettingsPage } from '../../pages/settings/settings';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { LoginPage } from '../../pages/login/login';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TOAST_TIMER } from 'src/environments/environment';

@Component({
   selector: 'page-setting-form',
   templateUrl: 'setting-form.html',
   styleUrls: ['./setting-form.scss'],
})
export class SettingFormPage {
   displayName: FormGroup;
   accountPassword: FormGroup;
   transactionPassword: FormGroup;
   formType: string;
   loading: any;
   passwordTypeO: string = 'password';
   passwordTypeN: string = 'password';
   passwordTypeC: string = 'password';
   passwordIconO: string = 'eye-off';
   passwordIconN: string = 'eye-off';
   passwordIconC: string = 'eye-off';

   constructor(
      public router: Router,
      private formBuilder: FormBuilder,
      private properties: Properties,
      private logger: LoggerService,
      private alertCtrl: AlertController,
      private dataService: DataServiceProvider,
      private toastCtrl: ToastController,
      private connectivityService: ConnectivityServiceProvider,
      private loadingCtrl: LoadingController,
      private translate: TranslateService
   ) {
      this.formType = this.router.getCurrentNavigation().extras.state.type;
      this.prepareForm();
   }

   prepareForm() {
      if (this.formType == 'displayName') {
         this.displayName = this.formBuilder.group({
            fName: ['', Validators.required],
            lName: ['', Validators.required],
         });
         let fName = this.router.getCurrentNavigation().extras.state.fName;
         let lName = this.router.getCurrentNavigation().extras.state.lName;

         this.displayName.setValue({ fName: fName, lName: lName });
      } else if (this.formType == 'accountPassword') {
         this.accountPassword = this.formBuilder.group(
            {
               oPassword: ['', Validators.required],
               nPassword: ['', Validators.required],
               cPassword: ['', Validators.required],
            },
            { validator: this.passwordMatchValidator }
         );
      } else if (this.formType == 'transactionPassword') {
         this.transactionPassword = this.formBuilder.group(
            {
               accName: [''],
               pubKey: [''],
               oPassword: ['', Validators.required],
               nPassword: ['', Validators.required],
               cPassword: ['', Validators.required],
            },
            { validator: this.passwordMatchValidator }
         );

         this.transactionPassword.setValue({ accName: this.properties.defaultAccount.accountName, pubKey: this.properties.defaultAccount.pk, oPassword: '', nPassword: '', cPassword: '' });
      }
   }

   passwordMatchValidator(formGroup: FormGroup) {
      const newPassword = formGroup.get('nPassword').value;
      const confirmPassword = formGroup.get('cPassword').value;

      if (newPassword !== confirmPassword) {
         return { passwordMismatch: true };
      }

      return null;
   }

   async changeName() {
      if (this.connectivityService.onDevice) {
         await this.presentLoading();
         let fName = this.displayName.get('fName').value;
         let lName = this.displayName.get('lName').value;

         let user = {
            firstName: fName,
            lastName: lName,
         };

         this.dataService
            .changeUserDetails('profile', user)
            .then(res => {
               if (res.status === 200) {
                  this.dissmissLoading();
                  this.translate.get(['NAME_CHANGED_SUCCESS']).subscribe(text => {
                     this.presentToast(text['NAME_CHANGED_SUCCESS']);
                  });
                  this.logger.info('Display name successfully changed.', this.properties.skipConsoleLogs, this.properties.writeToFile);
                  this.router.navigate(['/setting'], { replaceUrl: true });
               } else {
                  this.dissmissLoading();
                  this.translate.get(['ERROR', 'FAILED_TO_CHANGE_ACC_NAME']).subscribe(text => {
                     this.presentAlert(text['ERROR'], text['FAILED_TO_CHANGE_ACC_NAME']);
                  });
                  this.logger.error('Display name change failed: ' + JSON.stringify(res), this.properties.skipConsoleLogs, this.properties.writeToFile);
               }
            })
            .catch(err => {
               this.dissmissLoading();
               this.translate.get(['ERROR', 'CANNOT_CHANGE_ACC_NAME']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['CANNOT_CHANGE_ACC_NAME']);
               });
               this.logger.error('Display name change failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
            });
      } else {
         this.translate.get(['ERROR', 'NO_INTERNET']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['NO_INTERNET']);
         });
      }
   }

   changePassword() {
      if (this.connectivityService.onDevice) {
         this.alertWaitResponse('Warning', 'Once you change the account password you will be automatically logged out from the application. Do you want to continue?')
            .then(async () => {
               await this.presentLoading();
               let oPassword = this.accountPassword.get('oPassword').value;
               let cPassword = this.accountPassword.get('cPassword').value;
               let nPassword = this.accountPassword.get('nPassword').value;

               if (cPassword !== nPassword) {
                  this.translate.get(['ERROR', 'PASSWORD_DONOT_MATCH']).subscribe(text => {
                     this.presentAlert(text['ERROR'], text['PASSWORD_DONOT_MATCH']);
                  });
                  this.dissmissLoading();
                  return;
               }

               let password = {
                  oldPassword: oPassword,
                  newPassword: nPassword,
               };

               this.dataService
                  .changeUserDetails('password', password)
                  .then(res => {
                     if (res.status === 200) {
                        this.dissmissLoading();
                        this.translate.get(['PASSWORD_CHANGED']).subscribe(text => {
                           this.presentToast(text['PASSWORD_CHANGED']);
                        });
                        this.logger.info('Password successfully changed.', this.properties.skipConsoleLogs, this.properties.writeToFile);
                        this.dataService.clearLocalData();
                        this.router.navigate(['/login'], { replaceUrl: true });
                     } else {
                        this.dissmissLoading();
                        this.translate.get(['ERROR', 'FAILED_TO_CHANGE_PASSWORD']).subscribe(text => {
                           this.presentAlert(text['ERROR'], text['FAILED_TO_CHANGE_PASSWORD']);
                        });
                        this.logger.error('Account password change failed: ' + JSON.stringify(res), this.properties.skipConsoleLogs, this.properties.writeToFile);
                     }
                  })
                  .catch(err => {
                     if (err.status == 403) {
                        this.dissmissLoading();
                        this.translate.get(['ERROR']).subscribe(text => {
                           this.presentAlert(text['ERROR'], err.error);
                        });
                        this.logger.error('Account password change failed: ' + err.error, this.properties.skipConsoleLogs, this.properties.writeToFile);
                     } else {
                        this.dissmissLoading();
                        this.translate.get(['ERROR', 'CANNOT_CHANGE_PASSWORD']).subscribe(text => {
                           this.presentAlert(text['ERROR'], text['CANNOT_CHANGE_PASSWORD']);
                        });
                        this.logger.error('Account password change failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                     }
                  });
            })
            .catch(() => {});
      } else {
         this.translate.get(['ERROR', 'NO_INTERNET']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['NO_INTERNET']);
         });
      }
   }

   changeTransactionPassword() {
      if (this.connectivityService.onDevice) {
         this.translate.get(['WARNING', 'CHANGE_PASSWORD_LOGGED_OUT']).subscribe(text => {
            this.alertWaitResponse(text['WARNING'], text['CHANGE_PASSWORD_LOGGED_OUT'])
               .then(async () => {
                  await this.presentLoading();
                  let oPassword = this.transactionPassword.get('oPassword').value;
                  let cPassword = this.transactionPassword.get('cPassword').value;
                  let nPassword = this.transactionPassword.get('nPassword').value;

                  if (cPassword !== nPassword) {
                     this.translate.get(['ERROR', 'PASSWORD_DONOT_MATCH']).subscribe(text => {
                        this.presentAlert(text['ERROR'], text['PASSWORD_DONOT_MATCH']);
                     });
                     this.dissmissLoading();
                     return;
                  }

                  let transactionModel = {
                     oldPassword: oPassword,
                     newPassword: nPassword,
                     publicKey: this.properties.defaultAccount.pk,
                     encSecretKey: this.properties.defaultAccount.sk,
                     accountName: this.properties.defaultAccount.accountName,
                  };

                  this.dataService
                     .changeTransactionAccPassword(transactionModel)
                     .then(res => {
                        if (res.status == 200) {
                           this.dissmissLoading();
                           this.translate.get(['SUCCESSFUL', 'TRANS_SUCCESS_CHANGE']).subscribe(text => {
                              this.presentAlert(text['SUCCESSFUL'], text['TRANS_SUCCESS_CHANGE']);
                           });
                           this.logger.info('Transaction password changed.', this.properties.skipConsoleLogs, this.properties.writeToFile);
                           this.dataService.clearLocalData();
                           this.router.navigate(['/login'], { replaceUrl: true });
                        } else {
                           this.dissmissLoading();
                           this.translate.get(['ERROR', 'CANNOT_CHANGE_TRAS_PASSWORD']).subscribe(text => {
                              this.presentAlert(text['ERROR'], text['CANNOT_CHANGE_TRAS_PASSWORD']);
                           });
                           this.logger.info('Account password change failed.', this.properties.skipConsoleLogs, this.properties.writeToFile);
                        }
                     })
                     .catch(err => {
                        if (err.status == 10) {
                           this.dissmissLoading();
                           this.presentAlert('Error', err.error);
                           this.logger.error('Account password change failed: ' + err.error, this.properties.skipConsoleLogs, this.properties.writeToFile);
                        } else if (err.status == 11) {
                           this.dissmissLoading();
                           this.translate.get(['ERROR']).subscribe(text => {
                              this.presentAlert(text['ERROR'], err.error);
                           });
                           this.logger.error('Account password change failed: ' + err.error, this.properties.skipConsoleLogs, this.properties.writeToFile);
                        } else {
                           this.dissmissLoading();
                           this.translate.get(['ERROR', 'CANNOT_CHANGE_TRAS_PASSWORD']).subscribe(text => {
                              this.presentAlert(text['ERROR'], text['CANNOT_CHANGE_TRAS_PASSWORD']);
                           });
                           this.logger.error('Account password change failed: ' + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
                        }
                     });
               })
               .catch(() => {});
         });
      } else {
         this.translate.get(['ERROR', 'NO_INTERNET']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['NO_INTERNET']);
         });
      }
   }

   async presentAlert(title: string, message: string) {
      const alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'OK',
               handler: data => {},
            },
         ],
      });

      await alert.present();
   }

   async presentToast(message) {
      const toast = await this.toastCtrl.create({
         message: message,
         duration: TOAST_TIMER.SHORT_TIMER,
         position: 'bottom',
      });
      await toast.present();
   }

   async presentLoading() {
      this.loading = await this.loadingCtrl.create({
         message: 'Please Wait',
      });
      await this.loading.present();
   }

   async dissmissLoading() {
      await this.loading.dismiss();
   }

   alertWaitResponse(title, message): Promise<any> {
      return new Promise(async (resolve, reject) => {
         let alert = await this.alertCtrl.create({
            header: title,
            message: message,
            buttons: [
               {
                  text: 'Cancel',
                  handler: data => {
                     reject(false);
                  },
               },
               {
                  text: 'OK',
                  handler: data => {
                     resolve(true);
                  },
               },
            ],
         });

         await alert.present();
      });
   }

   hideShowPassword(option) {
      if (option == 1) {
         this.passwordTypeO = this.passwordTypeO === 'text' ? 'password' : 'text';
         this.passwordIconO = this.passwordIconO === 'eye-off' ? 'eye' : 'eye-off';
      } else if (option == 2) {
         this.passwordTypeN = this.passwordTypeN === 'text' ? 'password' : 'text';
         this.passwordIconN = this.passwordIconN === 'eye-off' ? 'eye' : 'eye-off';
      } else if (option == 3) {
         this.passwordTypeC = this.passwordTypeC === 'text' ? 'password' : 'text';
         this.passwordIconC = this.passwordIconC === 'eye-off' ? 'eye' : 'eye-off';
      }
   }

   privateKeyCheck(privateKey: string) {
      console.log(privateKey);
      // if (this.dataService.validateSecretKey(privateKey)) {
      //    this.presentToast('Private key entered is correct');
      //    this.editTransaction();
      // } else {
      //    this.presentToast('Private key entered is incorrect. Please try again.');
      // }
   }
}
