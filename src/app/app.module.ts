import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicSelectableModule } from 'ionic-selectable';

// pages
import { GetNftPage } from './pages/get-nft/get-nft';
import { PagesLoadSvgPage } from './pages/pages-load-svg/pages-load-svg';
import { TabsPage } from './pages/tabs/tabs';
import { ApiServiceProvider } from './providers/api-service/api-service';
import { AuthServiceProvider } from './providers/auth-service/auth-service';
import { LoggerService } from './providers/logger-service/logger.service';
import { EventsService } from './providers/event-service/events.service';
import { MappingServiceProvider } from './providers/mapping-service/mapping-service';
import { StorageServiceProvider } from './providers/storage-service/storage-service';
import { ConnectivityServiceProvider } from './providers/connectivity-service/connectivity-service';
import { BlockchainServiceProvider } from './providers/blockchain-service/blockchain-service';
import { DataServiceProvider } from './providers/data-service/data-service';
import { Items } from './providers/items/items';
import { Properties } from './shared/properties';
import { OtpPage } from './pages/otp/otp';
import { MintNftPage } from './pages/mint-nft/mint-nft';
import { GetKeysPage } from './pages/get-keys/get-keys';

import { LoginPage } from './pages/login/login';
import { InitializerService } from './providers/initializer/initializer.service';
import { FileSystemService } from './providers/file-service/file-system-service';
import { CommonModule } from '@angular/common';
import { BcAccountPage } from './pages/bc-account/bc-account';
import { AddAccountPage } from './pages/add-account/add-account';
import { AccountDetailsPage } from './pages/account-details/account-details.page';
import { FundTransferPage } from './pages/fund-transfer/fund-transfer.page';
import { TransferConfirmPage } from './pages/transfer-confirm/transfer-confirm.page';
import { OtpNtfComponent } from './pages/otp-ntf/otp-ntf.component';
import { ResetPasswordPage } from './pages/reset-password/reset-password';
import { ContentPage } from './pages/content/content';
import { HelpPage } from './pages/help-support/help';
import { SettingsPage } from './pages/settings/settings';
import { SettingFormPage } from './pages/setting-form/setting-form';
import { ItemSentPageModule } from './pages/item-sent/item-sent.module';
import { TransferPageModule } from './pages/transfer/transfer.module';
import { ItemReceivedPageModule } from './pages/item-received/item-received.module';
import { ItemDetailPage } from './pages/item-detail/item-detail';
import { AccountInfoPage } from './pages/account-info/account-info';
import { TransferPage } from './pages/transfer/transfer';
import { ItemReceivedPage } from './pages/item-received/item-received';
import { ItemSentPage } from './pages/item-sent/item-sent';
import { CreateAccountPage } from './pages/create-account/create-account.page';
import { SeedPhraseService } from './providers/seedPhraseService/seedPhrase.service';
import { RequestDeletePage } from './pages/request-delete/request-delete.page';
import { HelpPopupComponent } from './pages/help-popup/help-popup.component';
import { CreateImportBcAccountPage } from './pages/create-import-bc-account/create-import-bc-account.page';
import { ImportBcAccountPage } from './pages/import-bc-account/import-bc-account.page';
import { BcAccountCreatedPage } from './pages/bc-account-created/bc-account-created.page';

export function createTranslateLoader(http: HttpClient) {
   return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
   declarations: [
      AppComponent,
      GetNftPage,
      PagesLoadSvgPage,
      TabsPage,
      OtpPage,
      MintNftPage,
      GetNftPage,
      GetKeysPage,
      LoginPage,
      GetNftPage,
      BcAccountPage,
      AddAccountPage,
      AccountDetailsPage,
      FundTransferPage,
      TransferConfirmPage,
      OtpNtfComponent,
      ResetPasswordPage,
      ContentPage,
      HelpPage,
      SettingsPage,
      SettingFormPage,
      ItemDetailPage,
      AccountInfoPage,
      CreateAccountPage,
      RequestDeletePage,
      HelpPopupComponent,
      CreateImportBcAccountPage,
      ImportBcAccountPage,
      BcAccountCreatedPage,
      // TransferPage,
      // ItemReceivedPage,
      // ItemSentPage,
   ],
   imports: [
      BrowserModule,
      IonicModule.forRoot({}),
      AppRoutingModule,
      HttpClientModule,
      FormsModule,
      ReactiveFormsModule,
      CommonModule,
      TranslateModule.forRoot({
         loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient],
         },
      }),
      ItemSentPageModule,
      TransferPageModule,
      ItemReceivedPageModule,
      IonicSelectableModule,
   ],
   providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [InitializerService], multi: true },
      Properties,
      ApiServiceProvider,
      AuthServiceProvider,
      LoggerService,
      EventsService,
      MappingServiceProvider,
      StorageServiceProvider,
      ConnectivityServiceProvider,
      BlockchainServiceProvider,
      DataServiceProvider,
      FileSystemService,
      Items,
      Properties,
      SeedPhraseService,
   ],
   bootstrap: [AppComponent],
   exports: [MintNftPage],
})
export class AppModule {}

export function initializeApp(initializerService: InitializerService) {
   return (): Promise<any> => {
      return initializerService.init();
   };
}
