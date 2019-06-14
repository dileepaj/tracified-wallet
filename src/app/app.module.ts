import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
// import { Device } from 'ionic-native';
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';


// import { Items } from '../mocks/providers/items';
import { User, Api } from '../providers';
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
import { StorageServiceProvider } from '../providers/storage-service/storage-service';
import { LoginPageModule } from '../pages/login/login.module';
import { MappingServiceProvider } from '../providers/mapping-service/mapping-service';
import { IonicLoggerModule, Logger } from 'ionic-logger';
import { FileSystemServiceProvider } from '../providers/file-service/file-system-service';
import {File} from '@ionic-native/file';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp
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
    LoginPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp),
    IonicLoggerModule.forRoot({
      docDir: 'Tracified',
      logDir: 'Tracified-Officer',
      logRetentionDays: 1,
      debug: true,
      printDebugMessages: true,
      logTofle:true
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    Api,
    Properties,
    Network,
    User,
    Device,
    DeviceDetectorService,
    Camera,
    SplashScreen,
    StatusBar,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ConnectivityServiceProvider,
    AuthServiceProvider,
    StorageServiceProvider,
    MappingServiceProvider,
    Logger,
    FileSystemServiceProvider,
    File
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
