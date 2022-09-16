import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
  export class HelperService {
    private data = new Subject<any>();
    public data$ = this.data.asObservable();
  
    emitComponentIndex(index: any){
      this.data.next(index);
    }
  }