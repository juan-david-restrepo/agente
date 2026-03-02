import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  // 1. Definimos el estado inicial
  private configSource = new BehaviorSubject({
    darkMode: false,
    colorBlindMode: false,
    fontSize: 'normal'
  });

  // 2. Exponemos el estado como un Observable
  currentConfig = this.configSource.asObservable();

  constructor() {
    // Opcional: Cargar desde localStorage al iniciar
    const saved = localStorage.getItem('userConfig');
    if (saved) {
      this.configSource.next(JSON.parse(saved));
    }
  }

  // 3. Método para actualizar los valores
  updateConfig(newConfig: any) {
    this.configSource.next(newConfig);
    localStorage.setItem('userConfig', JSON.stringify(newConfig)); // Guardar preferencia
  }
}