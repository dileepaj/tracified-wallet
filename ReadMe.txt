Used node version - 18.15.0


** IMPORTAN **

Need to add these lines to AndroidManifest.xml

  <activity

          <intent-filter>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="walletapp" />
          </intent-filter>

    </activity>