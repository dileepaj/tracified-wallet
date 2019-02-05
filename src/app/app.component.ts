import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateService } from '@ngx-translate/core';
import { Config, Nav, Platform } from 'ionic-angular';

import { FirstRunPage } from '../pages';
import { Settings } from '../providers';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  activePage: any;
  rootPage = FirstRunPage;
  company = 'Tracified Wallet';
  userType = 'Admin' 
  user = 'jack';
  
  @ViewChild(Nav) nav: Nav;

  pages: any[] = [
    { icon: 'custom-itemIcon', title: 'Items', component: 'TabsPage' },
    { icon: 'custom-blockchain', title: 'Accounts', component: 'BcAccountPage' },
    { icon: 'custom-tutorial', title: 'Tutorial', component: 'TutorialPage' },
    { icon: 'custom-settings', title: 'Settings', component: 'SettingsPage' },
    { icon: 'custom-about', title: 'About', component: 'ContentPage' },
    { icon: 'custom-logout', title: 'Logout', component: 'LoginPage' }
  ] 

  constructor(private translate: TranslateService, platform: Platform, settings: Settings, private config: Config, private statusBar: StatusBar, private splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
    this.initTranslate();

    // console.log(this.nav.getActive().name);
    
    this.activePage = this.pages[0];
    // ;

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

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
    this.activePage = page;
  }

  checkActive(page){
    return page == this.activePage;
  }

}
