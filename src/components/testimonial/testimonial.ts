import { Component, Input } from '@angular/core';
import { ActionSheetController, NavController } from 'ionic-angular';
import { Testimonial } from '../../shared/models/testimonial';

@Component({
  selector: 'testimonial',
  templateUrl: 'testimonial.html'
})
export class TestimonialComponent {
  @Input() testimonial: Testimonial;
  @Input() isRequest: boolean;

  text: string;

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController
  ) { }

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
