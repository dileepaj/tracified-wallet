import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { IonicPageModule } from 'ionic-angular';
import { OrganizationRegisteredPage } from './organization-registered';

@NgModule({
  declarations: [
    OrganizationRegisteredPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(OrganizationRegisteredPage),
    TranslateModule.forChild()
  ],
})
export class OrganizationRegisteredPageModule {}
