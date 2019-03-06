import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { ItemDetailPage } from './item-detail';
import { Items } from '../../providers/items/items';
import { SelectSearchableModule } from '../../components/search-dropdown/select-module';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    ItemDetailPage,
  ],
  imports: [SelectSearchableModule,
    IonicSelectableModule,
    IonicPageModule.forChild(ItemDetailPage),
    TranslateModule.forChild()
  ],
  exports: [
    ItemDetailPage
  ], 
  providers: [
    Items,
  ]

})
export class ItemDetailPageModule { }
