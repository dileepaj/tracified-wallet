import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ItemSentPage } from './item-sent';
import { CommonModule } from '@angular/common';

@NgModule({
   imports: [TranslateModule, IonicModule, RouterModule.forChild([{ path: '', component: ItemSentPage }]), CommonModule],
   declarations: [ItemSentPage],
   exports: [ItemSentPage],
})
export class ItemSentPageModule {}
