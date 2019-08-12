import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaitingFundsPage } from './waiting-funds';

@NgModule({
  declarations: [
    WaitingFundsPage,
  ],
  imports: [
    IonicPageModule.forChild(WaitingFundsPage),
  ],
})
export class WaitingFundsPageModule {}
