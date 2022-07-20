import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CodePush, ILocalPackage, IRemotePackage } from '@ionic-native/code-push';
import { Logger } from 'ionic-logger-new';
import { Properties } from '../../shared/properties';
import { ENV } from '@app/env';

@Injectable()
export class CodePushServiceProvider {

  constructor(
    public http: HttpClient,
    private codepush: CodePush,
    private logger: Logger,
    private properties: Properties
  ) {

  }

  checkForUpdate() {
    return new Promise((resolve, reject) => {
      return this.codepush.checkForUpdate(ENV.APPCENTER_DEPLOYMENT_KEY).then((remotePackage: IRemotePackage) => {
        if (!remotePackage) {
          this.logger.info("[Codepush] No update available.", this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject({ status: 404, error: 'NO_UPDATE' });
        } else {
          if (remotePackage.failedInstall) {
            this.logger.info("[Codepush] Previously failed package. Aborting.", this.properties.skipConsoleLogs, this.properties.writeToFile);
            reject({ status: 400, error: 'UPDATE_FAILED_PREVIOUSLY' });
          } else {
            resolve(remotePackage);
          }
        }
      }).catch((err) => {
        this.logger.error("[Codepush]Checking for update failed: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject({ status: 400, error: 'UPDATE_FAILED' });
      });
    });
  }

  doUpdate(remotePackage: IRemotePackage): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      if (remotePackage) {
        const downloadProgress = (progress) => {
          console.log("Progres: ", progress);
          // console.log(`Downloaded ${progress.receivedBytes} of ${progress.totalBytes}`);
          // this.download = Math.floor((progress.receivedBytes / progress.totalBytes) * 100);
        };

        const onError = (err) => {
          this.logger.error("[Codepush] Failed to update package: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
          reject({ status: 400, error: "UPDATE_ERROR" });
        };

        const onInstallSuccess = () => {
          this.logger.info("[Codepush]Package installed successfully.", this.properties.skipConsoleLogs, this.properties.writeToFile);
          resolve();
        };
        var onPackageDownloaded = (localPackage: ILocalPackage) => {
          // this.progressStatus = null;
          localPackage.install(onInstallSuccess, onError);
        };
        remotePackage.download(onPackageDownloaded, onError, downloadProgress);
      } else {
        reject({status: 400, error: "PACKAGE_ERROR"});
      }
    });
  }

  notifyApplicationReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      return this.codepush.notifyApplicationReady().then(() => {
        resolve();
      }).catch((err) => {
        this.logger.error("Codepush notify application ready error: " + err, this.properties.skipConsoleLogs, this.properties.writeToFile);
        reject();
      });
    });
  }


}
