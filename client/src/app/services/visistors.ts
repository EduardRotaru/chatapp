import { Injectable } from '@angular/core';
import * as data from '../shared/plants.json';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  plants: any;

  constructor() { }

  public getPlantNames() {
    return (data as any).default;
  }
}
