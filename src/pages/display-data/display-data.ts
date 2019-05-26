import { Component,NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';

import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network';
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
  gameIDCol:null;
  gameIDComp:null;
  networkStatus;

   // Invited Games
   invitedGameInstancesCol=[];
   invitedGamesListCol=[];
   invitedGroupNameListCol=[];

   invitedAcceptedGameInstanceCol=[];
   invitedAcceptedGamesListCol=[]
   invitedAcceptedGroupNameListCol=[];

   
   invitedGameInstancesComp=[];
   invitedGamesListComp=[];
   invitedGroupNameListComp=[];

   invitedAcceptedGameInstanceComp=[];;
   invitedAcceptedGamesListComp=[]
   invitedAcceptedGroupNameListComp=[];
   numberOfInvitedGames=0;

   invitedGameArrow ="arrow-dropdown"
   expandInvitedGame=false;


  // Active Games 
  activeGameInstancesCol=[];
  activeGamesListCol=[];
  activeGroupNameListCol=[];

  readyToPlayGameInstancesCol=[];
  readyToPlayGamesListCol=[];
  readyToPlayGroupNameListCol=[]

  activeGameInstancesComp=[];
  activeGamesListComp=[];
  activeGroupNameListComp=[];

  readyToPlayGameInstancesComp=[];
  readyToPlayGamesListComp=[];
  readyToPlayGroupNameListComp=[]
  numberOfActiveGames=0;
  
  activeGameArrow="arrow-dropdown"
  expandActiveGame =false;

  // Completed Games
  gameOverInstancesCol=[];
  gameOverPlayersListCol =[];
  gameOverGroupNameListCol =[];
  gameOverMyStatusListCol = [];

  gameOverInstancesComp =[];
  gameOverPlayersListComp = [];
  gameOverGroupNameListComp = [];
  gameOverMyStatusListComp = [];
  numberOfCompletedGames=0;
  numberofWinGames=0;
  
  completedGameArrow="arrow-dropdown"
  expandCompletedGame=false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private storage:Storage,
              private zone : NgZone,
              public httpClient:HttpClient,
              public events: Events, 
              private alertCtrl:AlertController,
              private network:Network,
              private global:globals) 
              {
                this.userdata=this.navParams.get('data');
                this.userName=this.userdata['username'] ;
                this.userSteps=this.userdata['steps'];
                this.userActiveMinutes = this.userdata['fairlyActiveMinutes']+this.userdata['veryActiveMinutes'];
  }

  ionViewDidLoad() 
  {
    console.log('ionViewDidLoad DisplayDataPage');
  }

  ionViewWillEnter()
  {
      this.numberOfActiveGames=0;
      this.numberOfInvitedGames=0;
      this.numberOfCompletedGames=0;
      let type = this.network.type;
      if(type=='none'||type=='undefined')
      {
        this.networkStatus='offline';
      }
      else
      {
        this.networkStatus='online';
      }
      this.events.subscribe('gameStart',(gameStartData)=>
      {
        this.zone.run(()=> this.refreshView());
      })

      this.events.subscribe('gameOver',(data)=>
      {
        this.zone.run(()=> this.refreshView());
      })

      this.events.subscribe('networkStatus',(networkData)=>
      {
        this.networkStatus=networkData;
      })
      this.zone.run(()=> this.refreshView());
  }

  ionViewWillLeave()
  {
      this.events.unsubscribe('gameStart');
      this.events.unsubscribe('gameOver');
      this.events.unsubscribe('networkStatus');
  }

  Logout()
  {
      console.log("Logging out");
      this.storage.remove('accessTokenCTTAsyncS');
      this.storage.remove('userEmailCTTAsyncS');
      this.navCtrl.pop();
  }

  createNewGame()
  {
      this.navCtrl.push('CreateNewGamePage',{name:this.userName,userSteps:this.userSteps,userActiveMinutes:this.userActiveMinutes})
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

  /** Get Email from storage */
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

  /** Get Access Token From Storage */
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

  /** Get List of Invited Games */
  getInvitedGamesComp()
  {
    console.log('gameIDComp', this.gameIDComp)
    var link = this.global.serverURI.concat('getInvitedGames.php?self=') ;
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link=link.concat('&gameID=');
    link=link.concat(this.gameIDComp);
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

  getInvitedGamesCol()
  {
    console.log('gameIDCol',this.gameIDCol);
    var link = this.global.serverURI.concat('getInvitedGames.php?self=') ;
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link=link.concat('&gameID=');
    link=link.concat(this.gameIDCol);
    console.log('getInvitedGamesCol',link)
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

  /** Get List of Active Games */
  getActiveGamesComp()
  {
    var link = this.global.serverURI.concat('getActiveGames.php?self=') ; 
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link=link.concat('&gameID=');
    link=link.concat(this.gameIDComp);
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

  getActiveGamesCol()
  {
    var link = this.global.serverURI.concat('getActiveGames.php?self=') ; 
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link=link.concat('&gameID=');
    link=link.concat(this.gameIDCol);
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

  /** Get List of Completed Games */
  getFinishedGamesComp()
  {
    var link = this.global.serverURI.concat('getFinishedGames.php?self=') ; 
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link = link.concat('&gameID=').concat(this.gameIDComp);
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

  getFinishedGamesCol()
  {
    var link = this.global.serverURI.concat('getFinishedGames.php?self=') ; 
    link= link.concat(this.userEmail);
    link = link.concat('&accessToken=');
    link= link.concat(this.accesstoken);
    link = link.concat('&gameID=').concat(this.gameIDCol);
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

  /** Accept Game Invite  */
  acceptInvite(i,type)
  {
    let gameInstance;
    if(type=='comp')
    {
      gameInstance = this.invitedGameInstancesComp[i];
      
    }
    else
    {
      gameInstance = this.invitedGameInstancesCol[i];
    }

    this.getUsername().then(userNameData =>
    {
      this.getUserToken().then(userTokenData =>
      {
        var link = this.global.serverURI.concat('acceptGameInvite.php?self=');
        link = link.concat(this.userEmail);
        link = link.concat('&accessToken=');
        link= link.concat(this.accesstoken);
        link=link.concat('&gameInstanceID=');
        link = link.concat(gameInstance);
        this.updateInvitation(link).then(data =>
        {
            this.zone.run(()=> this.refreshView());
        });
      })
    })
  }

  /** Decline Game Invite  */
  DeclineInvite(i,type)
  {

    let gameInstance;
    if(type=='comp')
    {
      gameInstance = this.invitedGameInstancesComp[i];
      
    }
    else
    {
      gameInstance = this.invitedGameInstancesCol[i];
    }
    this.getUsername().then(userNameData =>
    {
      this.getUserToken().then(userTokenData =>
      {
        var link = this.global.serverURI.concat('declineGameInvite.php?self=');
        link= link.concat(this.userEmail);
        link = link.concat('&accessToken=');
        link= link.concat(this.accesstoken);
        link=link.concat('&gameInstanceID=');
        link = link.concat(gameInstance);
        this.updateInvitation(link).then(data =>
        {
          this.zone.run(()=> this.refreshView());
        });
      })
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

  /** Change Game state after invitation is accepted or declined */
  updateInvitation(link)
  {
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

  /** Open Game Instance page for given GameInstanceID */
  openGameDetails(gameType, gameIndex,type)
  {
    let gameInstance,gameid,gametype;
    if(type=='comp')
    {
      gameid = this.gameIDComp;
      gametype = 'comp';
      if(gameType==1)
      {
        gameInstance = this.invitedAcceptedGameInstanceComp[gameIndex];
      }
      if(gameType==2)
      {
        gameInstance = this.invitedGameInstancesComp[gameIndex];
      }
      if(gameType==3)
      {
        gameInstance = this.readyToPlayGameInstancesComp[gameIndex];
      }
      if(gameType==4)
      {
        gameInstance = this.activeGameInstancesComp[gameIndex];
      }
      if(gameType==5)
      {
        gameInstance = this.gameOverInstancesComp[gameIndex]
      }
    }
    else
    {
      gameid = this.gameIDCol;
      gametype = 'col';
      if(gameType==1)
      {
        gameInstance = this.invitedAcceptedGameInstanceCol[gameIndex];
      }
      if(gameType==2)
      {
        gameInstance = this.invitedGameInstancesCol[gameIndex];
      }
      if(gameType==3)
      {
        gameInstance = this.readyToPlayGameInstancesCol[gameIndex];
      }
      if(gameType==4)
      {
        gameInstance = this.activeGameInstancesCol[gameIndex];
      }
      if(gameType==5)
      {
        gameInstance = this.gameOverInstancesCol[gameIndex]
      }
    }
    this.navCtrl.push('GameInstancePage',{gameInstanceID:gameInstance,userSteps:this.userSteps,gameID:gameid, userActiveMinutes:this.userActiveMinutes, gameType :gametype});
  }

  /** Refresh list of invited games */
  refreshInvitedGames()
  {
    let i = 0;
    this.getInvitedGamesComp().then(InvitedGamesCompData=>
    {
      console.log('getInvitedGamesComp', InvitedGamesCompData);
      if(InvitedGamesCompData['error'])
      {
        this.presentAlert('Error', InvitedGamesCompData['error'],'OK');
      }
      else
      {
        while(this.invitedAcceptedGameInstanceComp.length>0)
        {
          this.invitedAcceptedGameInstanceComp.pop();
          this.invitedAcceptedGamesListComp.pop();
          this.invitedAcceptedGroupNameListComp.pop();
        }
        while(this.invitedGameInstancesComp.length>0)
        {
          this.invitedGameInstancesComp.pop();
          this.invitedGamesListComp.pop();
          this.invitedGroupNameListComp.pop()
        }  
        
        for(i=0;i<4*InvitedGamesCompData['numberOfInvitedGames'];i=i+4)
        {
          if(InvitedGamesCompData[i+3] == 'userReadyToPlay')
          {
            this.invitedAcceptedGameInstanceComp.push(InvitedGamesCompData[i]);
            this.invitedAcceptedGamesListComp.push(InvitedGamesCompData[i+2]);
            let displayString = InvitedGamesCompData[i+1].concat(' (').concat(InvitedGamesCompData[i+2]).concat(' )');
            this.invitedAcceptedGroupNameListComp.push(displayString);
          }
          else
          {
            this.invitedGameInstancesComp.push(InvitedGamesCompData[i]);
            this.invitedGamesListComp.push(InvitedGamesCompData[i+2]);
            let displayString = InvitedGamesCompData[i+1].concat(' (').concat(InvitedGamesCompData[i+2]).concat(' )');
            this.invitedGroupNameListComp.push(  displayString    );
          }
        }
      }
    })

    this.getInvitedGamesCol().then(InvitedGamesColData=>
    {
      console.log('getInvitedGamesCol', InvitedGamesColData);
      if(InvitedGamesColData['error'])
      {
        this.presentAlert('Error', InvitedGamesColData['error'],'OK');
      }
      else
      {
        while(this.invitedAcceptedGameInstanceCol.length>0)
        {
          this.invitedAcceptedGameInstanceCol.pop();
          this.invitedAcceptedGamesListCol.pop();
          this.invitedAcceptedGroupNameListCol.pop();
        }
        while(this.invitedGameInstancesCol.length>0)
        {
          this.invitedGameInstancesCol.pop();
          this.invitedGamesListCol.pop();
          this.invitedGroupNameListCol.pop()
        }  
        
        for(i=0;i<4*InvitedGamesColData['numberOfInvitedGames'];i=i+4)
        {
          if(InvitedGamesColData[i+3] == 'userReadyToPlay')
          {
            this.invitedAcceptedGameInstanceCol.push(InvitedGamesColData[i]);
            this.invitedAcceptedGamesListCol.push(InvitedGamesColData[i+2]);
            let displayString = InvitedGamesColData[i+1].concat(' (').concat(InvitedGamesColData[i+2]).concat(' )');
            this.invitedAcceptedGroupNameListCol.push(displayString);
          }
          else
          {
            this.invitedGameInstancesCol.push(InvitedGamesColData[i]);
            this.invitedGamesListCol.push(InvitedGamesColData[i+2]);
            let displayString = InvitedGamesColData[i+1].concat(' (').concat(InvitedGamesColData[i+2]).concat(' )');
            this.invitedGroupNameListCol.push(displayString);
          }
        }
      }
    })
    this.numberOfInvitedGames = this.invitedAcceptedGameInstanceComp.length + this.invitedGameInstancesComp.length + this.invitedAcceptedGameInstanceCol.length + this.invitedGameInstancesCol.length;
  }

  /** Refresh list of Active games */
  refreshActiveGames()
  {
    let i=0;
    this.getActiveGamesComp().then(activeGamesCompData=>
    {
      console.log('getActiveGamesComp',activeGamesCompData);
      if(activeGamesCompData['error'])
      {
        this.presentAlert('Error',activeGamesCompData['error'],'OK');
      }
      else
      {
        while(this.readyToPlayGameInstancesComp.length>0)
        {
          this.readyToPlayGameInstancesComp.pop();
          this.readyToPlayGamesListComp.pop();
          this.readyToPlayGroupNameListComp.pop();
        }
        while(this.activeGameInstancesComp.length>0)
        {
          this.activeGameInstancesComp.pop();
          this.activeGamesListComp.pop();
          this.activeGroupNameListComp.pop();
        }
        for(i=0;i<activeGamesCompData['numberOfActiveGames']*4;i=i+4)
        {
          if(activeGamesCompData[i+3]=='gameReadyToPlay')
          {
            this.readyToPlayGameInstancesComp.push(activeGamesCompData[i]);
            this.readyToPlayGamesListComp.push(activeGamesCompData[i+1]);
            let displayString = activeGamesCompData[i+1].concat(' (').concat(activeGamesCompData[i+2]).concat(' )');
            this.readyToPlayGroupNameListComp.push(displayString);
          }
          else
          {
            this.activeGameInstancesComp.push(activeGamesCompData[i]);
            this.activeGamesListComp.push(activeGamesCompData[i+1]);
            let displayString = activeGamesCompData[i+1].concat(' (').concat(activeGamesCompData[i+2]).concat(' )');
            this.activeGroupNameListComp.push(displayString);
          }
        }
      }
    })

    this.getActiveGamesCol().then(activeGamesColData=>
    {
      console.log('getActiveGamesCol',activeGamesColData);
      if(activeGamesColData['error'])
      {
        this.presentAlert('Error',activeGamesColData['error'],'OK');
      }
      else
      {
        while(this.readyToPlayGameInstancesCol.length>0)
        {
          this.readyToPlayGameInstancesCol.pop();
          this.readyToPlayGamesListCol.pop();
          this.readyToPlayGroupNameListCol.pop();
        }
        while(this.activeGameInstancesCol.length>0)
        {
          this.activeGameInstancesCol.pop();
          this.activeGamesListCol.pop();
          this.activeGroupNameListCol.pop();
        }
        for(i=0;i<activeGamesColData['numberOfActiveGames']*4;i=i+4)
        {
          if(activeGamesColData[i+3]=='gameReadyToPlay')
          {
            this.readyToPlayGameInstancesCol.push(activeGamesColData[i]);
            this.readyToPlayGamesListCol.push(activeGamesColData[i+1]);
            let displayString = activeGamesColData[i+1].concat(' (').concat(activeGamesColData[i+2]).concat(' )');
            this.readyToPlayGroupNameListCol.push(displayString);
          }
          else
          {
            this.activeGameInstancesCol.push(activeGamesColData[i]);
            this.activeGamesListCol.push(activeGamesColData[i+1]);
            let displayString = activeGamesColData[i+1].concat(' (').concat(activeGamesColData[i+2]).concat(' )');
            this.activeGroupNameListCol.push(displayString);
          }
        }
      }
    })
    this.numberOfActiveGames = this.readyToPlayGameInstancesComp.length+this.activeGameInstancesComp.length+ this.readyToPlayGameInstancesCol.length+ this.activeGameInstancesCol.length;
  }

  /** Refresh list of Completed games */
  refreshFinishedGames()
  {
    let i=0;
    this.numberofWinGames=0
    this.getFinishedGamesComp().then(finishedGameDataComp=>
    {
      console.log('getFinishedGamesComp', finishedGameDataComp);
      if(finishedGameDataComp['errot'])
      {
        this.presentAlert('Error',finishedGameDataComp['error'],'OK');
      }
      else
      {
        while(this.gameOverInstancesComp.length>0)
        {
          this.gameOverInstancesComp.pop();
          this.gameOverPlayersListComp.pop();
          this.gameOverMyStatusListComp.pop();
          this.gameOverGroupNameListComp.pop();
        }
        for(i=0;i<4*finishedGameDataComp['noOfFinishedGames'];i=i+4)
        {
          this.gameOverInstancesComp.push(finishedGameDataComp[i]);
          this.gameOverPlayersListComp.push(finishedGameDataComp[i+2]);
          if(finishedGameDataComp[i+3]=='userLost')
          {
            this.gameOverMyStatusListComp.push('You Lost');
          }
          else
          {
            this.gameOverMyStatusListComp.push('You Won');
            this.numberofWinGames +=1;
          }
          let displayString = finishedGameDataComp[i+1].concat(' (').concat(finishedGameDataComp[i+2]).concat(' )');
          this.gameOverGroupNameListComp.push(displayString);
        }
      }
    })
    
    this.getFinishedGamesCol().then(finishedGameDataCol=>
      {
        console.log('getFinishedGamesCol', finishedGameDataCol);
        if(finishedGameDataCol['errot'])
        {
          this.presentAlert('Error',finishedGameDataCol['error'],'OK');
        }
        else
        {
          while(this.gameOverInstancesCol.length>0)
          {
            this.gameOverInstancesCol.pop();
            this.gameOverPlayersListCol.pop();
            this.gameOverMyStatusListCol.pop();
            this.gameOverGroupNameListCol.pop();
          }
          for(i=0;i<4*finishedGameDataCol['noOfFinishedGames'];i=i+4)
          {
            this.gameOverInstancesCol.push(finishedGameDataCol[i]);
            this.gameOverPlayersListCol.push(finishedGameDataCol[i+2]);
            if(finishedGameDataCol[i+3]=='userLost')
            {
              this.gameOverMyStatusListCol.push('You Lost');
            }
            else
            {
              this.gameOverMyStatusListCol.push('You Won');
              this.numberofWinGames +=1;
            }
            let displayString = finishedGameDataCol[i+1].concat(' (').concat(finishedGameDataCol[i+2]).concat(' )');
            this.gameOverGroupNameListCol.push(displayString);
          }
        }
      })
      this.numberOfCompletedGames = this.gameOverInstancesCol.length+this.gameOverInstancesComp.length;
  }

  /** Get GAME ID FROM GAME NAME AND METRIC TYPE */
  getGameIDComp()
  {
    var link = this.global.serverURI.concat('get_gameID.php?gameName=captureTheCrownSyncCompetitive')
    link=link.concat('&metric=');
    link=link.concat('steps');
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

  getGameIDCol()
  {
    var link = this.global.serverURI.concat('get_gameID.php?gameName=captureTheCrownSyncCollaborative')
    link=link.concat('&metric=');
    link=link.concat('steps');
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

  /** Expand Invites Games List */
 expandInvitedGames()
 {
   if(this.invitedGameArrow=="arrow-dropdown")
   { 
     this.invitedGameArrow='arrow-dropup';
     this.expandInvitedGame=true;
     
   }
   else if(this.invitedGameArrow=="arrow-dropup")
   {
     this.invitedGameArrow='arrow-dropdown';
     this.expandInvitedGame=false;
   }
   this.zone.run(()=> this.refreshInvitedGames());
 }

 expandActiveGames()
 {  
   if(this.activeGameArrow=="arrow-dropdown")
   {
     this.activeGameArrow='arrow-dropup';
     this.expandActiveGame=true;
   }
   else if(this.activeGameArrow=="arrow-dropup")
   {
     this.activeGameArrow='arrow-dropdown';
     this.expandActiveGame=false;
   }
   this.zone.run(()=> this.refreshActiveGames());
 }
 
 expandCompletedGames()
 { 
   if(this.completedGameArrow=="arrow-dropdown")
   {
     this.completedGameArrow='arrow-dropup';
     this.expandCompletedGame=true;

   }
   else if(this.completedGameArrow=="arrow-dropup")
   {
     this.completedGameArrow='arrow-dropdown';
     this.expandCompletedGame=false;
   }
   this.zone.run(()=>this.refreshFinishedGames());
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
    this.getUsername().then(userNameData=>
    {
      this.getUserToken().then(accesstokenData=>
      {
        this.getGameIDComp().then(gameIDcomp=>
        {
          this.gameIDComp = gameIDcomp['gameID'];
          this.getGameIDCol().then(gameIDcol=>
          {
            this.gameIDCol = gameIDcol['gameID'];
            this.getCurrentActivity().then(currentActivityData=>
            {
              if(currentActivityData['steps'])
              {
                this.userSteps = currentActivityData['steps'];
                this.userActiveMinutes = currentActivityData['activeMinutes'];
              }
              this.refreshInvitedGames();
              this.refreshActiveGames();
              this.refreshFinishedGames();
            })
          })
        })
      })
    })
  }

}
