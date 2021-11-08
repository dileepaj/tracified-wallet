import { Component, Input } from '@angular/core';
import { ActionSheetController, NavController } from 'ionic-angular';
import { Organization } from '../../shared/models/organization';

@Component({
  selector: 'organization',
  templateUrl: 'organization.html'
})
export class OrganizationComponent {
  @Input() addTestimonialPage: (receiverPK: string) => void;
  @Input() organization: Organization;
  @Input() isRequest: boolean;

  text: string;

  constructor(public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController) {
    this.text = 'Hello World';
  }

  showAddTestimonialPage(receiverPK: string) {
    this.addTestimonialPage(receiverPK);
  }

  presentActionSheet() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Contact',
      buttons: [
        {
          text: 'Call',
          handler: () => {
            console.log('Destructive clicked');
          }
        },
        {
          text: 'Send Email',
          handler: () => {
            console.log('Archive clicked');
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
