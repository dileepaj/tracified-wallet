import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateNftPage } from './create-nft';

@NgModule({
  declarations: [
    CreateNftPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateNftPage),
  ],
})
export class CreateNftPageModule {}
