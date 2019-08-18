import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform, AlertController } from 'ionic-angular';
import { Device } from '@ionic-native/device/ngx';
import { DeviceDetectorService } from 'ngx-device-detector';

import { Properties } from '../shared/properties';
import { Events } from 'ionic-angular';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { StorageServiceProvider } from '../providers/storage-service/storage-service';
import { Logger } from 'ionic-logger-new';
import { FileSystemServiceProvider } from '../providers/file-service/file-system-service';
import { DataServiceProvider } from '../providers/data-service/data-service';
import { BlockchainServiceProvider } from '../providers/blockchain-service/blockchain-service';
import { BcAccountPage } from '../pages/bc-account/bc-account';
import { SettingsPage } from '../pages/settings/settings';
import { ContentPage } from '../pages/content/content';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  activePage: any;
  rootPage;
  company = 'Tracified Wallet';
  userType = 'Admin'
  user: any;
  deviceInfo = null;

  @ViewChild(Nav) nav: Nav;

  pages: any[] = [
    { icon: 'custom-itemIcon', title: 'Items', component: 'TabsPage', action: null },
    { icon: 'custom-blockchain', title: 'Accounts', component: 'BcAccountPage', action: null },
    { icon: 'custom-settings', title: 'Settings', component: 'SettingsPage', action: null },
    { icon: 'custom-about', title: 'About', component: 'ContentPage', action: null },
    { icon: 'custom-logout', title: 'Logout', component: 'LoginPage', action: this.logOut.bind(this) }
  ]

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
    private blockchainService: BlockchainServiceProvider
  ) {
    platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
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
      case "accounts":
        this.nav.setRoot(BcAccountPage);
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

  languageChange() {
    this.presentAlert("Language", "This feature is under development. You cannot change languages at the moment.");
  }
}
