import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

    // make me a method to remove key from object or array of objects if it is null or undefined or empty string
    removeNullUndefinedEmptyStringKeys(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map((item) => this.removeNullUndefinedEmptyStringKeys(item));
      }
      return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined && v !== ''));
    }

    // make me a method to remove key from object or array of objects if it is null or undefined or empty string or _id
    removeNullUndefinedEmptyStringKeysAndId(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map((item) => this.removeNullUndefinedEmptyStringKeysAndId(item));
      }
      return Object.fromEntries(Object.entries(obj).filter(([key, v]) => 
        v !== null && v !== undefined && v !== '' && key !== '_id'
      ));
    }
}
