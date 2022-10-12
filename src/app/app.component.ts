import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform, AlertController, LoadingController } from 'ionic-angular';
import { Device } from '@ionic-native/device/ngx';
import { DeviceDetectorService } from 'ngx-device-detector';

import { Properties } from '../shared/properties';
import { Events } from 'ionic-angular';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { TabsPage } from '../pages/tabs/tabs';
import { HelpPage } from '../pages/help-support/help';
import { LoginPage } from '../pages/login/login';
import { StorageServiceProvider } from '../providers/storage-service/storage-service';
import { Logger } from 'ionic-logger-new';
import { FileSystemServiceProvider } from '../providers/file-service/file-system-service';
import { DataServiceProvider } from '../providers/data-service/data-service';
import { BlockchainServiceProvider } from '../providers/blockchain-service/blockchain-service';
import { BcAccountPage } from '../pages/bc-account/bc-account';
import { FundTransferPage } from '../pages/fund-transfer/fund-transfer';
import { SettingsPage } from '../pages/settings/settings';
import { ContentPage } from '../pages/content/content';
import { CodePushServiceProvider } from '../providers/code-push-service/code-push-service';
import { CodePush, ILocalPackage, IRemotePackage } from '@ionic-native/code-push';
import { MintNftPage } from '../pages/mint-nft/mint-nft';
import { OtpPage } from '../pages/otp/otp';
import { GetKeysPage } from '../pages/get-keys/get-keys';
import { GetNftPage } from '../pages/get-nft/get-nft';
import * as openpgp from 'openpgp';
import CryptoJS from 'crypto-js';
import { ApiServiceProvider } from '../providers/api-service/api-service';
import { key } from 'localforage';
//import { ApiServiceProvider } from 'providers/api-service/api-service';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  activePage: any;
  rootPage;
  company = 'Tracified Wallet';
  userType = 'Wallet User'
  user: any;
  deviceInfo = null;
  private loading;

  @ViewChild(Nav) nav: Nav;

  pages: any[] = [
    { icon: 'custom-itemIcon', title: 'Items', component: 'TabsPage', action: null },
    { icon: 'custom-nft', title: 'Nft', component: 'OtpPage', action: null },
    { icon: 'custom-nft', title: 'Nft', component: 'MintNftPage', action: null },
    { icon: 'custom-nft', title: 'Nft', component: 'GetKeysPage', action: null },
    { icon: 'custom-nft', title: 'Claimed NFT', component: 'GetNftPage', action: null },
    { icon: 'custom-blockchain', title: 'Accounts', component: 'BcAccountPage', action: null },
    { icon: 'custom-fundTransfer', title: 'Fund Transfer', component: 'FundTransferPage', action: null },
    { icon: 'custom-settings', title: 'Settings', component: 'SettingsPage', action: null },
    { icon: 'custom-help', title: 'Help', component: 'HelpPage', action: null },
    { icon: 'custom-about', title: 'About', component: 'ContentPage', action: null },
    { icon: 'custom-logout', title: 'Logout', component: 'LoginPage', action: this.logOut.bind(this) }
  ]
  hash: string;
  
  constructor(
    private deviceService: DeviceDetectorService,
    private device: Device,
    private translate: TranslateService,
    private properties: Properties,
    platform: Platform,
    private config: Config,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private events: Events,
    private authService: AuthServiceProvider,
    private alertCtrl: AlertController,
    private storageService: StorageServiceProvider,
    private logger: Logger,
    private fileSystem: FileSystemServiceProvider,
    private dataService: DataServiceProvider,
    private blockchainService: BlockchainServiceProvider,
    private codepushService: CodePushServiceProvider,
    private loadingCtrl: LoadingController,
    private service:ApiServiceProvider
  ) {
    platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
      this.codepushService.notifyApplicationReady().then(() => {
        this.codepushService.checkForUpdate().then((remotePackage: IRemotePackage) => {
          if (remotePackage.isMandatory) {
            this.presentUpdating();
            this.codepushService.doUpdate(remotePackage).then(() => {
              this.splashScreen.show();
              this.dismissLoading();
            }).catch(() => {
              this.presentAlert("Error", "Failed to install the application. Please re open the application to try again.");
              this.dismissLoading();
            });
          } else {
            this.waitResponseAlert("Updates Avaialable", "There is a pending application update. Would you like to install it right now?", "Yes", "No").then(() => {
              this.codepushService.doUpdate(remotePackage).then(() => {
                this.splashScreen.show();
                this.dismissLoading();
              }).catch(() => {
                this.presentAlert("Error", "Failed to install the application. Please re open the application to try again.");
                this.dismissLoading();
              });
            });
          }
        });
      });
      this.properties.skipConsoleLogs = false;
      this.properties.writeToFile = true;
      this.logger.init(fileSystem).then((status) => this.logger.debug('[Logger] init: ' + status));
    });

    this.initTranslate();
    this.activePage = this.pages[0];
    this.deviceDetails();

    this.events.subscribe('dislayName', (name) => { this.user = name; });
    this.events.subscribe('company', (company) => { this.company = company; });

    this.authService.authorizeLocalProfile().then((res) => {
      if (res) {
        this.dataService.retrieveDefaultAccount().then((account) => {
          this.properties.defaultAccount = account;
          this.rootPage = TabsPage;
        }).catch((err) => {
          this.presentAlert("Error", "Could not retrieve transaction accounts from storage. Please login again.");
          this.dataService.clearLocalData();
          this.rootPage = LoginPage;
        });
      } else {
        this.dataService.clearLocalData();
        this.rootPage = LoginPage;
      }
    }).catch((err) => {
      this.logger.error("Authorize local profile failed: ", err);
      this.presentAlert("Error", "Failed to authorize the user. Please login again.");
      this.rootPage = LoginPage
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

    this.translate.get(['BACK_BUTTON_TEXT']).subscribe(values => {
      this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }

  openPage(page: string) {
    switch (page) {
      case "items":
        this.nav.setRoot(TabsPage);
        break;
      case "nft":
        this.nav.setRoot(OtpPage);
        break;
      case "market":
          this.nav.setRoot(GetNftPage);
          break;
      case "accounts":
        this.nav.setRoot(BcAccountPage);
        break;
      case "fundTransfer":
        this.nav.setRoot(FundTransferPage);
        break;
      case "settings":
        this.nav.setRoot(SettingsPage);
        break;
      case "about":
        this.nav.setRoot(ContentPage);
        break;
      case "logout":
        this.logOut();
        break;
      case "help":
        this.nav.setRoot(HelpPage);
        break;
    }
  }

  checkActive(page) {
    return page == this.activePage;
  }

  underDevelopment() {
    this.presentAlert("Settings", "This feature is under development. You cannot view settings at the moment.")
  }

  logOut() {
    let confirm = this.alertCtrl.create({
      title: 'Confirmation',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'No',
          handler: () => {
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.storageService.clearAllLocalStores();
            this.nav.setRoot(LoginPage);
          }
        }
      ]
    });
    confirm.present();
  }

  presentAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: "OK",
          handler: data => { }
        }
      ]
    });

    alert.present();
  }

  languageChange(language) {
    if (language === 'english') {
      this.translate.use('en');
      this.dataService.setLanguage(language);
    } else if (language === 'sinhala') {
      this.translate.use('si');
      this.dataService.setLanguage(language);
    } else if (language === 'tamil') {
      this.presentAlert("Language", "This feature is under development. You cannot change languages at the moment.");
    }
  }

  presentUpdating() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: false,
      enableBackdropDismiss: false,
      showBackdrop: true,
      content: 'Please wait, downloading required updates..'
    });
    this.loading.present();
  }

  dismissLoading() {
    this.loading.dismiss();
  }

  waitResponseAlert(title, message, agreeBtn, disagreeBtn) {
    return new Promise<void>((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
          {
            text: disagreeBtn,
            handler: data => {
              reject();
            }
          },
          {
            text: agreeBtn,
            handler: data => {
              resolve();
            }
          }
        ],
        enableBackdropDismiss: false
      });
      alert.present();
    });
  }

  generatekeypari(){
    const openpgp = require('openpgp');
    (async () => {
      const key = await openpgp.generateKey({
          userIds: [{name:"mithilap",email:"mithilap@tracfied.com"}], // you can pass multiple user IDs
          rsaBits: 2048,                                              // RSA key size
          passphrase: 'hackerseatthegalbanis'           // protects the private key
      });
      console.log("public key: ",key.publicKeyArmored)
      console.log("private key: ",key.privateKeyArmored)
      this.hash = CryptoJS.SHA256(key.publicKeyArmored).toString(CryptoJS.enc.Hex);
      console.log("SHA256-hash:",this.hash)

      this.service.saveRSAkeyData(this.hash,key.publicKeyArmored,key.privateKeyArmored)  
      })(); 

     
  }
}
