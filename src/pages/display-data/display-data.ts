import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import {Platform} from 'ionic-angular';

import { BLE } from '@ionic-native/ble';
import {globals}  from '../../app/globalConstants';

/**
 * Generated class for the DisplayDataPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-display-data',
  templateUrl: 'display-data.html',
  providers:[globals]
})
export class DisplayDataPage {
  userName="";
  userSteps;
  userActiveMinutes ;
  userdata;
  userEmail;
  accesstoken;
  networkStatus;
  LEDColor:number=0; // 0--> yellow    1--> Blue    2-->Green
  goalSteps:number;
  timerRunning =true;
  devices:any[]=[];
  status:string="Disconnected"
  statusBoolean=false;
  peripheral;
  scanOnLoop=false;
  displayString ="Let's get some steps to get going!";
  displayIcon="";
  turnOnOff_text = "Turn the LED On";
  timer;
  isOff:boolean;
  stateBT:string;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              private storage:Storage,
              private zone:NgZone,
              public events:Events,
              private alertCtrl:AlertController,
              private network:Network,
              private global:globals,
              private platform:Platform,
              private httpClient:HttpClient,
              private ble:BLE,
              ) {
                this.platform.ready().then(()=>{
                  this.currentBTStatus();
                //  this.updateBTStatus();
                });
                this.userdata = this.navParams.get('data');
                this.userName = this.userdata['username'];
                this.userSteps = this.userdata['steps'];
                this.userActiveMinutes = this.userdata['fairlyActiveMinutes']+this.userdata['veryActiveMinutes'];
                this.goalSteps = this.userdata['goalSteps'];
                
  }

  currentBTStatus(){
    
    this.ble.isEnabled().then(()=>{
      console.log('the bluetooth is on'),
    this.isOff=false;}
    
    ).catch((error)=>{console.log('the bluetooth is off'),
  this.isOff=true,
  this.presentAlert('Bluetooth is off','Please turn-on the bluetooth to connect to kidLED',"Retry");});
    }

    // showError(error){

    //   let alert=this.alertCtrl.create({
    //     title:'Error',
    //     subTitle:error,
    //     buttons:['Ok']
    //   });
    //   alert.present();
      
    //     }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DisplayDataPage');
  }
  Logout()
  {
      console.log("Logging out");
      this.storage.remove('accessTokenLED');
      this.storage.remove('userEmailLED');
      this.navCtrl.pop();
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

    this.zone.run(()=> this.refreshView());
    
  }

  presentAlert(titleMessage:string, subTitleMessage:string, buttonString:string) 
  {
      let alert = this.alertCtrl.create(
      {
        title: titleMessage,
        subTitle:subTitleMessage,
        buttons: [
          {
          text:buttonString,
          }],
      });
      alert.present();
  }

  presentAlertwithCallback(titleMessage:string, subTitleMessage:string, buttonString:string) 
  {
    console.log('with alert');
      let alert = this.alertCtrl.create(
      {
        title: titleMessage,
        subTitle:subTitleMessage,
        buttons: [
          {
          text:buttonString,
          handler:()=>
          {
            
            let value = 4;
            let buffer = new Uint8Array([value]).buffer;
            this.ble.write('F4:B8:5E:B4:01:CE','0000ffe0-0000-1000-8000-00805f9b34fb','0000ffe1-0000-1000-8000-00805f9b34fb',buffer).then(
            ()=>{console.log('written 1 successfully)')},
            error =>{console.log("writing failed")}
              )
      
          }
          }],
      });
      alert.present();
  }

  getUsername()
  {
      return new Promise(resolve => 
      {
        this.storage.get('userEmailLED').then((val) => 
        {
          this.userEmail =val;
          resolve(val);
        });
      })
  }

  /** Get Access Token From Storage */
  getUserToken()
  {
      return new Promise(resolve => 
      {
        this.storage.get('accessTokenLED').then((val) => 
        {
          this.accesstoken = val;
          resolve(val);
        });
      })
  }

  getCurrentActivity()
  {
    var link = this.global.serverURI.concat('getCurrentActivity.php?self=');
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    return new Promise(resolve => 
      {
        if(this.networkStatus==='online')
        {
          this.httpClient.get(link).subscribe(data => 
          {
            resolve(data);
          },
          error => 
          {
            resolve(error);
          });
        }
        else
        {
          this.presentAlert('Internet Disconnected','Please retry after connecting to the internet',"Retry");
        }
      });
  }

  

  refreshView()
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
    console.log('DisplaydataPage refreshView');
    this.currentBTStatus();
    this.getUsername().then(usernamedata=>
    {
      this.getUserToken().then(usertoken=>
      {
        this.getCurrentActivity().then(currentActivityData=>
        {
          console.log('currentActivityData', currentActivityData)
          if(currentActivityData['steps'])
          {
            this.userSteps = currentActivityData['steps'];
            this.userActiveMinutes = currentActivityData['activeMinutes'];
            this.userName = currentActivityData['username'];
           // if(this.goalSteps*0.5> this.userSteps)
           if(this.userSteps<3000)
            {
              this.LEDColor = 0;
              // this.displayIcon = "yellow-bulb"
              this.displayIcon="assets/imgs/yellowbulb.png"
            }
           // if((this.goalSteps*0.5<= this.userSteps) &&(this.goalSteps> this.userSteps))
           if(this.userSteps>=3000 && this.userSteps<=6000)
            {
              this.LEDColor = 1;
              this.displayString = "You can do it!. Get the green light. " //TODO
              // this.displayIcon = "blue-bulb"
              this.displayIcon="assets/imgs/bluebulb.png"
            }
          //  else if(this.userSteps>= this.goalSteps)
          else if(this.userSteps>6000)
            {
              this.LEDColor = 2; 
              this.displayString = "Good Job! You get a green light."
              // this.displayIcon = "green-bulb"
              this.displayIcon="assets/imgs/greenbulb.png"
            }
            if(this.status=="Connected")
            {
              let value=this.LEDColor;
              let buffer = new Uint8Array([value]).buffer;
              this.ble.write('F4:B8:5E:B4:01:CE','0000ffe0-0000-1000-8000-00805f9b34fb','0000ffe1-0000-1000-8000-00805f9b34fb',buffer).then(
                ()=>{console.log('written 1 successfully)')},
                error =>{console.log("writing failed")}
              )
            }
            if(this.scanOnLoop==false)
            {
              this.ScanStart();
              this.ScanTimer();
            }
          }
        })
      
      })

    })

    

  }



  ScanTimer()
  {
    console.log("Scan Timer")
    this.scanOnLoop=true;
   
    this.timer =  setTimeout(()=>{
        console.log("Scanning agian" + this.timerRunning + this.status)
        if(this.timerRunning==true && this.status=="Disconnected")
        {
          this.ScanStart();
         
        }
        this.ScanTimer();
      },30000)
    
  }

  ionViewWillLeave()
  {
    console.log("ionViewWillLeave disconnecting bluetooth");
    if(this.status=="Connected")
    {
    this.ble.disconnect(this.peripheral.id).then(
      ()=>{console.log("Disconncted")},
      ()=> console.log("error disconnceting")

    );
    }
    this.timerRunning=false;
    this.scanOnLoop=false;
    clearTimeout(this.timer);
  }

  onConnected(peripheral)
  {
    this.zone.run(()=>
    {
     
      this.peripheral=peripheral;
      console.log("Connected to "+ peripheral.name||peripheral.id);
      this.status= "Connected";
      //this.ble.stopScan();
      
      let value = this.LEDColor;
      let buffer = new Uint8Array([value]).buffer;
      this.statusBoolean=true;
      this.turnOnOff_text="Turn the LED Off";
      this.ble.write('F4:B8:5E:B4:01:CE','0000ffe0-0000-1000-8000-00805f9b34fb','0000ffe1-0000-1000-8000-00805f9b34fb',buffer).then(
        ()=>{console.log('written 1 successfully)')},
        error =>{console.log("writing failed")}
      )
      })
  }
  onDisconnected(peripheral)
  {
    this.zone.run(()=>
    { this.peripheral=peripheral;
      this.timerRunning=true;
      this.turnOnOff_text="Turn the LED On";
      this.statusBoolean=false;
      this.status="Disconnected";
      console.log("Disconnected "+ peripheral.name||peripheral.id);
     
     })
  }

  ScanStart()
  {
    console.log("Scanning now");
    return new Promise(resolve=>
    {
      console.log("scan started")
      this.devices = [];
      this.ble.scan([],10).subscribe(
      device=>
      {
        this.devices.push(device);
        console.log(device.id+device.name);
        if(device.name == "HMSoft" || device.id == "F4:B8:5E:B4:01:CE")
        {
          console.log("Connecting to "+device.name||device.id);
          this.status = "Connecting to "+device.name||device.id;
          this.ble.connect(device.id).subscribe(
            peripheral => { this.onConnected(peripheral)},
            peripheral => this.onDisconnected(peripheral)
          )
        }
      },
      error => {console.log("Scanning Error")}

      )
      resolve();
    })
  }

  sendTurnOnOffLED()
  {
    console.log("sendTurnOnOffLED");
    let value = 4;
    let buffer = new Uint8Array([value]).buffer;
    this.ble.write('F4:B8:5E:B4:01:CE','0000ffe0-0000-1000-8000-00805f9b34fb','0000ffe1-0000-1000-8000-00805f9b34fb',buffer).then(
    ()=>{console.log('written 4 successfully)');
      if(this.turnOnOff_text=="Turn the LED On")
      {
        this.turnOnOff_text = "Turn the LED Off";
      }
      else
      {
        this.turnOnOff_text = "Turn the LED On";
      }
      value=this.LEDColor;
      buffer = new Uint8Array([value]).buffer;
      this.ble.write('F4:B8:5E:B4:01:CE','0000ffe0-0000-1000-8000-00805f9b34fb','0000ffe1-0000-1000-8000-00805f9b34fb',buffer).then(
        ()=>{
          console.log('sending '+ this.LEDColor + " after 4");

        },
        error=>{
          console.log('sending '+ this.LEDColor + " after 4 failed ");
        }
      )

  },
    error =>{console.log("writing failed")}
      )
  }
  

}
