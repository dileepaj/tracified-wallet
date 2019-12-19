import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FundTransferPage } from './fund-transfer';
import { SelectSearchableModule } from '../../components/search-dropdown/select-module';

@NgModule({
  declarations: [
    FundTransferPage,
  ],
  imports: [
    IonicPageModule.forChild(FundTransferPage),
    SelectSearchableModule,
  ],
})
export class FundTransferPageModule {}
