import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  public loginRes: any;
  loading: any;
  constructor(
    public authService: AuthService,
    public loadingController: LoadingController,
    private fb: FormBuilder,
    private router: Router) {
    this.loginForm = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  ngOnInit() { }

  async login() {
    console.log(this.loginForm.value);
    // const loading = await this.loadingController.create({'content':'dsa';});
    // await loading.present();
    await this.authService.login(this.loginForm.value)
      .subscribe(res => {
        console.log(res);
        this.loginRes = res;
        if (res.success === true) {
          console.log('Logged In...');

          this.router.navigate(['/home']);
        }
        // loading.dismiss();
      }, err => {
        console.log(err);
        // loading.dismiss();
      });

  }

}
