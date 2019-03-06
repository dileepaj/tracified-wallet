import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransferPage } from './transfer';
import { TranslateModule } from '@ngx-translate/core';
import { Items } from '../../providers/items/items';
import { ItemDetailPageModule } from '../item-detail/item-detail.module';

@NgModule({
  declarations: [
    TransferPage,
  ],
  imports: [ItemDetailPageModule,
    IonicPageModule.forChild(TransferPage),
    TranslateModule.forChild()

  ],  providers: [
    Items,
  ]
})
export class TransferPageModule {}
