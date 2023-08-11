import { Component, NgZone, ViewChild } from '@angular/core';
// import { SplashScreen } from '@ionic-native/splash-screen';
// import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Platform, AlertController, LoadingController, NavController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';

import { DeviceDetectorService } from 'ngx-device-detector';
import { Properties } from '../app/shared/properties';
import { AuthServiceProvider } from './providers/auth-service/auth-service';
import { StorageServiceProvider } from './providers/storage-service/storage-service';
// import { Logger } from 'ionic-logger-new';
import { LoggerService } from './providers/logger-service/logger.service';
import { EventsService } from './providers/event-service/events.service';
// import { FileSystemServiceProvider } from './providers/file-service/file-system-service';
import { DataServiceProvider } from './providers/data-service/data-service';
import { BlockchainServiceProvider } from './providers/blockchain-service/blockchain-service';
import { ConnectivityServiceProvider } from './providers/connectivity-service/connectivity-service';
import { Keyboard } from '@capacitor/keyboard';
@Component({
   selector: 'app-root',
   templateUrl: 'app.component.html',
   styleUrls: ['app.component.scss'],
})
export class AppComponent {
   activePage: any;
   rootPage;
   company = 'Tracified Wallet';
   userType = 'Wallet User';
   user: any;
   deviceInfo = null;
   private loading;
   pageHide: boolean;
   queryParams: any;
   deeplink: boolean = false;
   // @ViewChild(Nav) nav: Nav;

   constructor(
      private deviceService: DeviceDetectorService,
      // private device: Device,
      private translate: TranslateService,
      private properties: Properties,
      platform: Platform,
      private config: Config,
      // private statusBar: StatusBar,
      // private splashScreen: SplashScreen,
      private events: EventsService,
      private authService: AuthServiceProvider,
      private alertCtrl: AlertController,
      private storageService: StorageServiceProvider,
      private logger: LoggerService,
      // private fileSystem: FileSystemServiceProvider,
      private dataService: DataServiceProvider,
      private blockchainService: BlockchainServiceProvider,
      // private codepushService: CodePushServiceProvider,
      private loadingCtrl: LoadingController,
      private router: Router,
      private zone: NgZone,
      public connectivity: ConnectivityServiceProvider,
      private navCtrl: NavController,
   ) {
      Keyboard.addListener('keyboardDidShow', () => {
         Keyboard.setScroll({ isDisabled: false });
         if (document.activeElement) {
            document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }
      });
      this.authService.authorizeLocalProfile().then(res => {
         if (res) {
            this.menuconfig();
         } else {
            this.router.navigate(['/login']);
         }
      });
      this.initDeepLink();
      this.events.subscribe('walletUsername', name => {
         this.userType = name;
      });
      // platform.ready().then(() => {
      //    // this.statusBar.styleLightContent();
      //    // this.splashScreen.hide();
      //    // this.codepushService.notifyApplicationReady().then(() => {
      //    //   this.codepushService.checkForUpdate().then((remotePackage: IRemotePackage) => {
      //    //     if (remotePackage.isMandatory) {
      //    //       this.presentUpdating();
      //    //       this.codepushService.doUpdate(remotePackage).then(() => {
      //    //         this.splashScreen.show();
      //    //         this.dismissLoading();
      //    //       }).catch(() => {
      //    //         this.presentAlert("Error", "Failed to install the application. Please re open the application to try again.");
      //    //         this.dismissLoading();
      //    //       });
      //    //     } else {
      //    //       this.waitResponseAlert("Updates Avaialable", "There is a pending application update. Would you like to install it right now?", "Yes", "No").then(() => {
      //    //         this.codepushService.doUpdate(remotePackage).then(() => {
      //    //           this.splashScreen.show();
      //    //           this.dismissLoading();
      //    //         }).catch(() => {
      //    //           this.presentAlert("Error", "Failed to install the application. Please re open the application to try again.");
      //    //           this.dismissLoading();
      //    //         });
      //    //       });
      //    //     }
      //    //   });
      //    // });
      //    this.properties.skipConsoleLogs = false;
      //    this.properties.writeToFile = true;
      //    // this.logger.init(fileSystem).then((status) => this.logger.debug('[Logger] init: ' + status));
      // });
      // this.initTranslate();
      // this.deviceDetails();
      // this.events.subscribe('dislayName', name => {
      //    this.user = name;
      // });
      // this.events.subscribe('company', company => {
      //    this.company = company;
      // });

      //v6 plz remove and move to activate

      // this.authService
      // .authorizeLocalProfile()
      // .then(res => {
      //    if (res) {
      //       this.dataService
      //          .retrieveDefaultAccount()
      //          .then(account => {
      //             this.properties.defaultAccount = account;
      //             this.router.navigate(['/assets'], { replaceUrl: true });
      //          })
      //          .catch(err => {
      //             this.presentAlert('Error', 'Could not retrieve transaction accounts from storage. Please login again.');
      //             this.dataService.clearLocalData();
      //             this.router.navigate(['/login'], { replaceUrl: true });
      //          });
      //    } else {
      //       this.dataService.clearLocalData();
      //       this.router.navigate(['/login'], { replaceUrl: true });
      //    }
      // })
      // .catch(err => {
      //    this.logger.error('Authorize local profile failed: ', err);
      //    this.presentAlert('Error', 'Failed to authorize the user. Please login again.');
      //    this.router.navigate(['/login'], { replaceUrl: true });
      // });
   }

   async menuconfig() {
      if (this.router.url === '/request-delete') {
         this.router.navigate(['/request-delete']);
      }
      // else if (this.deeplink) {
      //
      //    this.router.navigate(['/otp-bc-account'], this.queryParams);
      // }
   }

   async checkUser(): Promise<boolean> {
      return new Promise(resolve => {
         this.dataService
            .retrieveDefaultAccount()
            .then(account => {
               this.properties.defaultAccount = account;
               resolve(false);
               // this.router.navigate(['/assets'], { replaceUrl: true });
            })
            .catch(err => {
               this.presentAlert('Error', 'Could not retrieve transaction accounts from storage. Please login again.');
               this.dataService.clearLocalData();
               resolve(true);
               // this.router.navigate(['/login'], { replaceUrl: true });
            });
      });
   }

   checkauth() {
      this.authService
         .authorizeLocalProfile()
         .then(res => {
            if (res) {
               this.dataService
                  .retrieveDefaultAccount()
                  .then(account => {
                     this.properties.defaultAccount = account;
                     this.router.navigate([''], { replaceUrl: true });
                  })
                  .catch(err => {
                     this.presentAlert('Error', 'Could not retrieve transaction accounts from storage. Please login again.');
                     this.dataService.clearLocalData();
                     this.router.navigate(['/login'], { replaceUrl: true });
                  });
            } else {
               this.dataService.clearLocalData();
               this.router.navigate(['/login'], { replaceUrl: true });
            }
         })
         .catch(err => {
            this.logger.error('Authorize local profile failed: ', err);
            this.presentAlert('Error', 'Failed to authorize the user. Please login again.');
            this.router.navigate(['/login'], { replaceUrl: true });
         });
   }

   initDeepLink() {
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
         this.zone.run(() => {
            const segments = event.url.split('://')[1].split('/');
            const slug = segments?.[0];
            const gemName = segments?.[1];
            const shopId = segments?.[2];

            if (slug === 'nft') {
               this.queryParams = {};
               if (shopId) {
                  const option: NavigationExtras = {
                     queryParams: {
                        AppshopId: shopId,
                        AppgemName: gemName,
                     },
                  };
                  this.deeplink = true;
                  this.router.navigate(['/otp-bc-account'], option);
               }
            } else {
               this.deeplink = false;
               this.router.navigate(['/tabs']);
            }
         });
      });
   }

   deviceDetails() {
      this.deviceInfo = this.deviceService.getDeviceInfo();
      const isMobile = this.deviceService.isMobile();
      const isTablet = this.deviceService.isTablet();
      const isDesktopDevice = this.deviceService.isDesktop();
   }

   initTranslate() {
      // Set the default language for translation strings, and the current language.
      this.translate.setDefaultLang('en');
      const browserLang = this.translate.getBrowserLang();

      if (browserLang) {
         if (browserLang === 'zh') {
            const browserCultureLang = this.translate.getBrowserCultureLang();

            if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
               this.translate.use('zh-cmn-Hans');
            } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
               this.translate.use('zh-cmn-Hant');
            }
         } else {
            this.translate.use(this.translate.getBrowserLang());
         }
      } else {
         this.translate.use('en'); // Set your language here
      }

      // this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      //    this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
      // });
   }

   openPage(page: string) {
      switch (page) {
         case 'items':
            this.router.navigate(['/tabs'], { replaceUrl: true });
            break;
         case 'nft':
            this.router.navigate(['/otp-bc-account']);
            break;
         case 'market':
            this.router.navigate(['/get-nft']);
            break;
         case 'accounts':
            this.router.navigate(['/bc-account']);
            break;
         case 'fundTransfer':
            this.router.navigate(['/fund-transfer']);
            break;
         case 'settings':
            this.router.navigate(['/setting']);
            break;
         case 'about':
            //  this.nav.setRoot(ContentPage);
            break;
         case 'logout':
            this.logOut();
            break;
         case 'help':
            this.router.navigate(['/help']);
            break;
      }
   }

   checkActive(page) {
      // return page == this.activePage;
   }

   underDevelopment() {
      this.presentAlert('Settings', 'This feature is under development. You cannot view settings at the moment.');
   }

   async logOut() {
      let confirm = await this.alertCtrl.create({
         header: 'Confirmation',
         message: 'Are you sure you want to logout?',
         buttons: [
            {
               text: 'No',
               handler: () => {},
            },
            {
               text: 'Yes',
               handler: () => {
                  this.storageService.clearAllLocalStores();
                  this.navCtrl.navigateRoot('/login');
               },
            },
         ],
      });
      await confirm.present();
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

   languageChange(language) {
      if (language === 'english') {
         this.translate.use('en');
         this.dataService.setLanguage(language);
      } else if (language === 'sinhala') {
         this.translate.use('si');
         this.dataService.setLanguage(language);
      } else if (language === 'tamil') {
         this.presentAlert('Language', 'This feature is under development. You cannot change languages at the moment.');
      }
   }

   async presentUpdating() {
      this.loading = await this.loadingCtrl.create({
         backdropDismiss: false,
         showBackdrop: true,
         message: 'Please wait, downloading required updates..',
      });
      await this.loading.present();
   }

   async dismissLoading() {
      await this.loading.dismiss();
   }

   waitResponseAlert(title, message, agreeBtn, disagreeBtn) {
      return new Promise<void>(async (resolve, reject) => {
         const alert = await this.alertCtrl.create({
            header: title,
            message: message,
            buttons: [
               {
                  text: disagreeBtn,
                  handler: data => {
                     reject();
                  },
               },
               {
                  text: agreeBtn,
                  handler: data => {
                     resolve();
                  },
               },
            ],
            backdropDismiss: false,
         });
         await alert.present();
      });
   }
}
