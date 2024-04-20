import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  apiKey = environment.apiKey;
  constructor() { }
}
