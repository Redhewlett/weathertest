import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WeatherUsefullData } from '../../interfaces/weather';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [],
  templateUrl: './weather-card.component.html',
  styleUrl: './weather-card.component.scss'
})
export class WeatherCardComponent {
  @Input({required:true}) weather: WeatherUsefullData;
  @Output() remove = new EventEmitter<string>();

  public removeLocation(city:string) {
    this.remove.emit(city);
  }
}
