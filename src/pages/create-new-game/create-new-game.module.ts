import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateNewGamePage } from './create-new-game';

@NgModule({
  declarations: [
    CreateNewGamePage,
  ],
  imports: [
    IonicPageModule.forChild(CreateNewGamePage),
  ],
})
export class CreateNewGamePageModule {}
