import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ItemSentPage } from './item-sent';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
   imports: [TranslateModule, IonicModule, RouterModule.forChild([{ path: '', component: ItemSentPage }]), CommonModule, ReactiveFormsModule, FormsModule],
   declarations: [ItemSentPage],
   exports: [ItemSentPage],
})
export class ItemSentPageModule {}
