import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { AlertController } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import {globals} from '../../app/globalConstants';

/**
 * Generated class for the CreateNewGamePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-new-game',
  templateUrl: 'create-new-game.html',
  providers:[globals]
})
export class CreateNewGamePage {

  userName;
  userSteps;
  userActiveMinutes;

  teamButtonColor ="primary";
  challengeButtonColor = "light";

  i=0;

  playersList=[]
  playerIDList=[]
  playerEmailList=[]

  userEmail:any;
  accesstoken:any;
  gameID:any;
  gameInstanceID=0;
  canDeletePlayer=false;
  groupName="";
  networkStatus;
  checkedItems=[]
  playersInGame=[]

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public httpClient:HttpClient,
              private storage:Storage,
              private zone:NgZone,
              private alertCtrl: AlertController,
              private events:Events,
              private network:Network,
              private global:globals) {
                this.userName = this.navParams.get('name');
                this.userSteps = this.navParams.get('userSteps');
                this.userActiveMinutes = this.navParams.get('userActiveMinutes');
  }

  ionViewDidLoad() 
  {
    console.log('ionViewDidLoad CreateNewGamePage');
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
    this.events.subscribe('networkStatus',(networkData)=>
    {
      this.networkStatus=networkData;
    })
    this.zone.run(()=> this.refreshView());
  }

  ionViewWillLeave()
  {
    if(this.groupName.length>0 && this.gameInstanceID)
    {
      this.editGroupName();
    }
    this.events.unsubscribe('networkStatus');
  }

  teamButonClicked()
  {
    this.teamButtonColor ="primary";
    this.challengeButtonColor = "light";
    this.zone.run(()=> this.refreshView());
  }

  challengeButtonClicked()
  {
    this.challengeButtonColor="primary";
    this.teamButtonColor='light';
    this.zone.run(()=> this.refreshView());
  }

  getGameID()
  {
    var link="";
    if(this.teamButtonColor=='primary')
    {
      link = this.global.serverURI.concat('get_gameID.php?gameName=captureTheCrownSyncCollaborative');
    }
    else
    {
      link = this.global.serverURI.concat('get_gameID.php?gameName=captureTheCrownSyncCompetitive');
    }
    link = link.concat('&metric=steps');
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
    })
  }

  addPlayers(frndemail)
  {
    var link = this.global.serverURI.concat('addPlayerToGameInstance.php?gameInstanceID=');
    link= link.concat(String(this.gameInstanceID));
    link= link.concat('&self=');
    link= link.concat(this.userEmail);
    link=link.concat('&friend=');
    link = link.concat(frndemail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken); 
    console.log('addPlayers',link)
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

  createGameInstance(frndemail)
  {
    var link = this.global.serverURI.concat('createGameInstance.php?gameID=');
    link= link.concat(this.gameID);
    link= link.concat('&self=');
    link= link.concat(this.userEmail);
    link=link.concat('&friend=');
    link = link.concat(frndemail);
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
        this.presentAlert('Internet Disconnected','Please retry after connecting to the internet','Retry');
      }
    })
  }

  presentAlert(titleMessage :string,subTitleMessage:string,buttonText:string) 
  {
    let alert = this.alertCtrl.create({
      title: titleMessage,
      subTitle: subTitleMessage,
      buttons: [buttonText]
    });
    alert.present();
  }

  deletePlayer(i)
  {
    let userID = this.playerIDList[i];
    this.removePlayerFromGameInstance(userID).then(removePlayerData=>
    {
      if(removePlayerData['error'])
      {
        
      }
      else{
        this.zone.run(()=> this.refreshView());
        }      
    });
  }

  removePlayerFromGameInstance(i)
  {
    var link = this.global.serverURI.concat('removePlayerFromGameInstance.php?self=');
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link=link.concat('&gameInstanceID=');
    link=link.concat(String(this.gameInstanceID));
    link = link.concat('&friendID=');
    link=link.concat(i);
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


  Done()
  {
    this.navCtrl.pop();
  }

  editGroupName()
  {
    var link = this.global.serverURI.concat('editGroupName.php?self=');
      link = link.concat(this.userEmail);
      link = link.concat('&accessToken=');
      link = link.concat(this.accesstoken);
      link = link.concat('&gameInstanceID=');
      link = link.concat(String(this.gameInstanceID));
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

  newGame()
  {
    for(this.i=0;this.i<this.checkedItems.length;this.i++)
    {
      if(this.checkedItems[this.i])
      {
        this.playersInGame.push(this.playerEmailList[this.i])
      }
    }
    if(this.playersInGame.length==0)
    {
      this.presentAlert(' ', ' Choose atleast 1 player','OK')
    }
    else
    {
      this.getGameID().then(gameIDData=>
      {
        if(!gameIDData['error'])
        {
          this.gameID = gameIDData['gameID'];
          this.createGameInstance(this.playersInGame[0]).then(creategameInstancedata=>
          {
            console.log('Create Game Instance response', creategameInstancedata);
            if(creategameInstancedata['error'])
            {
              this.presentAlert('Error',creategameInstancedata['error'],'OK');
            }
            else
            {
              this.gameInstanceID=creategameInstancedata['gameInstanceID'];
              this.editGroupName();
              if(!(this.groupName.length>0) ) 
              {
                this.groupName=creategameInstancedata['groupName'];
              }
            }
            if(this.playersInGame.length>1)
            {
              for(this.i=1;this.i<this.playersInGame.length;this.i++)
              {
                this.addPlayers(this.playersInGame[this.i]);
              }
            }
          })
        }
      })
    }
    this.zone.run(()=> this.refreshView());
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
    this.getUsername().then(usernameData=>
    {
      this.getUserToken().then(usertokendata=>
      {
        if(this.gameInstanceID<1)
        {
          if(this.checkedItems.length==0)
          {
            this.getPlayersFromGroupID().then(possiblePlayers=>
            {
              if(!possiblePlayers['error'])
              {
                for(this.i=0;this.i<possiblePlayers['numberOfPlayers']*3;this.i=this.i+3)
                {
                  if(this.userName!=possiblePlayers[this.i+1])
                  {
                    this.playerIDList.push(possiblePlayers[this.i])
                    this.playersList.push(possiblePlayers[this.i+1])
                    this.playerEmailList.push(possiblePlayers[this.i+2])
                    this.checkedItems.push(false);
                  }
                }
              }
            })
          }
        }
      })
    })
  }

  updatePlayers()
  {
    for(this.i=0;this.i<this.checkedItems.length;this.i++)
    {
      let index = this.playersInGame.indexOf(this.playerEmailList[this.i])
      if(this.checkedItems[this.i])
      {
        if(index>-1)
        {
          console.log(this.playerEmailList[this.i]," already exists")
        }
        else
        {
          this.addPlayers(this.playerEmailList[this.i])
          this.playersInGame.push(this.playerEmailList[this.i]);
        }
      }
      else
      {
        if(index>-1)
        {
          this.removePlayerFromGameInstance(this.playerIDList[this.i]).then(removePlayerData=>
            {
              if(removePlayerData['error'])
              {
                
              }
              else{
                this.playersInGame.splice(index,1);
                this.zone.run(()=> this.refreshView());
                }      
            });
          
        }
      }
    }
  }

}
