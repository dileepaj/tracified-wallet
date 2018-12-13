import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemSentPage } from './item-sent';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionListComponent } from '../../components/accordion-list/accordion-list';
import { ComponentsModule } from '../../components/components.module';
import { Items } from '../../providers/items/items';

@NgModule({
  declarations: [
    ItemSentPage,
    // AccordionListComponent
  ],
  imports: [ComponentsModule,
    IonicPageModule.forChild(ItemSentPage),
    TranslateModule.forChild()
  ],
  providers: [Items],
})
export class ItemSentPageModule {}
