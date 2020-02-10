import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransferConfirmPage } from './transfer-confirm';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TransferConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(TransferConfirmPage),
    TranslateModule.forChild()
  ],
  exports: [
    TransferConfirmPage
  ]
})
export class TransferConfirmPageModule {}
