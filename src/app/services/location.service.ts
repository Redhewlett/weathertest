import { Injectable, OnDestroy } from '@angular/core';
import { Location } from '../interfaces/location';
import { signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, catchError, throwError, zip } from 'rxjs';
import { ConfigService } from './config.service';
import { WeatherService } from './weather.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService implements OnDestroy {
  private subs: Subscription[] = [];
  public zipCodes: WritableSignal<number[]> = signal([]);

  public locations: WritableSignal<Location[]> = signal([]);
  public locationError: WritableSignal<string> = signal('');

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private weatherService: WeatherService
  ) {
    this._getFromLocalStorage();
  }

  public addZipCode(zipCode: number) {
    if (this.zipCodes().includes(zipCode)) return;
    this.zipCodes.update((zipCodes) => {
      zipCodes.push(zipCode);
      return zipCodes;
    });
    this.addLocation(zipCode);
  }

  private _saveToLocalStorage() {
    localStorage.setItem('zipCodes', JSON.stringify(this.zipCodes()));
  }

  private _removeFromLocalStorage(zipCode: number) {
    // for some reason zipcode becomes a string????
    const filtered = [...this.zipCodes()].filter(
      (zip) => zip !== Number(zipCode)
    );
    localStorage.setItem('zipCodes', JSON.stringify(filtered));
  }

  private _getFromLocalStorage() {
    const savedLocations = localStorage.getItem('zipCodes');
    if (savedLocations) {
      this.zipCodes.update(() => JSON.parse(savedLocations));
      this.zipCodes().forEach((zipCode) => {
        this.addLocation(zipCode);
      });
    }
  }

  public addLocation(zipCode: number) {
    const sub = this.getLocation(zipCode)
      .pipe(
        catchError((error) => {
          this.locationError.set('Could not find location in US');
          this.removeZipCode(zipCode);
          return throwError(error);
        })
      )
      .subscribe((location) => {
        this.locations.update((locations) => {
          locations.push(location);
          this.weatherService.addWeather(
            location.lat,
            location.lon,
            location.name
          );
          return locations;
        });
        this.locationError.set('');
      });
    this._saveToLocalStorage();
    this.subs.push(sub);
  }

  private getLocation(zipCode: number): Observable<Location> {
    const url = `http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},us&appid=${this.configService.apiKey}`;
    return this.http.get<Location>(url);
  }

  public removeLocation(city: string) {
    const target = this.locations().find((location) => location.name === city);
    if (!target) return;
    this.removeZipCode(target.zip);
    this.locations.update((locations) => {
      return locations.filter((location) => location.name !== city);
    });
  }

  private removeZipCode(zipCode: number) {
    this._removeFromLocalStorage(zipCode);
    this.zipCodes.update((zipCodes) => {
      return zipCodes.filter((zip) => zip !== zipCode);
    });
  }
}
