import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ItemReceivedPage } from './item-received';
import { TranslateModule } from '@ngx-translate/core';
// import { AccordionListComponent } from '../../components/accordion-list/accordion-list';
import { ComponentsModule } from '../../components/components.module';
import { Items } from '../../providers/items/items';

@NgModule({
  declarations: [
    ItemReceivedPage,
    //  AccordionListComponent
  ],
  imports: [ComponentsModule,
    IonicPageModule.forChild(ItemReceivedPage),
    TranslateModule.forChild()
  ],
  providers: [Items],
})
export class ItemReceivedPageModule {}
