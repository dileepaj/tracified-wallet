import { Component, Input } from '@angular/core';
import { ViewTestimonialComponent } from '../../components/view-testimonial/view-testimonial';
import { ActionSheetController, ModalController, NavController } from 'ionic-angular';
import { Testimonial } from '../../shared/models/testimonial';
import { Properties } from '../../shared/properties';

@Component({
  selector: 'testimonial',
  templateUrl: 'testimonial.html'
})
export class TestimonialComponent {
  @Input() updateCallback: (testimonial: Testimonial, status: string) => void;
  @Input() testimonial: Testimonial;
  @Input() isRequest: boolean;

  text: string;

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    public properties: Properties,
    public navCtrl: NavController
  ) { }

  viewTestimonial() {
    const viewModal = this.modalCtrl.create(ViewTestimonialComponent, {
      testimonial: this.testimonial,
      viewType: this.testimonial.Sender == this.properties.defaultAccount.pk ? "sent" : "received"
    });
    viewModal.present();
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
