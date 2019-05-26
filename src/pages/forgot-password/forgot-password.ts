import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Events} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { AlertController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import {globals}  from '../../app/globalConstants';
import { AES256 } from '@ionic-native/aes-256';
/**
 * Generated class for the ForgotPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
  providers: [globals]
})
export class ForgotPasswordPage {
  resetting= false;
  userEmail:any;
  networkStatus:any;
  passwordResetCode:any;
  encryptedPassowrd:any;
  userEnteredCode;
  newPassword:any={};
  
  emailAddressView=false;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private storage:Storage,
              public httpClient:HttpClient,
              private alertCtrl: AlertController,
              private events:Events,
              private network:Network,
              private global:globals,
              private aes256: AES256,
              private zone:NgZone) {
                this.newPassword.first="";
                this.newPassword.second="";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage');
  }

  ionViewWillEnter()
  {
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
    this.emailAddressView = true;
    this.newPassword.first="";

  }
  ionViewWillLeave()
  {
    this.events.unsubscribe('networkStatus');
  }
  resetPasswordLink()
  {
    if(this.userEmail.length==0)
    this.presentAlert('Error', "Enter a valid email address", 'OK');
    else{
      this.sendPasswordResetEmail().then(passwordResetResponse=>
      {
        console.log("sendPasswordResetResponse", passwordResetResponse);
        if(passwordResetResponse['error'])
        {
          this.presentAlert('Error', passwordResetResponse['error'], 'OK')
        }
        else if(passwordResetResponse['type']=='passwordReset')
        {
          
            this.resetting=true;
            this.zone.run(()=> this.refreshView());
            this.passwordResetCode=passwordResetResponse['codeValue'];
        }
      })
    }
  }
  
  presentAlert(titleMessage :string,subTitleMessage: string,buttonText:string) {
    let alert = this.alertCtrl.create({
      title: titleMessage,
      subTitle: subTitleMessage,
      buttons: [buttonText]
    });
    alert.present();
  }

  sendPasswordResetEmail()
  {
    var link = this.global.serverURI.concat('resetPassword.php?email=');
    link = link.concat(this.userEmail);
    link = link.concat('&gameName=Grow The Garden');
    
    console.log("sendPasswordResetEmail",link);
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
  encryptPswrd(pwd:string)
  {
    return new Promise(resolve => {
      this.aes256.encrypt(this.global.secureKey,this.global.secureIV,pwd).then( res=> {
        this.encryptedPassowrd=res;resolve(res)}
      )})
  }

  Done()
  {
    if(this.userEnteredCode<10000000 || this.userEnteredCode>99999999)
      this.presentAlert('Warning','Please enter an 8 digit code','OK');
    else if(this.newPassword.first.length==0 || this.newPassword.second.length==0 )
      this.presentAlert('Warning','Please enter a valid password',"OK");
    else if(this.newPassword.first!=this.newPassword.second)
      this.presentAlert('Warning','Passwords don\'t match','OK');
    else if(this.userEnteredCode!= this.passwordResetCode)
      this.presentAlert('Warning',"The code you entered does not match", "OK");
    else
    {
      this.encryptPswrd(this.newPassword.first).then(encryptPswrd=>
      {
        this.updatePassword().then(updatedPasswordData=>
        {
          if(updatedPasswordData['error'])
          this.presentAlert('Warning',updatedPasswordData['error'], "OK");
          else if(updatedPasswordData['type']=='passwordUpdate')
          {
            let alert = this.alertCtrl.create({
              title: 'Password Updated',
              
              buttons: [{
                text:'OK',
                handler:()=>
                {
                  this.navCtrl.pop();
                }
              }]
            });
            alert.present();
          }
        })
      })
    }
  }

  updatePassword()
  {
    var link = this.global.serverURI.concat('updatePassword.php?email=');
    link = link.concat(this.userEmail);
    link = link.concat('&password=').concat(this.encryptedPassowrd);
    
    console.log("updatePassword",link);
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

  refreshView()
  {
    this.resetting = true;
    this.emailAddressView = false;
  }
}
