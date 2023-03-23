import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { LoggerService } from '../logger-service/logger.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { Properties } from 'src/app/shared/properties';
import { FileSystemService } from '../file-service/file-system-service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
   providedIn: 'root',
})
export class InitializerService {
   constructor(private platform: Platform, private logger: LoggerService,
    private properties: Properties,
    private fileSystem: FileSystemService,
    private translate: TranslateService
    ) {}

   init(): Promise<void> {
      this.platform.ready().then(() => {
         StatusBar.setStyle({ style: Style.Light });
         SplashScreen.hide();
         //v6 codepush implementation
         this.properties.skipConsoleLogs = false;
         this.properties.writeToFile = true;
         this.logger.init(this.fileSystem).then(status => this.logger.debug('[Logger] init: ' + status));
      });

      this.initTranslate();
      return Promise.resolve();

      // v6 subscribe to events
      // this.events.subscribe('dislayName', name => {
      //    this.user = name;
      // });
      // this.events.subscribe('company', company => {
      //    this.company = company;
      // });
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
      // v6 this.config.set('ios', 'backButtonText', values.BACK_BUTTON_TEXT);
    });
  }
}


