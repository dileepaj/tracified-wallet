import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddOrganizationPage } from './add-organization';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddOrganizationPage,
  ],
  imports: [
    IonicPageModule.forChild(AddOrganizationPage),
    TranslateModule.forChild()
  ],
})
export class AddOrganizationPageModule {}
