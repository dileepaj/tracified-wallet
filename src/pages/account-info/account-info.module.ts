import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountInfoPage } from './account-info';

@NgModule({
  declarations: [
    AccountInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(AccountInfoPage),
  ],
})
export class AccountInfoPageModule {}
