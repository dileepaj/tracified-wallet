import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TransferPage } from './transfer';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
   imports: [TranslateModule, IonicModule, RouterModule.forChild([{ path: '', component: TransferPage }]), CommonModule, FormsModule],
   declarations: [TransferPage],
   exports: [TransferPage],
})
export class TransferPageModule {}
