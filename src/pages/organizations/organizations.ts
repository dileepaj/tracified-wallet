import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController} from 'ionic-angular';
import { OrganizationRegisteredPage } from './organization-registered/organization-registered';
import { OrganizationRequestsPage } from './organization-requests/organization-requests';

@IonicPage()
@Component({
  selector: 'page-organizations',
  templateUrl: 'organizations.html',
})
export class OrganizationsPage {

  registeredTab: any = OrganizationRegisteredPage;
  requestsTab: any = OrganizationRequestsPage;

  public tab1Title: string = " ";
  public tab2Title: string = " ";

  constructor(public navCtrl: NavController, public translateService: TranslateService) {
    this.tab1Title = '';
    this.tab2Title = '';
  }


}
