import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";

/**
 * Generated class for the CameraSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-camera-settings",
  templateUrl: "camera-settings.html"
})
export class CameraSettingsPage {
  public myphoto: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad CameraSettingsPage");
  }

  takePicture(sourceType: number) {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: sourceType
    };

    this.camera.getPicture(options).then(
      imageData => {
        this.myphoto = "data:image/jpeg;base64," + imageData;
      },
      err => {
        // Handle error
      }
    );
  }

  chooseGallery() {
    const options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then(
      imageData => {
        this.myphoto = "data:image/jpeg;base64," + imageData;
      },
      err => {
        // Handle error
      }
    );
  }
}
