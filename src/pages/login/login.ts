import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AES256 } from '@ionic-native/aes-256';
import {globals}  from '../../app/globalConstants';
import { Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage';
import { DisplayDataPage } from '../display-data/display-data';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers:[globals]
})
export class LoginPage {
  userEmail:any;
  accessToken:any;
  networkStatus:any;
  registering=false;
  data:any={};
  userdata:any = {};

  //password encryption
  encryptedPassowrd="";

  // UI
  registerButtonColor="gray";
  type="password";
  password_icon="eye";

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,  
              private storage:Storage, 
              public httpClient:HttpClient,
              public inAppBrowser:InAppBrowser,
              private aes256: AES256,
              private network: Network,
              private alertCtrl: AlertController,
              public events: Events,
              private global:globals) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  ionViewWillEnter()
  {
    //check network status
    let type = this.network.type;
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

    // Display data if credentials already stored
    this.resetInputs();
    if(!(this.storage.get('accessTokenLED')===null) && !(this.storage.get('userEmailLED')===null))
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
               // this.navCtrl.push('DisplayDataPage');
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
      this.storage.get('userEmailLED').then((val) => {
        this.userEmail =val;
        resolve(val);
      });})
  }
  
  getUserToken()
  {
    console.log("getUserToken");
    return new Promise(resolve => {
      this.storage.get('accessTokenLED').then((val) => {
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
  
  
  presentAlert(titleMessage :string,subTitleMessage: string,buttonText:string) {
    let alert = this.alertCtrl.create({
      title: titleMessage,
      subTitle: subTitleMessage,
      buttons: [buttonText]
    });
    alert.present();
  }

  resetInputs()
  {
    this.registering=false;
    if(this.data.username)
      this.data.username="";
    if(this.data.password)
      this.data.password="";
    if(this.data.gender)
      this.userdata.gender="";
    if(this.data.nickname)
      this.userdata.nickname="";
      this.data.password="";
  }

  encryptPswrd(pwd:string)
  {
    return new Promise(resolve => {
      this.aes256.encrypt(this.global.secureKey,this.global.secureIV,pwd).then( res=> {
        this.encryptedPassowrd=res;resolve(res)}
      )})
  }


  // SHOW HIDE PASSWORD
  showHide()
  {
    if(this.type=="password")
    {
      this.type="text";
    }
    else
    {
      this.type="password";
    }
  }


  // Method to get user details
  getUserData()
  {
      var link = this.global.serverURI.concat('direct_login.php?username=');
      link = link.concat(this.userEmail);
      link = link.concat('&accessToken=');
      link=link.concat(this.accessToken);
      console.log("getting user data",link);
      return new Promise(resolve => 
      {
        if(this.networkStatus==='online')
        {
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

  // Method to verify Login
  getRegisterUserDetails()
  {
    var link = this.global.serverURI.concat('verify_login.php?username=').concat(this.data.username);
    link = link.concat('&password=');
    link = link.concat(this.encryptedPassowrd);
    link = link.concat('&loginType=register');
    link=link.concat('&nickname=')
    link=link.concat(this.userdata.nickname);
    link=link.concat('&age=')
    link=link.concat(this.userdata.age)
    link=link.concat('&gender=');
    link=link.concat(this.userdata.gender)
    link = link.concat('&registrationID=null')
    
    console.log('registering at',link)
    return new Promise(resolve => {
      if(this.networkStatus==='online'){
      this.httpClient.get(link)
        .subscribe(data => {
          resolve(data);
        }, error => {
          resolve(error);
        })
      } else
      {
        this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','Retry');
      }
    });
  }

  // VERIFY USER LOGIN
  getLoginUserDetails()
  {
    var link = this.global.serverURI.concat('verify_login.php?username=').concat(this.data.username);
    link = link.concat('&password=');
    link = link.concat(this.encryptedPassowrd);
    link = link.concat('&loginType=login'); 
    link = link.concat('&registrationID=null')
  
    console.log('logging at',link)
    
    return new Promise(resolve => {
      if(this.networkStatus==='online'){
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
    });
  }


  login()
  {
    var link="";
    
    if(!this.data.username)
    {
      this.presentAlert('Invalid Input', 'Please enter an email address','OK');
    }

    else if(!this.data.password)
    {
      this.presentAlert('Invalid Input', 'Please enter your password','OK');
    }

    else
    {
      this.encryptPswrd(this.data.password).then(encryptPswrd=>
      {
          this.getLoginUserDetails().then(loginData=>
          {
            console.log('Login details',loginData);
            if(loginData['error'])
            {
              // account created , fitit data acces not provided
              if(loginData['access'])
              {
                this.loginSuccess(loginData,'register');
              }
              else //error logging in
              {
                this.presentAlert('Error', loginData['error'],'OK');
              }
            }
            else if(loginData['login']=='success')// NO ERROR IN LOGIN
            {
              this.loginSuccess(loginData,'login');
            }
          })
      })
    }
    this.data.password="";
  }
  
  loginSuccess(loginData, type)
  {
    var link="";
    this.storage.set('accessTokenLED',loginData['access_token']);
    this.storage.set('userEmailLED',loginData['username']);
    this.userEmail = loginData['username'];
    this.accessToken = loginData['access_token'];
    if(type=='login')
    {
      link = this.global.loginFitBitURI.concat(loginData['username']);
    }
    else
    {
      link = this.global.registerFitBitURI.concat(loginData['username']);
    }
    
    let browser = this.inAppBrowser.create(link,"_blank");
    browser.on('exit').subscribe(browserData=>
    {
      this.getUserData().then(usersdata=>
      {
        if(usersdata['error'])
        {
          console.log('getUserData Error', usersdata);
          this.presentAlert('Error','Cannot Fetch User Data. Check your internet or login again', 'ok');
        }
        else if(usersdata['login']=='success')
        {
          this.navCtrl.push('DisplayDataPage',{data:usersdata});
        }
      })
    })
  }

  register()
  {
    console.log('registering 1')
    var link = '';
    if(!this.data.username)
    {
      this.presentAlert('Invalid Input', 'Please enter an email address',"OK")
    }
    else if(!this.data.password)
    {
      this.presentAlert('Invalid Input', 'Please enter a password',"OK")
    }
    else if(!this.userdata.nickname && this.registering)
        this.presentAlert('Invalid Input','Please enter a nickname',"OK");
    else if(!this.userdata.age && this.registering)
        this.presentAlert('Invalid Input', 'Please enter your age',"OK");
    else if(!this.userdata.gender && this.registering)
        this.presentAlert('Invalid Input', 'Please select a gender',"OK");
    
    else if(this.userdata.age < 6)
    {
      this.presentAlert('Error','You are too young to play this game. Players need to be atleast 6 to play this game',"OK");
    }
    else
    {
      if(this.registering==false)
        this.registering=true;
      else
      {
        console.log('registering ',this.registering)
        this.encryptPswrd(this.data.password).then(encryptpswrd=>
        {
          console.log(encryptpswrd);
          
            this.getRegisterUserDetails().then(registerData=>
            {
              if(registerData['error'])
              {
                this.presentAlert('Error',registerData['error'],'OK');
              }
              else if(registerData['register']=='success')
              {
                this.loginSuccess(registerData,'register');
              }
            })
          
        })
      }
    }
    
  }

  forgotPassword()
  {
    this.navCtrl.push('ForgotPasswordPage');
  }

  alertInfo()
  {
    this.presentAlert('Information', 'This application records your fitness data', 'OK')
  }
}
