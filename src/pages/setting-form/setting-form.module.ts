import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingFormPage } from './setting-form';

@NgModule({
  declarations: [
    SettingFormPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingFormPage),
  ],
})
export class SettingFormPageModule {}
