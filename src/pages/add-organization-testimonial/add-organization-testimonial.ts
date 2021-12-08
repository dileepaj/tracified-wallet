import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController, AlertController, IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { Logger } from 'ionic-logger-new';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { AccountServiceProvider } from '../../providers/account-service/account-service';
import { BlockchainServiceProvider } from '../../providers/blockchain-service/blockchain-service';
import { Testimonial } from '../../shared/models/testimonial';
import { Properties } from '../../shared/properties';
import { TestimonialsPage } from '../../pages/testimonials/testimonials';


@IonicPage()
@Component({
   selector: 'page-add-organization-testimonial',
   templateUrl: 'add-organization-testimonial.html',
})
export class AddOrganizationTestimonialPage {
   
   public testimonialForm: FormGroup;
   public testimonialPicture: string;
   public defaultAccSK: string;
   
   public loadingModal: any;
   public isLoading: boolean;

   constructor(
      public navCtrl: NavController,
      private camera: Camera,
      public translate: TranslateService,
      private actionSheetCtrl: ActionSheetController,
      private toastCtrl: ToastController,
      private logger: Logger,
      private dataService: DataServiceProvider,
      private alertCtrl: AlertController,
      private blockchainService: BlockchainServiceProvider,
      private accountService: AccountServiceProvider,
      private file: File,
      private loadingCtrl: LoadingController,
      private properties: Properties,
      public navParams: NavParams
   ) {
      this.testimonialForm = new FormGroup({
         recieverOrg: new FormControl(this.navParams.get("receiver"), Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         testimonialTitle: new FormControl('', Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
         testimonialDescription: new FormControl('', Validators.compose([Validators.minLength(4), Validators.maxLength(64), Validators.required])),
      });
   }

   ionViewDidLoad() {
      console.log(this.properties)
      console.log('ionViewDidLoad AddOrganizationTestimonialPage');
   }

   /**
     * Send Testimonial to
     * registered Organization
     */
   sendTestimonial() {
      if (this.testimonialForm.valid && this.testimonialPicture && this.testimonialPicture !== "") {
         this.presentLoading()
         this.passwordPrompt().then((password) => {
            this.blockchainService.validateTransactionPassword(password, this.properties.defaultAccount.sk, this.properties.defaultAccount.pk)
               .then((secKey) => {
                  this.defaultAccSK = secKey;

                  this.blockchainService.preparesubAccount(this.defaultAccSK).then((subAccount: any) => {
                     const subAccountPair = this.blockchainService.getSubAccountPair(subAccount.publicKey, this.properties.defaultAccount);
                     const xdrPayload = {
                        Name: this.properties.company,
                        Title: this.testimonialForm.get("testimonialTitle").value,
                        Description: this.testimonialForm.get("testimonialDescription").value,
                     }
                     const receiverPk = this.testimonialForm.get("recieverOrg").value
                     this.accountService.buildProofHash(xdrPayload, this.defaultAccSK, receiverPk).then((proofHash: any) => {
                        let hashResponse = proofHash;
                        Promise.all([
                           this.accountService.buildAcceptXDR(xdrPayload, hashResponse, subAccount, this.defaultAccSK, receiverPk), // tracSuperAcc - Adding Tracified Super Acc as Signer
                           this.accountService.buildRejectXDR(hashResponse, subAccount, this.defaultAccSK, receiverPk), // tracSuperAcc - Adding Tracified Super Acc as Signer
                        ]).then((xdrs: any) => {
                           const testimonalPayload: Testimonial = {
                              Sender: this.properties.defaultAccount.pk,
                              Reciever: receiverPk,
                              AcceptTxn: "",
                              AcceptXDR: xdrs[0].b64,
                              RejectTxn: "",
                              RejectXDR: xdrs[1].b64,
                              TxnHash: "",
                              SubAccount: subAccountPair.publicKey(),
                              SequenceNo: "",
                              Status: "pending",
                              Testimonial: {
                                 Name: this.properties.company,
                                 Title: this.testimonialForm.get("testimonialTitle").value,
                                 Description: this.testimonialForm.get("testimonialDescription").value,
                                 Image: this.testimonialPicture
                              }
                           }
                           this.dataService.sendTestimonial(testimonalPayload).then((res) => {
                              this.dissmissLoading();
                              this.translate.get(['SUCCESS', 'TESTIMONIAL_REQUEST_SUCCESS']).subscribe(text => {
                                 this.presentAlert(text['SUCCESS'], text['TESTIMONIAL_REQUEST_SUCCESS']);
                              });
                              this.logger.info("Testimonial sent successfully!: ", this.properties.skipConsoleLogs, this.properties.writeToFile);
                              this.navCtrl.setRoot(TestimonialsPage);
                           }).catch((registerError: any) => {
                              this.dissmissLoading();
                              this.translate.get(['ERROR', 'TESTIMONIAL_REQUEST_FAILED']).subscribe(text => {
                                 this.presentAlert(text['ERROR'], text['TESTIMONIAL_REQUEST_FAILED']);
                              });
                              this.logger.error("Testimonial failed to send: " + JSON.stringify(registerError), this.properties.skipConsoleLogs, this.properties.writeToFile);
                           })
                        }).catch((buildError: any) => {
                           this.dissmissLoading();
                           this.translate.get(['ERROR', 'FAILED_TO_BUILD_TRANSACTION']).subscribe(text => {
                              this.presentAlert(text['ERROR'], text['FAILED_TO_BUILD_TRANSACTION']);
                           });
                           this.logger.error("XDR builders failed: " + JSON.stringify(buildError), this.properties.skipConsoleLogs, this.properties.writeToFile);
                        })
                     }).catch((proofError: any) => {
                        this.dissmissLoading();
                        this.translate.get(['ERROR', 'FAILED_TO_VERIFY_TRANSC']).subscribe(text => {
                           this.presentAlert(text['ERROR'], text['FAILED_TO_VERIFY_TRANSC']);
                        });
                        this.logger.error("Verify Testimonial failed - Build Proof: " + JSON.stringify(proofError), this.properties.skipConsoleLogs, this.properties.writeToFile);
                     })
                  }).catch((subAccError: any) => {
                     this.dissmissLoading();
                     this.translate.get(['ERROR', 'FAILED_TO_PREPARE_TRANSACTION', 'PENDING_TRANSACTION_ERROR']).subscribe(text => {
                        if (subAccError == "pendingTransacExist") {
                           this.presentAlert(text['ERROR'], text['PENDING_TRANSACTION_ERROR']);
                        } else {
                           this.presentAlert(text['ERROR'], text['FAILED_TO_PREPARE_TRANSACTION']);
                        }
                     });
                     this.logger.error("Preparing sub account failed: " + JSON.stringify(subAccError), this.properties.skipConsoleLogs, this.properties.writeToFile);
                  })
               }).catch((passwordError: any) => {
                  this.dissmissLoading();
                  this.translate.get(['ERROR', 'INVALID_TRANSACTION_PASSWORD']).subscribe(text => {
                     this.presentAlert(text['ERROR'], text['INVALID_TRANSACTION_PASSWORD']);
                  });
                  this.logger.error("Password validation failed: " + JSON.stringify(passwordError), this.properties.skipConsoleLogs, this.properties.writeToFile);
               })
         })
      }
   }

   passwordPrompt(): Promise<any> {
      return new Promise((resolve, reject) => {
         let alert = this.alertCtrl.create({
            title: 'Transaction Password',
            inputs: [
               {
                  name: 'password',
                  type: 'password',
                  placeholder: 'Password...'
               }
            ],
            buttons: [
               {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: () => {
                     this.dissmissLoading()
                  }
               },
               {
                  text: 'Submit',
                  handler: data => {

                     if (data.password) {
                        resolve(data.password);
                     } else {
                        console.log("Empty Password");
                     }

                  }
               },
            ]
         });
         alert.present();
      });
   }

   uploadImage() {
      this.translate
         .get(["imageSourceHeader", "camera", "album", "cancel"])
         .subscribe((text) => {
            let actionSheet = this.actionSheetCtrl.create({
               title: text["imageSourceHeader"],
               buttons: [
                  {
                     text: text["camera"],
                     role: "destructive",
                     icon: "camera",
                     handler: () => {
                        this.takePicture("camera");
                     },
                  },
                  {
                     text: text["album"],
                     role: "destructive",
                     icon: "photos",
                     handler: () => {
                        this.takePicture("album");
                     },
                  },
                  {
                     text: text["cancel"],
                     role: "cancel",
                     icon: "close",
                     handler: () => {
                        console.log("Cancel clicked");
                     },
                  },
               ],
            });
            actionSheet.present();
         });
   }

   takePicture(sourceType: string) {
      let options: any;
      const optionsForAlbum: CameraOptions = {
         quality: 60,
         targetHeight: 800,
         targetWidth: 800,
         destinationType: this.camera.DestinationType.FILE_URI,
         encodingType: this.camera.EncodingType.JPEG,
         mediaType: this.camera.MediaType.PICTURE,
         saveToPhotoAlbum: false,
         correctOrientation: true,
         sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      };

      const optionsForCamera: CameraOptions = {
         quality: 60,
         targetHeight: 800,
         targetWidth: 800,
         destinationType: this.camera.DestinationType.FILE_URI,
         encodingType: this.camera.EncodingType.JPEG,
         mediaType: this.camera.MediaType.PICTURE,
         saveToPhotoAlbum: false,
         correctOrientation: true,
         sourceType: this.camera.PictureSourceType.CAMERA,
      };

      if (sourceType === "camera") {
         options = optionsForCamera;
      } else if (sourceType === "album") {
         options = optionsForAlbum;
      }

      this.camera.getPicture(options).then(
         (imageData) => {

            var tempPhoto: any;
            let pfileName: any;
            let fileName: any;
            let filePath: any;

            if (sourceType === "camera") {
               fileName = imageData.substring(imageData.lastIndexOf("/") + 1);
               filePath = imageData.substring(
                  0,
                  imageData.lastIndexOf("/") + 1
               );

            } else if (sourceType === "album") {
               pfileName = imageData.substring(imageData.lastIndexOf("/") + 1);
               filePath = imageData.substring(
                  0,
                  imageData.lastIndexOf("/") + 1
               );
               fileName = pfileName.split('?').shift();

            }

            console.log(filePath)

            this.file
               .readAsDataURL(filePath, fileName)
               .then((base64) => {
                  console.log(base64)
                  tempPhoto = base64;
                  this.testimonialPicture = tempPhoto;
                  console.log(base64)
               })
               .catch((e) => console.log("err", e));
         },
         (err) => {
            console.log("Error", err);
         }
      );
   }

   presentAlert(title: string, message: string) {
      let alert = this.alertCtrl.create();
      alert.setTitle(title);
      alert.setMessage(message);
      alert.addButton({
         text: 'OK'
      });
      alert.present();
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

   presentToast(message: string) {
      let toast = this.toastCtrl.create({
         message: message,
         duration: 2000,
         position: 'bottom'
      });
      toast.present();
   }

}
