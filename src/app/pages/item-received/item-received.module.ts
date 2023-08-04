import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ItemReceivedPage } from './item-received';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
   imports: [TranslateModule, IonicModule, RouterModule.forChild([{ path: '', component: ItemReceivedPage }]), CommonModule, FormsModule],
   declarations: [ItemReceivedPage],
   exports: [ItemReceivedPage],
})
export class ItemReceivedPageModule {}
