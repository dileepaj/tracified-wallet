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

  //side menu pages
  pages: any[] = [
    { icon: 'custom-itemIcon', title: 'Items', component: 'TabsPage', action: null },
    { icon: 'custom-blockchain', title: 'Accounts', component: 'BcAccountPage', action: null },
    { icon: 'custom-tutorial', title: 'Tutorial', component: 'TutorialPage', action: null },
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
    private storageService: StorageServiceProvider
  ) {
    platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });

    this.initTranslate();
    this.activePage = this.pages[0];
    this.deviceDetails();

    this.events.subscribe('dislayName', (name) => { this.user = name; });

    this.authService.authorizeLocalProfile().then((res) => {
      if (res) {
        this.rootPage = TabsPage
      } else {
        this.rootPage = LoginPage
      }
    }).catch(() => {

    });

  }

  /**
* @desc retrieve device information from the device 
* @param  
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  deviceDetails() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
  }

  /**
* @desc Initialize the language translation
* @param 
* @author Jaje thananjaje3@gmail.com
* @return 
*/
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

  /**
* @desc opens the passed page
* @param string $page - the page to be displayed
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  openPage(page) {
    if (page.action) {
      let action = page.action;
      action();
    } else {
      this.nav.setRoot(page.component);
      this.activePage = page;
    }
  }

  /**
  * @desc checks and returns the current active page
  * @param 
  * @author Jaje thananjaje3@gmail.com
  * @return page which is active
*/
  checkActive(page) {
    return page == this.activePage;
  }

  clearData() {
    this.storageService.clearUser().then(() => {      
      this.nav.setRoot(LoginPage);
      //Log the event and clear all the other necessary information
    });
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
            this.clearData();
          }
        }
      ]
    });
    confirm.present();    
  }

}
