import { NgModule } from '@angular/core';
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

@NgModule({
   declarations: [AppComponent, GetNftPage, PagesLoadSvgPage, TabsPage],
   imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
   providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      ApiServiceProvider,
      AuthServiceProvider,
      LoggerService,
      EventsService,
      MappingServiceProvider,
      StorageServiceProvider,
      ConnectivityServiceProvider,
      BlockchainServiceProvider,
      DataServiceProvider,
      Items,
   ],
   bootstrap: [AppComponent],
})
export class AppModule {}
