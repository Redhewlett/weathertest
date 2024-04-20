import { Injectable, WritableSignal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { WeatherResponse, WeatherUsefullData } from '../interfaces/weather';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  public weather: WritableSignal<WeatherUsefullData[]> = signal([]);

  constructor(private configService: ConfigService, private http: HttpClient) {}

  addWeather(lat: number, lon: number, name: string) {
    this.getWeather(lat, lon).subscribe((weather) => {
      const weatherObj: WeatherUsefullData = {
        id: weather.id,
        city: name,
        main: weather.weather[0].main,
        temp: weather.main.temp,
        minTemp: weather.main.temp_min,
        maxTemp: weather.main.temp_max,
        icon: weather.weather[0].main.toLocaleLowerCase(),
        country: weather.sys.country,
      };
      this.weather.update((weathers) => {
        weathers.push(weatherObj);
        return weathers;
      });
    });
  }

  getWeather(lat: number, lon: number) {
    return this.http.get<WeatherResponse>(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${this.configService.apiKey}`
    );
  }

  removeWeather(city: string) {
    this.weather.update((weathers) => {
      return weathers.filter((weather) => weather.city !== city);
    });
  }
}
