import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../../components/components.module';
import { IonicPageModule } from 'ionic-angular';
import { OrganizationRequestsPage } from './organization-requests';

@NgModule({
  declarations: [
    OrganizationRequestsPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(OrganizationRequestsPage),
  ],
})
export class OrganizationRequestsPageModule {}
