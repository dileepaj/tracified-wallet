import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingFormPage } from './setting-form';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SettingFormPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingFormPage),
    TranslateModule.forChild()
  ],
})
export class SettingFormPageModule {}
