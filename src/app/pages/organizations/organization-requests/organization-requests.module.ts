import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
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
  schemas: [NO_ERRORS_SCHEMA]
})
export class OrganizationRequestsPageModule {}