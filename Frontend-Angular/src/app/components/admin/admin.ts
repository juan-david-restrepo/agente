import { Component, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { SidebarAdmin } from './sidebar-admin/sidebar-admin';
import { RouterModule } from '@angular/router';




@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  imports: [SidebarAdmin, RouterModule],
  styleUrls: ['./admin.css']
})
export class Admin implements AfterViewInit {

  ngAfterViewInit(): void {
    this.createLineChart();
    this.createPieChart();
  }


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
        responsive: true
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
        responsive: true
      }
    });
  }


}
