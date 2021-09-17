import { Injectable } from '@angular/core';
import {DirectoryService, McFile} from './directory-service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Configuration, PreferencesService} from './preferences.service';
import {map} from 'rxjs/operators';


export interface AppStatus {
  currentLeftFolder? : McFile;
  currentRightFolder? : McFile;
}



@Injectable({
  providedIn: 'root'
})
export class CommandCenterService {


  private appStatus : AppStatus | undefined = undefined;

  private directoryChanged  =  {
    "left" : new BehaviorSubject<McFile>(<McFile>this.appStatus?.currentLeftFolder),
    "right" : new BehaviorSubject<McFile>(<McFile>this.appStatus?.currentRightFolder),
  }
  private directoryContentChanged  =  {
    "left" : new Subject<McFile[]>(),
    "right" : new Subject<McFile[]>(),
  }

  onDirectoryChanged(name: string) : Observable<McFile>   {
    return this.isLeft(name) ? this.directoryChanged.left.asObservable() : this.directoryChanged.right.asObservable();
  }

  OnContentDirectoryChanged(name: string) : Observable<McFile[]>   {
    return this.isLeft(name) ? this.directoryContentChanged.left.asObservable() : this.directoryContentChanged.right.asObservable();
  }

  constructor( private directoryService : DirectoryService, private preferencesService: PreferencesService ) {
  }

  prepare()  : AppStatus | Observable<AppStatus>  {
    if(this.appStatus !== undefined)  return this.appStatus;

    return this.preferencesService.getPreferences().pipe(
        map(  p => this.prepareAppStatus(p) )
    );
  }

  private prepareAppStatus(conf: Configuration) :AppStatus {
    this.appStatus = {
      currentLeftFolder: { name: conf.leftFolder as string, dir: true, ext: '', size: 0},
      currentRightFolder: { name: conf.rightFolder as string, dir: true, ext: '', size: 0},
    };

    console.log('status ready')

    if (this.appStatus.currentLeftFolder) {
      this.directoryChanged.left.next(this.appStatus.currentLeftFolder);
    }
    if (this.appStatus.currentRightFolder) {
      this.directoryChanged.right.next(this.appStatus.currentRightFolder);
    }



    return this.appStatus;
  }

  refreshDirectoryList(name: string) {

    const path = this.isLeft(name) ? this.appStatus?.currentLeftFolder?.name : this.appStatus?.currentRightFolder?.name;
    this.directoryService.listDir({path}).subscribe(
      content => {
        console.log("read", path, content)
        if (this.isLeft(name))
          this.directoryContentChanged.left.next(content);
        else
          this.directoryContentChanged.right.next(content);
      }
    );
  }

  private isLeft(name: string):boolean {
    return name == "left";
  }
}