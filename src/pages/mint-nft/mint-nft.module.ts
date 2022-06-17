import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MintNftPage } from './mint-nft';


@NgModule({
  declarations: [
    MintNftPage,
  ],
  imports: [
    IonicPageModule.forChild(MintNftPage),
  ],
  exports: [
    MintNftPage
  ],
})
export class MintNftPageModule {}
