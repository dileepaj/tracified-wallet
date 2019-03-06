# Tracified Wallet

Tracified offers the only blockchain capable of ensuring not only the complete audit-ability & immutability of data but also the authenticity.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Pages](#pages)
3. [Providers](#providers)

## <a name="getting-started"></a>Getting Started

To test the app, install the latest version of the Ionic CLI, clone the app and run:

```bash
ionic cordova run browser
```

## Pages

The wallet has several pages. These pages help
you assemble common building blocks of tracified, so you can focus on your
unique features and branding.

The app loads with the `FirstRunPage` set to `TutorialPage` as the default. If
the user has already gone through this page once, it will be skipped the next
time they load the app.

If the tutorial is skipped but the user hasn't logged in yet, the Welcome page
will be displayed which is a "splash" prompting the user to log in or create an
account.

Once the user is authenticated, the app will load with the `MainPage` which is
set to be the `ItemsPage` as the default.

## Providers

Tracified Wallet have some basic implementations of common providers.

### User

The `User` provider is used to authenticate users through its
`login(accountInfo)` and `signup(accountInfo)` methods, which perform `POST`
requests to an API endpoint that you will need to configure.

### Api

The `Api` provider is a simple CRUD frontend to an API. Simply put the root of
your API url in the Api class and call get/post/put/patch/delete 


### Adding Languages

To add new languages.

