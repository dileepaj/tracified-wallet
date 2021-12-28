import { Component, Input } from '@angular/core';
import { ViewOrganizationComponent } from '../view-organization/view-organization';
import { ActionSheetController, ModalController, NavController } from 'ionic-angular';
import { Organization } from '../../shared/models/organization';
import { CallNumber } from '@ionic-native/call-number';

@Component({
  selector: 'organization',
  templateUrl: 'organization.html'
})
export class OrganizationComponent {
  @Input() addTestimonialPage: (receiver: any) => void;
  @Input() viewOrganizationPage: (organization: Organization) => void;
  @Input() updateCallback: (organization: Organization, status: string) => void;
  @Input() organization: Organization;
  @Input() isRequest: boolean;
  @Input() isRegistered: boolean;

  text: string;

  constructor (
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    public callNumber: CallNumber,
    public navCtrl: NavController
  ) {
    this.text = 'Hello World';
  }

  showAddTestimonialPage(receiver: any) {
    this.addTestimonialPage(receiver);
  }
  
  viewOrganization() {
    const viewModal = this.modalCtrl.create(ViewOrganizationComponent, {
      organization: this.organization
    });
    viewModal.present();
  }

  updateOrganization(organization: Organization, status: string) {
    this.updateCallback(organization, status)
  }

  callPhoneOrMobile(contactNumber: string) {
    if (contactNumber && contactNumber !== "") {
       this.callNumber.callNumber(contactNumber, true)
          .then(res => console.log('Launched dialer!', res))
          .catch(err => console.log('Error launching dialer', err));
    }
  }

  presentActionSheet() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Contact',
      buttons: [
        {
          text: 'Call',
          handler: () => {
            this.callPhoneOrMobile(this.organization.Phone)
          }
        },
        {
          text: 'Send Email',
          handler: () => {
            
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

}
