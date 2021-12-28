import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { CallNumber } from '@ionic-native/call-number';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx'
// import { Device } from 'ionic-native';
import { DeviceDetectorModule, DeviceDetectorService } from 'ngx-device-detector';


// import { Items } from '../mocks/providers/items';
import { User } from '../providers';
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
import { HelpPage } from '../pages/help-support/help'
import { MappingServiceProvider } from '../providers/mapping-service/mapping-service';
import { ApiServiceProvider } from '../providers/api-service/api-service';
import { IonicLoggerModule, Logger } from 'ionic-logger-new';
import { FileSystemServiceProvider } from '../providers/file-service/file-system-service';
import { File } from '@ionic-native/file';
import { DataServiceProvider } from '../providers/data-service/data-service';
import { BlockchainServiceProvider } from '../providers/blockchain-service/blockchain-service';
import { AccountDetailsPageModule } from '../pages/account-details/account-details.module';
import { AccountInfoPageModule } from '../pages/account-info/account-info.module';
import { BcAccountPageModule } from '../pages/bc-account/bc-account.module';
import { FundTransferPageModule } from '../pages/fund-transfer/fund-transfer.module';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { ContentPageModule } from '../pages/content/content.module';
import { TransferConfirmPageModule } from '../pages/transfer-confirm/transfer-confirm.module';
import { Clipboard } from '@ionic-native/clipboard/index';
import { SettingFormPageModule } from '../pages/setting-form/setting-form.module';
import { TransferPageModule } from '../pages/transfer/transfer.module';
import { CodePushServiceProvider } from '../providers/code-push-service/code-push-service';
import { CodePush } from '@ionic-native/code-push';
import { AccountRegisterPageModule } from '../pages/account-register/account-register.module';
import { AccountServiceProvider } from '../providers/account-service/account-service';
import { OrganizationsPageModule } from '../pages/organizations/organizations.module';
import { OrganizationRequestsPageModule } from '../pages/organizations/organization-requests/organization-requests.module';
import { OrganizationRegisteredPageModule } from '../pages/organizations/organization-registered/organization-registered.module';
import { OrganizationComponent } from '../components/organization/organization';
import { AddOrganizationTestimonialPageModule } from '../pages/add-organization-testimonial/add-organization-testimonial.module';
import { TestimonialsReceievedPageModule } from '../pages/testimonials/testimonials-receieved/testimonials-receieved.module';
import { TestimonialsSentPageModule } from '../pages/testimonials/testimonials-sent/testimonials-sent.module';
import { TestimonialsPageModule } from '../pages/testimonials/testimonials.module';
import { TestimonialServiceProvider } from '../providers/testimonial-service/testimonial-service';
import { TestimonialComponent } from '../components/testimonial/testimonial';
import { ViewOrganizationComponent } from '../components/view-organization/view-organization';
import { ViewTestimonialComponent } from '../components/view-testimonial/view-testimonial';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp, HelpPage
  ],
  imports: [
    BrowserModule,
    AccountDetailsPageModule,
    IonicSelectableModule,
    HttpClientModule,
    SelectSearchableModule,
    AccountInfoPageModule,
    ResetPasswordPageModule,
    ItemReceivedPageModule,
    ItemDetailPageModule,
    TabsPageModule,
    DeviceDetectorModule.forRoot(),
    AddAccountPageModule,
    ItemSentPageModule,
    LoginPageModule,
    BcAccountPageModule,
    SettingsPageModule,
    ContentPageModule,
    SettingFormPageModule,
    TransferPageModule,
    FundTransferPageModule,
    TransferConfirmPageModule,
    AccountRegisterPageModule,
    AddOrganizationTestimonialPageModule,
    OrganizationsPageModule,
    OrganizationRegisteredPageModule,
    OrganizationRequestsPageModule,
    TestimonialsPageModule,
    TestimonialsSentPageModule,
    TestimonialsReceievedPageModule,
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
      logDir: 'Tracified-Wallet',
      logRetentionDays: 1,
      debug: true,
      printDebugMessages: true,
      logToFle: true
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, HelpPage, OrganizationComponent, TestimonialComponent, ViewOrganizationComponent, ViewTestimonialComponent
  ],
  providers: [
    ApiServiceProvider,
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
    File,
    DataServiceProvider,
    BlockchainServiceProvider,
    Clipboard,
    CodePushServiceProvider,
    CodePush,
    InAppBrowser,
    AccountServiceProvider,
    TestimonialServiceProvider,
    CallNumber
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
