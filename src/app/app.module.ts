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

@NgModule({
  declarations: [AppComponent, GetNftPage, PagesLoadSvgPage, TabsPage],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
