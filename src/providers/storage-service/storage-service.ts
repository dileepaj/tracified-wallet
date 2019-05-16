import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as localforage from 'localforage';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable()
export class StorageServiceProvider {

  public profile = localforage.createInstance({
    name: 'profile',
    storeName: 'profile'
  });

  public photo = localforage.createInstance({
    name: 'photo',
    storeName: 'photo'
  });

  constructor() {
  }

  setUser(user: string, userData: any): Promise<any> {
    return new Promise((resolve) => {
      this.profile.setItem(user, userData).then(() => {
        resolve(true);
      });
    });
  }

  getUser(username): Promise<any> {
    return new Promise((resolve) => {
      this.profile.length().then((noOfKeys) => {
        if (noOfKeys > 0) {
          this.profile.getItem(username).then((user) => {
            resolve(user);
          });
        } else {
          resolve(false);
        }
      });

    });
  }

  getLocalProfile(): Promise<any> {
    return new Promise((resolve) => {
      this.profile.length().then((noOfKeys) => {
        if (noOfKeys === 0) {
          resolve(false);
        } else {
          this.profile.key(0).then((res) => {
            this.getUser(res).then((token) => {
              resolve(token);
            });
          });
        }
      });
    });
  }

  clearUser(): Promise<any> {
    return new Promise((resolve) => {
      this.profile.clear().then(() => {
        resolve(true);
      });
    });
  }

  setImage(username, image) {
    this.photo.setItem(username, image);
  }

}
