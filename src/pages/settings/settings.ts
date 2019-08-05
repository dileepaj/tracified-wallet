import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
//import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { LoginPageModule } from '../login/login.module';
import { User } from 'providers';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import {SettingsProfilePage } from '../settings-profile/settings-profile';
import { Camera, CameraOptions } from '@ionic-native/camera';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})

export class SettingsPage {
  user: any;
  myphoto: string;
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController,
    private events: Events,   private authService: AuthServiceProvider, private camera: Camera) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  changeTransactionPwd() {
     this.navCtrl.push('AddAccountPage', {});
  }

  profileImageOption() {
    let alert = this.alertCtrl.create({
      title: 'Change Profile Image',
      buttons: [
        {
          text: 'Take a picture using camera',
          role: 'camera-picture',
          handler: data => {
           this.switchCamPic();
          }
        },
        {
          text: 'Open gallery',
          role: 'open-gallery',
          handler: data => {
           this.switchOpenGal();
          }
        }
      ]
    });
    alert.present();
  }

  switchCamPic(){
    const options: CameraOptions = {
    quality: 70,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
    this.myphoto = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
    // Handle Error
    });
  }

  switchOpenGal(){
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      saveToPhotoAlbum:false,
      allowEdit:true,
      targetWidth:300,
      targetHeight: 300
      }
  
      this.camera.getPicture(options).then((imageData) => {
      this.myphoto = 'data:image/jpeg;base64,' + imageData;
      }, (err) => {
      // Handle Error
      });
  }

  settingOptionClick(){
    this.navCtrl.push('SettingsProfilePage', {});
  }

  settingNameClick() {
    this.navCtrl.push('SettingsProfilePage', {});
  }

  settingPasswordClick(){
    this.navCtrl.push('SettingsProfilePage', {});
  }

}


