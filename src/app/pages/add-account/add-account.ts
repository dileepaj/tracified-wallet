import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController, AlertController, ModalController, NavController } from '@ionic/angular';
import { FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Keypair } from 'stellar-sdk';
import { AES, enc } from 'crypto-js';
import { TranslateService } from '@ngx-translate/core';

// Service Providers
import { ApiServiceProvider } from '../../providers/api-service/api-service';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { MappingServiceProvider } from '../../providers/mapping-service/mapping-service';

// Shared Services
import { Properties } from '../../shared/properties';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from 'src/app/providers/logger-service/logger.service';
import { Router, NavigationExtras } from '@angular/router';
import { TOAST_TIMER } from 'src/environments/environment';
import { StorageServiceProvider } from 'src/app/providers/storage-service/storage-service';

// Pages
// import { AccountInfoPage } from '../../pages/account-info/account-info';

@Component({
   selector: 'page-add-account',
   templateUrl: 'add-account.html',
   styleUrls: ['./add-account.scss'],
})
export class AddAccountPage implements OnInit {
   key: string = 'ejHu3Gtucptt93py1xS4qWvIrweMBaO';
   adminKey: string = 'hackerkaidagalbanisbaby'.split('').reverse().join('');

   PasswordStrength = null;
   isLoadingPresent: boolean;
   StrengthPassword: any;
   passwordType: string = 'password';
   passwordIcon: string = 'eye-off';
   confirmPasswordType: string = 'password';
   confirmPasswordIcon: string = 'eye-off';
   private toastInstance: any;
   loading;
   form: FormGroup;
   private navigation;
   validation_messages: { password: { type: string; message: string }[]; confirmPassword: { type: string; message: string }[] };

   constructor(
      public router: Router,
      private alertCtrl: AlertController,
      private apiService: ApiServiceProvider,
      private connectivity: ConnectivityServiceProvider,
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      private properties: Properties,
      private logger: LoggerService,
      private dataService: DataServiceProvider,
      private mappingService: MappingServiceProvider,
      private translate: TranslateService,
      private storageService: StorageServiceProvider,
      private modalCtrl: ModalController,
      private navCtrl: NavController
   ) {
      this.form = new FormGroup(
         {
            accName: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
            strength: new FormControl(''),
            password: new FormControl('', Validators.compose([Validators.minLength(6), Validators.required])),
            confirmPassword: new FormControl('', Validators.compose([Validators.required])),
         },
         { validators: this.checkPasswords }
      );

      this.navigation = this.router.getCurrentNavigation().extras.state?.navigation;
   }
   ngOnInit(): void {
      this.form;
   }

   ionViewDidEnter() {}

   checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
      let pass = group.get('password').value;
      let confirmPass = group.get('confirmPassword').value;
      return pass === confirmPass ? null : { notSame: true };
   };

   async addMainAccount() {
      let password = this.form.get('password').value;
      let confirmPassword = this.form.get('confirmPassword').value;
      let accName = this.form.get('accName').value;
      let index = 0;

      await this.storageService.getAllMnemonicProfiles().then(res => {
         index = res.length;
      });

      if (password != confirmPassword) {
         this.translate.get(['ERROR', 'PASSWORD_DONOT_MATCH']).subscribe(text => {
            this.presentAlert(text['ERROR'], text['PASSWORD_DONOT_MATCH']);
         });
         return;
      }

      this.storageService
         .addSeedPhraseAccount(index.toString(), accName, password)
         .then(res => {
            if (res) {
               this.navCtrl.navigateRoot('bc-account-created', { queryParams: { index, redirect: true }, replaceUrl: true });
            } else {
               this.translate.get(['ERROR', 'FAILED_ADD_ACCOUNTS']).subscribe(text => {
                  this.presentAlert(text['ERROR'], text['FAILED_ADD_ACCOUNTS']);
               });
            }
         })
         .catch(() => {
            this.translate.get(['ERROR', 'FAILED_ADD_ACCOUNTS']).subscribe(text => {
               this.presentAlert(text['ERROR'], text['FAILED_ADD_ACCOUNTS']);
            });
         });
   }

   checkStrength() {
      // const hsimp = setup({
      //    calculation: {
      //       calcs: 40e9,
      //       characterSets: CharacterSets,
      //    },
      //    time: {
      //       periods: periods,
      //       namedNumbers: namedNumbers,
      //       forever: 'Forever',
      //       instantly: 'Instantly',
      //    },
      //    checks: {
      //       dictionary: top10,
      //       patterns: patterns,
      //       messages: checks,
      //    },
      // });
      // this.PasswordStrength = hsimp(this.StrengthPassword).time;
   }

   createKeyPair() {
      return Keypair.random();
   }

   encyrptSecret(key, signer) {
      try {
         const encSecretKey = AES.encrypt(key, signer);
         return encSecretKey.toString();
      } catch (error) {
         throw error;
      }
   }

   hideShowPassword(option) {
      if (option == 1) {
         this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
         this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
      } else if (option == 2) {
         this.confirmPasswordType = this.confirmPasswordType === 'text' ? 'password' : 'text';
         this.confirmPasswordIcon = this.confirmPasswordIcon === 'eye-off' ? 'eye' : 'eye-off';
      }
   }

   async presentAlert(title, message) {
      let alert = await this.alertCtrl.create({
         header: title,
         message: message,
         buttons: [
            {
               text: 'Ok',
               role: 'confirm',
               handler: () => {},
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
         duration: TOAST_TIMER.SHORT_TIMER,
         position: 'bottom',
      });

      await this.toastInstance.present();
   }

   async presentLoading() {
      this.isLoadingPresent = true;
      this.loading = await this.loadingCtrl.create({
         message: 'Please Wait',
      });

      await this.loading.present();
   }

   async dissmissLoading() {
      this.isLoadingPresent = false;
      await this.loading.dismiss();
   }

   public goBack() {
      this.router.navigate(['/bc-account']);
   }
}
