import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

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
import { LoginPage } from './pages/login/login';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Properties } from './shared/properties';
import { InitializerService } from './providers/initializer/initializer.service';
import { FileSystemService } from './providers/file-service/file-system-service';

@NgModule({
   declarations: [AppComponent, GetNftPage, PagesLoadSvgPage, TabsPage, LoginPage],
   imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FormsModule, ReactiveFormsModule, ReactiveFormsModule, HttpClientModule, FormsModule,
      TranslateModule.forRoot({
         loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient],
         },
      }),
   ],
   providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      { provide: APP_INITIALIZER,useFactory: initializeApp, deps: [InitializerService], multi: true},
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
   ],
   bootstrap: [AppComponent],
})
export class AppModule {}


export function createTranslateLoader(http: HttpClient) {
   return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export function initializeApp(initializerService: InitializerService) {
   return (): Promise<any> => { 
     return initializerService.init();
   }
 }