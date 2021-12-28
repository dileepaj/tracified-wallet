import { Component } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number';
import { LoadingController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { Organization } from '../../shared/models/organization';
import { Testimonial } from '../../shared/models/testimonial';

@Component({
   selector: 'view-testimonial',
   templateUrl: 'view-testimonial.html'
})
export class ViewTestimonialComponent {

   public testimonial: Testimonial;
   public loadingModal: any;
   public isLoading: boolean;
   public isEmpty: boolean;

   public senderOrReceiver: Organization;
   public senderOrReceiverKey: string;
   public viewType: string;

   constructor(
      public navParams: NavParams,
      private loadingCtrl: LoadingController,
      private viewCtrl: ViewController,
      private toastCtrl: ToastController,
      private dataService: DataServiceProvider,
      private callNumber: CallNumber,
   ) {
      this.testimonial = this.navParams.get("testimonial");
      // Based on view type snet or recieived the view will be changed
      this.viewType = this.navParams.get("viewType")
      this.senderOrReceiverKey = this.navParams.get("viewType") == 'sent' ? this.testimonial.Reciever : this.testimonial.Sender;
   }

   ionViewDidLoad() {
      this.fetchAuthor();
   }

   fetchAuthor() {
      this.presentLoading();
      this.dataService.getOrganization(this.senderOrReceiverKey).then(res => {
         const data: Organization = res.body;
         this.senderOrReceiver = data;
         this.dissmissLoading();
      }).catch((err) => {
         console.log(err);
         this.dissmissLoading();
      })
   }

   callPhoneOrMobile(contactNumber: string) {
      if (contactNumber && contactNumber !== "") {
         this.callNumber.callNumber(contactNumber, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
      }
   }

   presentLoading() {
      this.isLoading = true;
      this.loadingModal = this.loadingCtrl.create({
         dismissOnPageChange: false
      });

      this.loadingModal.present();
   }

   dissmissLoading() {
      this.isLoading = false;
      this.loadingModal.dismiss();
   }

   disMissView() {
      this.viewCtrl.dismiss();
   }

   presentToast(message: string) {
      let toast = this.toastCtrl.create({
         message: message,
         duration: 2000,
         position: 'bottom'
      });
      toast.present();
   }
}
