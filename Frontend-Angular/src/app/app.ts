import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollTopComponent } from './scroll-top/scroll-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('y');
}
