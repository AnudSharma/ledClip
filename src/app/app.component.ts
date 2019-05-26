import { Component } from '@angular/core';
import { Platform} from 'ionic-angular';
import { Events} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Network } from '@ionic-native/network';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Storage } from '@ionic/storage';

// import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:string = 'WelcomePage';

  constructor(platform: Platform,
     statusBar: StatusBar,
      splashScreen: SplashScreen,
      private network: Network,
      public events:Events,
      private push :Push,
      private storage:Storage,
      
      ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.getNetworkStatus();
      this.pushSetup();
    });
  }


  getNetworkStatus()
  {
    this.network.onDisconnect().subscribe(()=>{
      console.log('Network Disconnected');
      this.events.publish('networkStatus','offline')
    })
    this.network.onConnect().subscribe(()=>{
      console.log('network Connected')
      this.events.publish('networkStatus','online')
    })
  }


  pushSetup()
  {
    const options: PushOptions = {
      android: {
        senderID:'26782786368' 
      },
      ios: {
          alert: 'true',
          badge: true,
          sound: 'false'
      },
      browser: {
          pushServiceURL: 'http://push.api.phonegap.com/v1/push'
      }
   };
   const pushObject: PushObject = this.push.init(options);
   pushObject.on('notification').subscribe((notification: any) => {
     let data = notification['additionalData'];
     console.log("Received a notification DATA RECIEVED", data);

      // Game start notification
      if(data['type']== 'gameStart')
      {
        this.events.publish('gameStart', data);
      }
      // GameOver Notification
      if(data['type']=='gameOver')
      {
        this.events.publish('gameOver',data);
      }

     })

     pushObject.on('registration').subscribe((registration: any) => {console.log("registration",registration);console.log('Device registered', registration['registrationId']);this.storage.set('registrationIDCTTAsyncS',registration['registrationId'])});
     pushObject.on('error').subscribe(error => console.error('Error with Push plugin', error));
     
  }
}
