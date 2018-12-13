import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransferPage } from './transfer';
import { TranslateModule } from '@ngx-translate/core';
import { Items } from '../../providers/items/items';

@NgModule({
  declarations: [
    TransferPage,
  ],
  imports: [
    IonicPageModule.forChild(TransferPage),
    TranslateModule.forChild()

  ],  providers: [
    Items,
  ]
})
export class TransferPageModule {}
