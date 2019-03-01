import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule, Storage } from '@ionic/storage';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
// import { Device } from 'ionic-native';
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';


// import { Items } from '../mocks/providers/items';
import { Settings, User, Api } from '../providers';
import { MyApp } from './app.component';
import { ItemReceivedPageModule } from '../pages/item-received/item-received.module';
import { ItemSentPageModule } from '../pages/item-sent/item-sent.module';
import { ConnectivityServiceProvider } from '../providers/connectivity-service/connectivity-service';
import { Network } from '@ionic-native/network';
import { ResetPasswordPageModule } from '../pages/reset-password/reset-password.module';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { TabsPageModule } from '../pages/tabs/tabs.module';
import { AddAccountPageModule } from '../pages/add-account/add-account.module';
import { Properties } from '../shared/properties';
import { SelectSearchableModule } from '../components/search-dropdown/select-module';
import { IonicSelectableModule } from 'ionic-selectable';
import { ItemDetailPageModule } from '../pages/item-detail/item-detail.module';
import { Device } from '@ionic-native/device/ngx';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage: Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Settings(storage, {
    option1: true,
    option2: 'Ionitron J. Framework',
    option3: '3',
    option4: 'Hello'
  });
}

@NgModule({
  declarations: [
    MyApp,
    
  ],
  imports: [
    BrowserModule, 
    IonicSelectableModule,
    HttpClientModule,
    SelectSearchableModule,
    ResetPasswordPageModule,
    ItemReceivedPageModule,
    ItemDetailPageModule,
    TabsPageModule,
    DeviceDetectorModule.forRoot(),
    AddAccountPageModule,
    ItemSentPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    Api,
    Properties,
    Network, 
    // Items,
    User,
    Device,
    DeviceDetectorService,
    Camera,
    SplashScreen,
    StatusBar,
    { provide: Settings, useFactory: provideSettings, deps: [Storage] },
    // Keep this to enable Ionic's runtime error handling during development
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConnectivityServiceProvider,
    AuthServiceProvider
  ]
})
export class AppModule { }
