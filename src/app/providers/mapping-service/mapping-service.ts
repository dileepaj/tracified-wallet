import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isObject } from 'lodash';
import { AES, enc } from 'crypto-js';
declare const Buffer;

@Injectable({
   providedIn: 'root',
})
export class MappingServiceProvider {
   constructor(public http: HttpClient) {}

   toBase64Id(id) {
      let identifier;
      try {
         const parsedIdentifier = JSON.parse(id);
         if (typeof parsedIdentifier === 'object') identifier = parsedIdentifier;
         else
            identifier = {
               type: 'barcode',
               id: parsedIdentifier,
            };
      } catch (error) {
         identifier = {
            type: 'barcode',
            id: id,
         };
      }
      return new Buffer.from(JSON.stringify(identifier)).toString('base64');
   }

   fromBase64Id(id) {
      let converted = JSON.parse(new Buffer.from(id, 'base64').toString('ascii'));
      if (isObject(converted.id)) {
         return JSON.stringify(converted);
      } else {
         return converted.id;
      }
   }

   toBase64Url(url, outputFormat) {
      return new Promise(resolve => {
         let img = new Image();
         img.crossOrigin = 'Anonymous';
         img.onload = () => {
            let canvas = <HTMLCanvasElement>document.createElement('CANVAS'),
               ctx = canvas.getContext('2d'),
               dataURL;
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            resolve(dataURL);
            canvas = null;
         };
         img.src = url;
      });
   }

   encyrptSecret(key, signer) {
      return new Promise((resolve, reject) => {
         try {
            var encSecretKey = AES.encrypt(key, signer);
            resolve(encSecretKey.toString());
         } catch {
            reject();
         }
      });
   }

   decryptSecret(encKey, sipher) {
      return new Promise((resolve, reject) => {
         try {
            var decKey = AES.decrypt(encKey, sipher);
            resolve(decKey.toString(enc.Utf8));
         } catch {
            reject();
         }
      });
   }
}
