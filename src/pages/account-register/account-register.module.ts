import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountRegisterPage } from './account-register';

@NgModule({
  declarations: [
    AccountRegisterPage,
  ],
  imports: [
    IonicPageModule.forChild(AccountRegisterPage),
    TranslateModule.forChild()
  ],
})
export class AccountRegisterPageModule {}
