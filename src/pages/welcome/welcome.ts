import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events  } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Network } from '@ionic-native/network';
import {DisplayDataPage} from '../display-data/display-data';
import {LoginPage} from '../login/login';
import {globals}  from '../../app/globalConstants';

/**
 * Generated class for the WelcomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
  providers:[globals]
})
export class WelcomePage {
  userEmail:any;
  accessToken:any;
  networkStatus:any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private storage:Storage, 
              public httpClient:HttpClient,
              private network:Network,
              private alertCtrl:AlertController,
              private events:Events, 
              private global :globals) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WelcomePage');
  }

  ionViewWillEnter()
  {
    let type =this.network.type;
    if(type=='none'||type=='undefined')
    {
      this.networkStatus='offline';
    }
    else
    {
      this.networkStatus='online';
    }

    this.events.subscribe('networkStatus',(networkdata)=>
    {
      this.networkStatus = networkdata;
    });

    if(!(this.storage.get('accessTokenCTTAsyncS')===null) && !(this.storage.get('userEmailCTTAsyncS')===null))
    {
      this.getUsername().then(userNamedata=>
      {
        this.getUserToken().then(userTokenData=>
        {
          this.getLoginDetails().then(loginDetailsData=>
          {
            if(loginDetailsData['error'])
            {
              //this.presentAlert('Error',loginDetailsData['error'],'OK');
              console.log('login Data',loginDetailsData)
            }
            else if(loginDetailsData['login']=='success')
            {
              console.log('Login Success',loginDetailsData);
              this.navCtrl.push('DisplayDataPage',{data:loginDetailsData});
            }
          });
        });
      });
    }
  }

  ionViewWillLeave()
  {
    this.events.unsubscribe('networkStatus');
  }

  getUsername()
  {
    console.log("getUserDetails");
    return new Promise(resolve => {
      this.storage.get('userEmailCTTAsyncS').then((val) => {
        this.userEmail =val;
        resolve(val);
      });})
  }
  
  getUserToken()
  {
    console.log("getUserToken");
    return new Promise(resolve => {
      this.storage.get('accessTokenCTTAsyncS').then((val) => {
        this.accessToken = val;
        resolve(val);
      });})
  }

  getLoginDetails()
  {
    console.log("getLoginDetails");
    var link = this.global.serverURI.concat('direct_login.php?username=')
    link = link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link=link.concat(this.accessToken);
  
    console.log(link);
    return new Promise(resolve => {
      if(this.networkStatus=='online'){
      this.httpClient.get(link)
          .subscribe(data => {
            resolve(data);
          }, error => {
            resolve(error);
          })
        }
        else
        {
          this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','Retry');
        }
    })
  }
  presentAlert(titleMessage :string,subTitleMessage:string,buttonText:string) {
    let alert = this.alertCtrl.create({
      title: titleMessage,
      subTitle: subTitleMessage,
      buttons: [buttonText]
    });
    alert.present();
  }

  GetStarted()
  {
    this.navCtrl.push('LoginPage');
  }

}
