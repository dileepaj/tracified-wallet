import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountDetailsPage } from './account-details';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AccountDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(AccountDetailsPage),
    TranslateModule.forChild()
  ],
})
export class AccountDetailsPageModule {}
