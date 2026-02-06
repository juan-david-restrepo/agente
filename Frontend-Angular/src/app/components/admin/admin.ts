import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarAgente } from '../agente/sidebar-agente/sidebar-agente';

declare const Chart: any;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent implements OnInit, AfterViewInit {

  ngOnInit(): void {
    document.body.setAttribute('data-theme', 'light');
  }

  ngAfterViewInit(): void {
    this.initializeCharts();
  }

  toggleTheme(): void {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);

    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.textContent = isDark ? '🌞' : '🌙';
  }

  initializeCharts(): void {
    // 🟦 Gráfico de barras - Infracciones por agente
    new Chart(document.getElementById('mainBarChart'), {
      type: 'bar',
      data: {
        labels: ['Agente A', 'Agente B', 'Agente C', 'Agente D'],
        datasets: [{
          label: 'Reportes generados',
          data: [45, 60, 32, 48],
          backgroundColor: [
            'rgba(37, 99, 235, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // 📈 Gráfico de líneas - Reportes semanales
    new Chart(document.getElementById('lineChart'), {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Reportes',
          data: [14, 20, 12, 28, 22, 19, 25],
          borderColor: 'rgba(37,99,235,1)',
          backgroundColor: 'rgba(37,99,235,0.15)',
          borderWidth: 3,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } }
      }
    });

    // 🥧 Gráfico de pastel - Tipos de infracción
    new Chart(document.getElementById('pieChart'), {
      type: 'doughnut',
      data: {
        labels: ['Velocidad', 'Parqueo indebido', 'Semáforo', 'Otro'],
        datasets: [{
          data: [35, 40, 15, 10],
          backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}
