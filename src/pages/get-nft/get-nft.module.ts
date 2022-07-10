import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GetNftPage } from './get-nft';

@NgModule({
  declarations: [
    GetNftPage,
  ],
  imports: [
    IonicPageModule.forChild(GetNftPage),
  ],
  exports: [
    GetNftPage
  ],
})
export class GetNftPageModule {}
