import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { SidebarAdmin } from './sidebar-admin/sidebar-admin';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // 👈 Importante para el *ngIf

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  // 👈 Añadimos CommonModule aquí
  imports: [SidebarAdmin, RouterModule, CommonModule] 
})
export class Admin implements AfterViewInit {

  // 🔹 1. Propiedades de estado
  menuAbierto: boolean = false; 

  // 🔹 2. Ciclo de vida
  ngAfterViewInit(): void {
    this.createLineChart();
    this.createPieChart();
  }

  // 🔹 3. Métodos de Gráficos
  private createLineChart(): void {
    new Chart('lineChart', {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Reportes',
          data: [5, 9, 7, 12, 8, 4, 6],
          borderColor: '#0a3d62',
          backgroundColor: 'rgba(10,61,98,0.2)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false // Ayuda a que se adapte mejor a los contenedores
      }
    });
  }

  private createPieChart(): void {
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: ['Velocidad', 'Semáforo', 'Parqueo'],
        datasets: [{
          data: [45, 30, 25],
          backgroundColor: ['#1976d2', '#42a5f5', '#90caf9']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}