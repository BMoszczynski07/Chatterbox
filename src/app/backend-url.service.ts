import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BackendUrlService {
  constructor() {}

  backendURL: string = 'http://192.168.1.42:8080/api/v1.0.0';
}
