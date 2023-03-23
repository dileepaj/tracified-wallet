import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { LoginPage } from './login';
import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { TabsPageModule } from '../tabs/tabs.module';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    LoginPage
  ],

  imports: [
    TabsPageModule,
    IonicModule
  ],
  exports: [
    LoginPage
  ],
  providers: [ConnectivityServiceProvider],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPageModule { }
