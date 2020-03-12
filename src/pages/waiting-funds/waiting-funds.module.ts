import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaitingFundsPage } from './waiting-funds';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    WaitingFundsPage,
  ],
  imports: [
    IonicPageModule.forChild(WaitingFundsPage),
    TranslateModule.forChild()
  ],
})
export class WaitingFundsPageModule {}
