import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransferConfirmPage } from './transfer-confirm';

@NgModule({
  declarations: [
    TransferConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(TransferConfirmPage),
  ],
  exports: [
    TransferConfirmPage
  ]
})
export class TransferConfirmPageModule {}
