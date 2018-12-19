import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { LoginPage } from './login';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { TabsPageModule } from '../tabs/tabs.module';
import { TabsPage } from '../tabs/tabs';

@NgModule({
  declarations: [
    LoginPage, 
    // TabsPage
  ],
  // entryComponents: [
  //   TabsPage
  //   ],
  imports: [
    TabsPageModule,
    IonicPageModule.forChild(LoginPage),
    TranslateModule.forChild()
  ],
  exports: [
    LoginPage
  ],
  providers: [ConnectivityServiceProvider],
})
export class LoginPageModule { }
