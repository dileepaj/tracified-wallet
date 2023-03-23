import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TabsPage } from './tabs';

@NgModule({
  declarations: [
    TabsPage
  ],
  imports: [
    IonicModule,
    TranslateModule.forChild()
  ],
  exports: [
    TabsPage
  ]
})
export class TabsPageModule { }
