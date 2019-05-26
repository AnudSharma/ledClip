import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Events } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import {globals} from '../../app/globalConstants'

/**
 * Generated class for the GameInstancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
export interface CountdownTimer {
  seconds: number;
  secondsRemaining: number;
  runTimer: boolean;
  hasStarted: boolean;
  hasFinished: boolean;
  displayTime: string; 
}
@IonicPage()
@Component({
  selector: 'page-game-instance',
  templateUrl: 'game-instance.html',
  providers:[globals]
})
export class GameInstancePage {
  gameInstanceID=null;
  gameID=null;
  userEmail:any;
  accesstoken:any;
  groupName="";
  data:any = {};
  networkStatus;
  bgImage:any;
  i=0;
  gameType ="";

  playerList=[];
  playerIDList=[];
  playerStatusList=[];
  playerStepList=[];
  playerActiveMinuteList=[];
  playerImageList=[];

  gameStatus="";

  selfStepsAccumulated=0;
  selfActiveMinutesAccumulated=0;
  currentcumulativeSteps = 0;
  stepsToWin=0;

  stageInterval;
  endValue;

  allPlayerList=[]
  allPlayerIDList=[]
  allPlayerEmailList=[]
  allPlayerCheckedList=[]

  editing:boolean=false;
  ifOwner:boolean;
 
  
  // header
  selfName=""; // USER NICK NAME
  currentSteps = 0;
  currentActiveMinutes = 0;
  selfID:null;
  selfGameStatus="";

  timer:CountdownTimer;
  timeRemaining:any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private storage:Storage,
              public httpClient:HttpClient,
              private zone : NgZone,
              public events: Events, 
              private alertCtrl: AlertController,
              private network:Network,
              private global:globals) {
                this.gameInstanceID = this.navParams.get('gameInstanceID');
                this.gameID = this.navParams.get('gameID');
                this.currentSteps = this.navParams.get('userSteps');
                this.currentActiveMinutes = this.navParams.get('userActiveMinutes');
                this.gameType = this.navParams.get('gameType');
  }

  ionViewDidLoad() 
  {
    console.log('ionViewDidLoad GameInstancePage');
  }

  ionViewWillEnter()
  {
    this.resetValues();
    let type = this.network.type;
    if(type=='none'||type=='undefined')
    {
      this.networkStatus='offline';
    }
    else
    {
      this.networkStatus='online';
    }
    this.events.subscribe('gameStart',data=>
    {
      if(data['gameInstanceID'] == this.gameInstanceID)
      {
        this.zone.run(()=>this.refreshView());
      }
    });

    this.events.subscribe('gameOver',data=>
    {
      if(data['gameInstanceID'] == this.gameInstanceID)
      {
        this.zone.run(()=>this.refreshView());
      }
    });

    this.events.subscribe('networkStatus', networkData=>
    {
      this.networkStatus= this.networkStatus;
    })

    this.zone.run(()=>this.refreshView());
  }

  resetValues()
  {
    this.gameStatus="";
  }

  ionViewWillLeave()
  {
    this.events.unsubscribe('gameStart');
    this.events.unsubscribe('gameOver');
    this.events.unsubscribe('networkStatus');
    //this.brightness.setBrightness(0.75);

    if(this.groupName.length>0 && this.gameInstanceID)
    {
      this.getGroupNameUpdate();
    }

    if(this.timer)
    {
      this.timer.hasStarted = false;
      this.timer.runTimer = false;
      this.timer.secondsRemaining=0;
    }
  }

  presentAlert(titleMessage:string, subTitleMessage:string,buttonText:string) 
  {
    let alert = this.alertCtrl.create(
    {
      title: titleMessage,
      subTitle:subTitleMessage,
      buttons: [{
        text:buttonText,
      }],
    });
    alert.present();
  }

  /** Present Alert with two buttons on Sync Error */
  presentAlertSyncError(titleMessage :string, subTitleMessage:string) 
  {
    let alert = this.alertCtrl.create(
    { 
      title: titleMessage,
      subTitle:subTitleMessage,
      buttons: [
      {
        text:'Retry',
        handler:()=>
        {
          console.log('showing button retry');
          this.zone.run(()=> this.refreshView());
        }
      },
      {
        text:'Cancel',
        handler:()=>
        {
          console.log('showing button retry');
        }
      }]
    });
    alert.present();
  }

  getUsername()
  {
    return new Promise(resolve => 
    {
      this.storage.get('userEmailCTTAsyncS').then((val) => 
      {
        this.userEmail =val;
        resolve(val);
      });
    })
  }
  
  /** Get Access Token from storage */
  getUserToken()
  {
    return new Promise(resolve => 
    {
      this.storage.get('accessTokenCTTAsyncS').then((val) => 
      {
        this.accesstoken = val;
        resolve(val);
      });
    })
  }

  /** Get Details of current Game Instance ID */
  getGameDetails()
  {
    var link = this.global.serverURI.concat('getGameDetails.php?self=');
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link=link.concat('&gameInstanceID=');
    link=link.concat(this.gameInstanceID);
   
    return new Promise(resolve => 
    {
      if(this.networkStatus==='online')
      {
        this.httpClient.get(link).subscribe(data => 
        {
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

  /**  Delete Player from Game Instance */
  removePlayerFromGameInstance(i)
  {
    var link = this.global.serverURI.concat('removePlayerFromGameInstance.php?self=');
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link=link.concat('&gameInstanceID=');
    link=link.concat(this.gameInstanceID);
    link = link.concat('&friendID=');
    link=link.concat(i);
    console.log('removePlayer' ,link)
    return new Promise(resolve => 
    {
      if(this.networkStatus==='online')
      {
        this.httpClient.get(link).subscribe(data => 
        {
          resolve(data);
        }, error => 
        {
          resolve(error);
        });
      }
      else
      {
        this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','Retry');
      }
    });
  }

  /** Update Group Name in Database */
  updateGroupName()
  {
    if(this.data.groupName.length==0)
    {
      this.presentAlert('Warning', 'Group Name Cannot be Empty', 'OK')
    }
    else
    {
      this.getGroupNameUpdate().then(groupNameUpdateData=>
      {
        if(groupNameUpdateData['error'])
        {
          console.log('GroupName update failed', groupNameUpdateData )
        }
        else 
        {
          this.groupName =groupNameUpdateData['newGroupName'];
          this.editing=false;
          this.zone.run(()=> this.refreshView());
        }
      });
    }
  }

  /** API CALL TO EDIT GROUP NAME */
  getGroupNameUpdate()
  {
    var link = this.global.serverURI.concat('editGroupName.php?self=');
    link = link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link = link.concat(this.accesstoken);
    link = link.concat('&gameInstanceID=');
    link = link.concat(this.gameInstanceID);
    link = link.concat('&newGroupName=');
    link = link.concat(this.groupName);
    return new Promise(resolve => 
    {
      if(this.networkStatus==='online')
      {
        this.httpClient.get(link).subscribe(data => 
        {
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

  /** Get Details of an Ongoing Game */
  getActiveGameDetail()
  {
    var link = this.global.serverURI.concat('getActiveGameDetail.php?self=');
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken)
    link = link.concat('&gameInstanceID=');
    link = link.concat(this.gameInstanceID);
    link = link.concat('&gameID=')
    link = link.concat(this.gameID)
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
        })
      }
      else
      {
        this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','Retry');
      }
    })   
  }

  /** API CALL TO ADD FRIEND */
  addPlayers(frndemail)
  {
    var link = this.global.serverURI.concat('addPlayerToGameInstance.php?gameInstanceID=');
    link= link.concat(this.gameInstanceID);
    link= link.concat('&self=');
    link= link.concat(this.userEmail);
    link=link.concat('&friend=');
    link = link.concat(frndemail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);  
    console.log('addPayers', link)
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
        this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','Retry');
      }
    })  
  }

  /** Start Game */ 
  StartGame()
  {
    this.getStartGameResponse().then(data=>
    {
      if(!data['error'])
      {
        console.log("response from startGame",JSON.stringify(data));
        this.zone.run(()=> this.refreshView());
      }
      else
      {
        console.log('startGame response', data);
        this.presentAlert('Warning', data['error'],'Retry');
      }
    });
  }

  /** API call to start Game */
  getStartGameResponse()
  {
    var link = this.global.serverURI.concat('startGame.php?gameInstanceID=');
    link= link.concat(this.gameInstanceID);
    link= link.concat('&self=');
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=')
    link= link.concat(this.accesstoken);
    link=link.concat('&gameID=');
    link = link.concat(this.gameID);
    return new Promise(resolve => 
    {
      if(this.networkStatus==='online')
      {
        this.httpClient.get(link).subscribe(data => 
        {
          resolve(data);
        }, error => {
          resolve(error);
        })
      }else
      {
        this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','OK');
      }
    })
  }

  getPlayersFromGroupID()
  {
    var link = this.global.serverURI.concat('getPlayersFromGroupID.php?self=');
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link=link.concat('&groupID=439');
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
        })
      }
      else
      {
        this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','Retry');
      }
    });
  }

  finishGame()
  {
    var link = this.global.serverURI.concat('gameOver.php?self=');
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link = link.concat('&gameInstanceID=');
    link= link.concat(this.gameInstanceID);
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
        })
      }
      else
      {
        this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','Retry');
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
    this.bgImage = "background-image";
    this.getUsername().then(usernamedata=>
    {
      this.getUserToken().then(usertokendata=>
      {
        this.getGameDetails().then(gameDetails=>
        {
          console.log("gameDetails ",JSON.stringify(gameDetails) );
          if(gameDetails['error'])
          {
            if(gameDetails['error'] =="Not an Active Game")
            {
              //this.presentAlert('Warning','Game Over', 'OK');
            }
            else
            {
             // this.presentAlert('Warning',gameDetails['error'], 'OK');
            }
          }
          else
          {
            this.groupName = gameDetails['groupName'];
            this.selfName = gameDetails['selfName'];
            this.gameStatus = gameDetails['gameStatus'];
            if(gameDetails['owner']=='true')
            {
              this.ifOwner=true;
            } 
            else
            {
              this.ifOwner=false;
            }
            this.getPlayersFromGroupID().then(allPlayerData=>
            {
              if(this.allPlayerList.length==0)
              {
                console.log('getPlayersFromGroupID ',allPlayerData )
                for(this.i=0;this.i<allPlayerData['numberOfPlayers']*3;this.i=this.i+3)
                {
                  if(this.selfName!=allPlayerData[this.i+1])
                  {
                    this.allPlayerList.push(allPlayerData[this.i+1])
                    this.allPlayerIDList.push(allPlayerData[this.i])
                    this.allPlayerEmailList.push(allPlayerData[this.i+2])
                    this.allPlayerCheckedList.push(false)
                  }  
                }
              }
              console.log(this.allPlayerList)
              
              if(this.gameStatus =='gameQuit') this.refreshQuitGame(gameDetails);
              else if(this.gameStatus == 'gameOver') this.refreshOverGame(gameDetails);
              else if(this.gameStatus == 'gameInvited') this.refreshInvitedGame(gameDetails);
              else if(this.gameStatus == 'gameReadyToPlay') this.refreshReadyToPlayGame(gameDetails);
              else if(this.gameStatus == 'gameInProgress') this.refreshInProgressGame(gameDetails);
            })
          }
        })
      })
    })
  }

  /** TIMER FUNCTIONS */
  getSecondsAsDigitalClock(inputSeconds: number) 
  {
    const secNum = parseInt(inputSeconds.toString(), 10); // don't forget the second param
    const hours = Math.floor(secNum / 3600);
    const minutes = Math.floor((secNum - (hours * 3600)) / 60);
    const seconds = secNum - (hours * 3600) - (minutes * 60);
    let hoursString = '';
    let minutesString = '';
    let secondsString = '';
    hoursString = (hours < 10) ? '0' + hours : hours.toString();
    minutesString = (minutes < 10) ? '0' + minutes : minutes.toString();
    secondsString = (seconds < 10) ? '0' + seconds : seconds.toString();
    return hoursString + ':' + minutesString + ':' + secondsString;
  }

  initTimer() 
  {
    if (!this.timeRemaining) 
    { 
      this.timeRemaining = 0; 
    }
    this.timer = <CountdownTimer>
    {
      seconds: this.timeRemaining,
      runTimer: false,
      hasStarted: false,
      hasFinished: false,
      secondsRemaining: this.timeRemaining
    };
    this.timer.displayTime = this.getSecondsAsDigitalClock(this.timer.secondsRemaining);
  }

  startTimer() 
  {
    console.log('starting timer')
    this.timer.hasStarted = true;
    this.timer.runTimer = true;
    this.timerTick();
  }


  timerTick() 
  {
    setTimeout(() => 
    {
      if (!this.timer.runTimer) { return; }
      this.timer.secondsRemaining--;
      this.timer.displayTime = this.getSecondsAsDigitalClock(this.timer.secondsRemaining);
      if (this.timer.secondsRemaining > 0) 
      {
        if(this.timer.secondsRemaining%60==0)
        {
          this.zone.run(()=> this.refreshView());
        }
          this.timerTick();
      } 
      else 
      {
        this.timer.hasFinished = true;
        this.timer.hasStarted=false;
        this.zone.run(()=> this.refreshView());
      }
    }, 1000);
  }

  updatePlayers()
  {
    this.getGroupNameUpdate();
    for(this.i=0;this.i<this.allPlayerCheckedList.length;this.i++)
    {
      let index = this.playerIDList.indexOf(this.allPlayerIDList[this.i])
      console.log(this.allPlayerEmailList[this.i], index, this.allPlayerCheckedList[this.i])
      if(this.allPlayerCheckedList[this.i])
      {
        if(index<0)
        {
          this.addPlayers(this.allPlayerEmailList[this.i]);
        }
      }
      else
      {
        if(index>=0)
        {
          this.removePlayerFromGameInstance(this.allPlayerIDList[this.i]);
        }
      }
    }
    this.zone.run(()=> this.refreshView());
  }

  refreshQuitGame(gameDetails)
  {
    console.log('refreshQuitGame');
    this.navCtrl.pop();
  }

  refreshOverGame(gameDetails)
  {
    this.currentcumulativeSteps=0
    console.log('refreshOverGame');
    //this.navCtrl.push('ScoreBoardPage',{gameOverDetails:gameDetails});
    while(this.playerList.length>0)
    {
      this.playerList.pop();
     
      this.playerStepList.pop()
      this.playerActiveMinuteList.pop();
      
    }
    while(this.playerStatusList.length>0)this.playerStatusList.pop()
    while(this.playerIDList.length>0)this.playerIDList.pop()
    if(gameDetails['selfGameStatus']=='userWon')
    {
      this.playerList.push(gameDetails['selfName']);
      this.playerStepList.push(gameDetails['selfStepsAccumulated']);
      this.playerActiveMinuteList.push(gameDetails['selfActiveTimeAccumulated']);
      this.playerStatusList.push('Won')
      this.selfGameStatus = 'Won';
      this.selfStepsAccumulated = gameDetails['selfStepsAccumulated']
      this.currentcumulativeSteps = this.currentcumulativeSteps+parseInt(gameDetails['selfStepsAccumulated']);
    }

    for(this.i=0;this.i<gameDetails['numberOfPlayers']*5;this.i+=5)
    {
      this.playerList.push(gameDetails[this.i]);
      this.playerStepList.push(gameDetails[this.i+3]);
      if(gameDetails[this.i+2]=='userWon')
        this.playerStatusList.push('Won');
      else
        this.playerStatusList.push('Lost');
      this.currentcumulativeSteps = this.currentcumulativeSteps+parseInt(gameDetails[this.i+3]);
    }
    if(gameDetails['selfGameStatus']=='userLost')
    {
      this.playerList.push(gameDetails['selfName']);
      this.playerStepList.push(gameDetails['selfStepsAccumulated']);
      this.playerActiveMinuteList.push(gameDetails['selfActiveTimeAccumulated']);
      this.playerStatusList.push('Lost');
      this.selfStepsAccumulated = gameDetails['selfStepsAccumulated'];
      this.selfGameStatus='Lost';
      this.currentcumulativeSteps = this.currentcumulativeSteps+ parseInt(gameDetails['selfStepsAccumulated']);
    }

    if(this.gameType=='comp')
    {
      if(this.selfGameStatus=='Lost')
        this.bgImage = this.getBackgroundImage(this.selfStepsAccumulated, true);
      else
        this.bgImage = this.getBackgroundImage(this.selfStepsAccumulated, false);
    }
    else
    {
      if(!this.endValue) this.endValue = gameDetails['numberOfPlayers']*2000;//4000
      if(this.selfGameStatus=='Lost')
        this.changeBackgroundGroup(this.currentcumulativeSteps,true);
      else
        this.changeBackgroundGroup(this.currentcumulativeSteps,false);
    }

    if(this.timer)
    {
      this.timer.hasStarted = false;
      this.timer.runTimer = false;
      this.timer.secondsRemaining=0;
    }

  }

  refreshInvitedGame(gameDetails)
  {
    console.log('refreshInvitedGame');
    while(this.playerIDList.length>0)
    {
      this.playerIDList.pop();
      this.playerList.pop();
      this.playerStatusList.pop();
    }
    for(this.i=0;this.i<this.allPlayerCheckedList.length;this.i++)
    {
      this.allPlayerCheckedList[this.i]=false;
    }
    for(this.i=0;this.i<gameDetails['numberOfPlayers']*3;this.i = this.i + 3)
    {
      let str = gameDetails[this.i];
      str=str.concat(" ( ");
      str=str.concat(gameDetails[this.i+2].substr(4));
      str=str.concat(" )");
      this.playerList.push(str);
      this.playerIDList.push(gameDetails[this.i +1]);
      this.playerStatusList.push(gameDetails[this.i+2]);
      let index = this.allPlayerIDList.indexOf(gameDetails[this.i+1])
      if(index>=0)
      {
        this.allPlayerCheckedList[index]=true;
      }
    }
  }

  refreshReadyToPlayGame(gameDetails)
  {
    console.log('refreshReadyToPlayGame');
    
    while(this.playerIDList.length>0)
    {
      this.playerIDList.pop();
      this.playerList.pop();
      this.playerStatusList.pop();
    }
    for(this.i=0;this.i<this.allPlayerCheckedList.length;this.i++)
    {
      this.allPlayerCheckedList[this.i]=false;
    }
    for(this.i=0;this.i<gameDetails['numberOfPlayers']*3;this.i = this.i + 3)
    {
      let str = gameDetails[this.i];
      str=str.concat(" ( ");
      str=str.concat(gameDetails[this.i+2].substr(4));
      str=str.concat(" )");
      this.playerList.push(str);
      this.playerIDList.push(gameDetails[this.i +1]);
      this.playerStatusList.push(gameDetails[this.i+2]);
      let index = this.allPlayerIDList.indexOf(gameDetails[this.i+1])
      if(index>=0)
      {
        this.allPlayerCheckedList[index]=true;
      }
    }
  }

  refreshInProgressGame(gameDetails)
  {
    
    console.log('refreshInProgressGame');
    this.getActiveGameDetail().then(activeGameData=>
    {
      console.log("ActivegameDetails ",JSON.stringify(activeGameData) );
      if(activeGameData['error'])
      {
        console.log('activeGameData',activeGameData['error']);
      }
      else if(activeGameData['syncError'])
      {
        this.presentAlertSyncError('Waiting',activeGameData['syncError']);
        if(this.timer)
        {
          this.timer.hasStarted = false;
          this.timer.runTimer = false;
          this.timer.secondsRemaining=0;
        }
      }
      else
      {
        if(activeGameData['type']=='gameOver')
        {
          this.zone.run(()=> this.refreshView());
        }
        else
        {
          while(this.playerIDList.length>0)
          {
            this.playerIDList.pop();
            this.playerList.pop();
            this.playerStepList.pop();
            this.playerActiveMinuteList.pop();
            this.playerImageList.pop();
          }
          this.currentcumulativeSteps=0
          this.timeRemaining = activeGameData['timeRemaining'];
          this.selfID = activeGameData['selfID'];
          this.currentSteps = activeGameData['currentSteps'];
          this.currentActiveMinutes = activeGameData['currentActivityTime'];
          this.stageInterval = activeGameData['stageInterval'];
          
          for(this.i=0;this.i<activeGameData['numberOfPlayers']*4;this.i = this.i + 4)
          {
            this.playerIDList.push(activeGameData[this.i]);
            this.playerList.push(activeGameData[this.i+1]);
            this.playerStepList.push(activeGameData[this.i+2]);
            this.playerActiveMinuteList.push(activeGameData[this.i+3]);
            if(activeGameData[this.i] == this.selfID )
            {
              this.selfStepsAccumulated = activeGameData[this.i+2];
              this.selfActiveMinutesAccumulated = activeGameData[this.i+3];
              
            }
            if(this.gameType=='comp')
            {
                console.log("getting background image for",activeGameData[this.i+1],activeGameData[this.i+2],this.getBackgroundImage(activeGameData[this.i+2],false))
                let str= this.getBackgroundImage(activeGameData[this.i+2],false);
                
                str = 'assets/imgs/'.concat(str).concat('.png')
                
                this.playerImageList.push(str);
                
            }
            else
            {
              this.currentcumulativeSteps += activeGameData[this.i+2];
              this.endValue = activeGameData['endValue'];      
            }

            
          }
          if(this.gameType=='col')
          {
            if(this.currentcumulativeSteps <=this.endValue)
            {
              this.stepsToWin = this.endValue-this.currentcumulativeSteps;
            }  
            else
            {
              this.finishGame().then(finishGameData=>
              {
                this.zone.run(()=> this.refreshView());
              })
            }
            this.changeBackgroundGroup(this.currentcumulativeSteps,false )
          }
          console.log(this.playerImageList)
          if(!this.timer)
          {
            this.initTimer();
            this.startTimer();
          }
          this.timer.secondsRemaining = this.timeRemaining;
        }
      }      
    })
  }

  Done()
  {
    this.navCtrl.pop();
  }

  getBackgroundImage(steps,lost)
  {

    let str=""
    /*
    if(steps<300) str = 'nogem';
    else if(steps>=300 && steps<800)    str = 'gem1';
    else if(steps>=800 && steps<1300)   str = 'gem2';
    else if(steps>=1300 && steps<1800)  str = 'gem3';
    else if(steps>=1800 && steps<2300)  str = 'gem4';
    else if(steps>=2300 && steps<2800)  str = 'gem5';
    else if(steps>=2800 && steps<3300)  str = 'gem6';
    else if(steps>=3300 && steps<3800)  str = 'gem7';
    else if(steps>=3800 && steps<4300)  str = 'gem8';
    else if(steps>=4300 && steps<4800)  str = 'gem9';
    else if(steps>=4800 && steps<5300)  str = 'gem10';
    else if(steps>=5300 && steps<5800)  str = 'gem11';
    else if(steps>=5800 && steps<6300)  str = 'gem12';
    else if(steps>=6300 && steps<6800)  str = 'gem13';
    else if(steps>=6800 && steps<7300)  str = 'gem14';
    else if(steps>=7300 && steps<7800)  str = 'gem15';
    else if(steps>=7800 && steps<8300)  str = 'gem16';
    else if(steps>=8300 && steps<8800)  str = 'gem17';
    else if(steps>=8800 && steps<9300)  str = 'gem18';
    else if(steps>=9300 && steps>9800)  str = 'gem19';
    else if(steps>=9800)                str = 'gem20';
    if(lost==true)
    {
      if(str=='nogem') str = 'lost_nogem';
      else if(str=='gem1' || str=='gem2') str= 'lost_gem1';
      else if(str=='gem3' || str=='gem4') str= 'lost_gem2';
      else if(str=='gem5' || str=='gem6') str= 'lost_gem3';
      else if(str=='gem7' || str=='gem8') str= 'lost_gem4';
      else if(str=='gem9' || str=='gem10') str= 'lost_gem5';
      else if(str=='gem11' || str=='gem12') str= 'lost_gem6';
      else if(str=='gem13' || str=='gem14') str= 'lost_gem7';
      else if(str=='gem15' || str=='gem16') str= 'lost_gem8';
      else if(str=='gem17' || str=='gem18'|| str=='gem19' || str=='gem20') str= 'lost_gem9';
      
    }
    */

   if(steps<300) str = 'nogem';
   else if(steps>=300 && steps<800)    str = 'gem1';
   else if(steps>=800 && steps<1300)   str = 'gem2';
   else if(steps>=1300 && steps<1800)  str = 'gem3';
   else if(steps>=1800 && steps<2300)  str = 'gem4';
   else if(steps>=2300 && steps<2800)  str = 'gem5';
   else if(steps>=2800 && steps<3300)  str = 'gem6';
   else if(steps>=3300 && steps<3800)  str = 'gem7';
   else if(steps>=3800 && steps<4300)  str = 'gem8';
   else if(steps>=4300 && steps<4800)  str = 'gem9';
   else if(steps>=4800 && steps<5300)  str = 'gem10';
   else if(steps>=5300 && steps<5800)  str = 'gem11';
   else if(steps>=5800 && steps<6300)  str = 'gem12';
   else if(steps>=6300 && steps<6800)  str = 'gem13';
   else if(steps>=6800 && steps<7300)  str = 'gem14';
   else if(steps>=7300 && steps<7800)  str = 'gem15';
   else if(steps>=7800 && steps<8300)  str = 'gem16';
   else if(steps>=8300 && steps<8800)  str = 'gem17';
   else if(steps>=8800 && steps<9300)  str = 'gem18';
   else if(steps>=9300 && steps>9800)  str = 'gem19';
   else if(steps>=9800)                str = 'gem20';
   if(lost==true)
   {
    if(str=='nogem') str = 'lost_nogem';
    else if(str=='gem1' || str=='gem2') str= 'lost_gem1';
    else if(str=='gem3' || str=='gem4') str= 'lost_gem2';
    else if(str=='gem5' || str=='gem6') str= 'lost_gem3';
    else if(str=='gem7' || str=='gem8') str= 'lost_gem4';
    else if(str=='gem9' || str=='gem10') str= 'lost_gem5';
    else if(str=='gem11' || str=='gem12') str= 'lost_gem6';
    else if(str=='gem13' || str=='gem14') str= 'lost_gem7';
    else if(str=='gem15' || str=='gem16') str= 'lost_gem8';
    else if(str=='gem17' || str=='gem18'|| str=='gem19' || str=='gem20') str= 'lost_gem9';
     
   }
    return str;
  }

  changeBackgroundGroup(steps,lost)
  {
    console.log("changeBackgroundGroup",steps)
    let str =""
    if(steps<this.endValue*0.05) str  ='nogem';
    else if(this.endValue*0.05 <=steps  && this.endValue*0.1 >steps) str = 'gem1';
    else if(this.endValue*0.1 <=steps  && this.endValue*0.15 >steps) str = 'gem2';
    else if(this.endValue*0.15 <=steps  && this.endValue*0.2 >steps) str = 'gem3';
    else if(this.endValue*0.2 <=steps  && this.endValue*0.25 >steps) str = 'gem4';
    else if(this.endValue*0.25 <=steps  && this.endValue*0.3 >steps) str = 'gem5';
    else if(this.endValue*0.3 <=steps  && this.endValue*0.35 >steps) str = 'gem6';
    else if(this.endValue*0.35 <=steps  && this.endValue*0.4 >steps) str = 'gem7';
    else if(this.endValue*0.4 <=steps  && this.endValue*0.45 >steps) str = 'gem8';
    else if(this.endValue*0.45 <=steps  && this.endValue*0.5 > steps) str = 'gem9';

    else if(this.endValue*0.5 <=steps  && this.endValue*0.55 >steps) str = 'gem10';
    else if(this.endValue*0.55 <=steps  && this.endValue*0.6 >steps) str = 'gem11';
    else if(this.endValue*0.6 <=steps  && this.endValue*0.65 >steps) str = 'gem12';
    else if(this.endValue*0.65 <=steps  && this.endValue*0.7 >steps) str = 'gem13';
    else if(this.endValue*0.7 <=steps  && this.endValue*0.75 >steps) str = 'gem14';
    else if(this.endValue*0.75 <=steps  && this.endValue*0.8 >steps) str = 'gem15';
    else if(this.endValue*0.8 <=steps  && this.endValue*0.85 >steps) str = 'gem16';
    else if(this.endValue*0.85 <=steps  && this.endValue*0.9 > steps) str = 'gem17';
    else if(this.endValue*0.9 <=steps && this.endValue*0.95 >steps ) str='gem18';
    else if(this.endValue*0.95 <=steps && this.endValue>steps ) str='gem19';
    else if(steps>this.endValue) str='gem20';

    if(lost==true)
    {
      if(str=='nogem') str = 'lost_nogem';
      else if(str=='gem1' || str=='gem2') str= 'lost_gem1';
      else if(str=='gem3' || str=='gem4') str= 'lost_gem2';
      else if(str=='gem5' || str=='gem6') str= 'lost_gem3';
      else if(str=='gem7' || str=='gem8') str= 'lost_gem4';
      else if(str=='gem9' || str=='gem10') str= 'lost_gem5';
      else if(str=='gem11' || str=='gem12') str= 'lost_gem6';
      else if(str=='gem13' || str=='gem14') str= 'lost_gem7';
      else if(str=='gem15' || str=='gem16') str= 'lost_gem8';
      else if(str=='gem17' || str=='gem18'|| str=='gem19' || str=='gem20') str= 'lost_gem9';
      
    }
    
    console.log(str)
    this.bgImage=str;
  }
}
