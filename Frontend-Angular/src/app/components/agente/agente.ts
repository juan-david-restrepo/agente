import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agente.html',
  styleUrls: ['./agente.css']
})
export class Agente {

  alertMessage = '⚠️ Hay 3 incidentes sin atender en la última hora';

  stats = [
    { title: 'Incidentes reportados', value: '24 en las últimas 24 horas' },
    { title: 'Infracciones asignadas', value: '12 pendientes' },
    { title: 'Solicitudes ciudadanas', value: '5 nuevas' },
    { title: 'Zona actual', value: 'Centro - Calle 10 con Av. 6' }
  ];

  infracciones = [
    { id: 1, fecha: '03/07/2025', tipo: 'Velocidad', agente: 'Gómez', estado: 'Pendiente' },
    { id: 2, fecha: '03/07/2025', tipo: 'Semáforo', agente: 'López', estado: 'Validado' },
    { id: 3, fecha: '02/07/2025', tipo: 'Parqueo indebido', agente: 'Martínez', estado: 'Pendiente' }
  ];

  isNightMode = false;

  toggleTheme() {
    this.isNightMode = !this.isNightMode;
    document.body.classList.toggle('night-mode', this.isNightMode);
  }
}
