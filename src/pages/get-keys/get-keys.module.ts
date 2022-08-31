import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GetKeysPage } from './get-keys';


@NgModule({
  declarations: [
    GetKeysPage,
  ],
  imports: [
    IonicPageModule.forChild(GetKeysPage),
  ],
  exports: [
    GetKeysPage
  ],
})
export class GetKeysPageModule {}
