import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController, IonicPage, NavController, NavParams } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-add-organization-testimonial',
  templateUrl: 'add-organization-testimonial.html',
})
export class AddOrganizationTestimonialPage {
  public testimonialForm: FormGroup;
  public testimonialPicture: string;

  constructor(
    public navCtrl: NavController,
    private camera: Camera,
    public translate: TranslateService,
    private actionSheetCtrl: ActionSheetController,
    private file: File,
    public navParams: NavParams
  ) {
    this.testimonialForm = new FormGroup({
      recieverOrg: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
      testimonialTitle: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
      testimonialDescription: new FormControl('', Validators.compose([Validators.minLength(4), Validators.required])),
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddOrganizationTestimonialPage');
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

        this.file
          .readAsDataURL(filePath, fileName)
          .then((base64) => {
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

}
