import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform } from 'ionic-angular';
import { Device } from '@ionic-native/device/ngx';
import { DeviceDetectorService } from 'ngx-device-detector';

import { FirstRunPage } from '../pages';
import { Settings } from '../providers';
import { Properties } from '../shared/properties';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  activePage: any;
  rootPage = FirstRunPage;
  company = 'Tracified Wallet';
  userType = 'Admin'
  user: any;
  deviceInfo = null;

  @ViewChild(Nav) nav: Nav;

  //side menu pages
  pages: any[] = [
    { icon: 'custom-itemIcon', title: 'Items', component: 'TabsPage' },
    { icon: 'custom-blockchain', title: 'Accounts', component: 'BcAccountPage' },
    { icon: 'custom-tutorial', title: 'Tutorial', component: 'TutorialPage' },
    { icon: 'custom-settings', title: 'Settings', component: 'SettingsPage' },
    { icon: 'custom-about', title: 'About', component: 'ContentPage' },
    { icon: 'custom-logout', title: 'Logout', component: 'LoginPage' }
  ]

  constructor(private deviceService: DeviceDetectorService, private device: Device, private translate: TranslateService, private properties: Properties, platform: Platform, settings: Settings, private config: Config, private statusBar: StatusBar, private splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
    this.initTranslate();

    this.activePage = this.pages[0];

    this.user = JSON.parse(localStorage.getItem('_username'))

    this.deviceDetails(); 

  }

  /**
* @desc retrieve device information from the device 
* @param  
* @author Jaje thananjaje3@gmail.com
* @return 
*/
  deviceDetails() {
    console.log('hello `Home` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    console.log(this.deviceInfo);
    console.log(this.deviceInfo.userAgent);
    console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
    console.log(isTablet);  // returns if the device us a tablet (iPad etc)
    console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
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
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
    this.activePage = page;
  }

  /**
  * @desc checks and returns the current active page
  * @param 
  * @author Jaje thananjaje3@gmail.com
  * @return page which is active
*/
  checkActive(page) {
    //get active page [logic]
    return page == this.activePage;
  }

}
