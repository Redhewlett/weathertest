import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormControl, ReactiveFormsModule  } from '@angular/forms';
import { LocationService } from './services/location.service';
import { WeatherService } from './services/weather.service';
import { WeatherCardComponent } from './components/weather-card/weather-card.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule, WeatherCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ng-weather';
  public zipCode: FormControl<number> = new FormControl();

  constructor(public locationService: LocationService, public weatherService: WeatherService) {}

  addLocation() {
    this.locationService.addZipCode(this.zipCode.value);
    this.zipCode.reset();
  }
  removeLocation(city: string) {
    this.locationService.removeLocation(city);
    this.weatherService.removeWeather(city);
  }
}
