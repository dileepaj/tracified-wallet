import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';
//import { AuthServiceProvider } from '../providers/auth-service/auth-service';
import { LoginPageModule } from '../login/login.module';
import { User } from 'providers';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';

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
  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController,
    private events: Events,   private authService: AuthServiceProvider) {
      this.events.subscribe('dislayName', (name) => { this.user = name; })
      console.log(this.user);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }


  presentPrompt() {
    let alert = this.alertCtrl.create({
      title: 'Change Password',
      inputs: [
        {
          name: 'currentPassword',
          placeholder: 'Current password',
          type: 'password'
        },
        {
          name: 'newPassword',
          placeholder: 'New password',
          type: 'password'
        },
        {
          name: 'confirmPassword',
          placeholder: 'Confirm password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Enter',
          role: 'enter',
          handler: data => {
            console.log('Enter clicked');
          }
        }
      ]
    });
    alert.present();
  }
}
