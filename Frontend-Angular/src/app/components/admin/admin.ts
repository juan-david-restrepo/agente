import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';
import { SidebarAdmin } from './sidebar-admin/sidebar-admin';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type EstadoInfraccion = 'PENDIENTE' | 'RECHAZADO' | 'EN PROCESO' | 'FINALIZADO';

interface Infraccion {
  id: number;
  fecha: string;
  tipo: string;
  agente: string;
  estado: EstadoInfraccion;
  ref: string;
}

interface ItemFiltrado {
  ref: string;
  descripcion: string;
  estado: EstadoInfraccion;
}

interface DetalleDona {
  categoria: string;
  prioridad: 'Alta' | 'Mediana' | 'Baja';
  cantidad: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [SidebarAdmin, RouterModule, CommonModule, FormsModule]
})
export class Admin implements OnInit, AfterViewInit, OnDestroy {
  menuAbierto = false;
  modalAbierto = false;
  tituloModal = '';
  tipoModalActivo: 'reportes' | 'infraccion' | 'dona' = 'reportes';

  itemsFiltrados: ItemFiltrado[] = [];
  infraccionSeleccionada: Infraccion | null = null;

  infracciones: Infraccion[] = [
    { id: 1, ref: 'INF-001', fecha: '2026-03-03', tipo: 'Exceso de velocidad', agente: 'Agente Martínez', estado: 'PENDIENTE' },
    { id: 2, ref: 'INF-002', fecha: '2026-03-02', tipo: 'Vehículo mal estacionado', agente: 'Agente López', estado: 'FINALIZADO' },
    { id: 3, ref: 'INF-003', fecha: '2026-03-01', tipo: 'Semáforo dañado', agente: 'Agente Pérez', estado: 'RECHAZADO' },
    { id: 4, ref: 'INF-004', fecha: '2026-02-28', tipo: 'Manejo errático', agente: 'Agente García', estado: 'EN PROCESO' }
  ];

  infraccionesAMostrar: Infraccion[] = [];

  datosDonaDetalle: DetalleDona[] = [
    { categoria: 'Accidente vial', prioridad: 'Alta', cantidad: 15 },
    { categoria: 'Mal estacionado', prioridad: 'Baja', cantidad: 10 },
    { categoria: 'Semáforo dañado', prioridad: 'Alta', cantidad: 5 },
    { categoria: 'Manejo errático', prioridad: 'Alta', cantidad: 20 },
    { categoria: 'Otros', prioridad: 'Mediana', cantidad: 10 }
  ];

  private chartBarras?: Chart;
  private chartPastel?: Chart;

  ngOnInit(): void {
    this.infraccionesAMostrar = [...this.infracciones];
  }

  ngAfterViewInit(): void {
    this.crearGraficoBarras();
    this.crearGraficoPastel();
  }

  ngOnDestroy(): void {
    this.chartBarras?.destroy();
    this.chartPastel?.destroy();
  }

  aplicarFiltro(event: Event): void {
    const estado = (event.target as HTMLSelectElement).value;
    if (!estado) {
      this.infraccionesAMostrar = [...this.infracciones];
    } else {
      this.infraccionesAMostrar = this.infracciones.filter(inf => inf.estado === estado);
    }
  }

  // MAPEADO DE CLASES SEGÚN TU CSS (pending, validated, etc)
getClaseEstado(estado: EstadoInfraccion): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'estado-pendiente';
    case 'FINALIZADO':
      return 'estado-finalizado';
    case 'RECHAZADO':
      return 'estado-rechazado';
    case 'EN PROCESO':
      return 'estado-proceso';
    default:
      return '';
  }
}

  abrirModalDetalle(seccion: 'reportes' | 'tipos'): void {
    if (seccion === 'reportes') {
      this.tipoModalActivo = 'reportes';
      this.tituloModal = 'Análisis de Reportes';
      this.itemsFiltrados = [
        { ref: 'REP-001', descripcion: 'Accidente en Av. Principal', estado: 'PENDIENTE' },
        { ref: 'REP-002', descripcion: 'Semáforo sin luz', estado: 'FINALIZADO' }
      ];
    }
    this.abrirModal();
  }

  abrirModalDona(): void {
    this.tipoModalActivo = 'dona';
    this.tituloModal = 'Tipos de Infracción por Prioridad';
    this.abrirModal();
  }

  abrirDetalleInfraccion(infraccion: Infraccion): void {
    this.tipoModalActivo = 'infraccion';
    this.tituloModal = `Detalle: ${infraccion.ref}`;
    this.infraccionSeleccionada = infraccion;
    this.abrirModal();
  }

  abrirModal(): void {
    this.modalAbierto = true;
    document.body.classList.add('modal-open');
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.infraccionSeleccionada = null;
    document.body.classList.remove('modal-open');
  }

  private crearGraficoBarras(): void {
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chartBarras = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['PENDIENTE', 'RECHAZADO', 'EN PROCESO', 'FINALIZADO'],
        datasets: [{
          label: 'Cantidad',
          data: [5, 2, 8, 4],
          backgroundColor: ['#FFCC00', '#FF4D4D', '#33B5E5', '#4CAF50']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  private crearGraficoPastel(): void {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas) return;
    this.chartPastel = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Accidente vial', 'Mal estacionado', 'Semáforo dañado', 'Manejo errático', 'Otros'],
        datasets: [{
          data: [15, 10, 5, 20, 10],
          backgroundColor: ['#0D47A1', '#1976D2', '#2196F3', '#64B5F6', '#BBDEFB']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}