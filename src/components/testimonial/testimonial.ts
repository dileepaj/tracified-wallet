import { Component, Input } from '@angular/core';
import { ViewTestimonialComponent } from '../../components/view-testimonial/view-testimonial';
import { ActionSheetController, ModalController, NavController } from 'ionic-angular';
import { Testimonial } from '../../shared/models/testimonial';
import { Properties } from '../../shared/properties';
import { Transaction } from 'stellar-base';

@Component({
  selector: 'testimonial',
  templateUrl: 'testimonial.html'
})
export class TestimonialComponent {
  @Input() updateCallback: (testimonial: Testimonial, status: string) => void;
  @Input() testimonial: Testimonial;
  @Input() isRequest: boolean;

  text: string;
  expiredTime: string;
  constructor(
    public actionSheetCtrl: ActionSheetController,
    public modalCtrl: ModalController,
    public properties: Properties,
    public navCtrl: NavController
  ) { }

  ngOnInit() {
    this.fetchExpirationTime()
  }


  fetchExpirationTime(){
    const transaction = new Transaction(this.testimonial.AcceptXDR);
    let maxTime = new Date(transaction.timeBounds.maxTime * 1000);
    this.expiredTime = maxTime.toLocaleString()
  }


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
