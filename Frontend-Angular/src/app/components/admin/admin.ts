import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';
import { SidebarAdmin } from './sidebar-admin/sidebar-admin';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfraccionService } from '../../service/infraccion.service';

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

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [SidebarAdmin, RouterModule, CommonModule, FormsModule]
})
export class Admin implements OnInit, AfterViewInit, OnDestroy {

  constructor(private infraccionService: InfraccionService) {}

  menuAbierto = false;
  modalAbierto = false;
  tituloModal = '';

  // 🔥 Ahora sí diferenciamos correctamente
  tipoModalActivo: 'barras' | 'dona' | 'infraccion' = 'barras';

  itemsFiltrados: ItemFiltrado[] = [];
  infraccionSeleccionada: Infraccion | null = null;

  infracciones: Infraccion[] = [];
  infraccionesAMostrar: Infraccion[] = [];

  private chartBarras?: Chart;
  private chartDona?: Chart;
  private vistaLista = false;

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.infraccionService.getInfracciones().subscribe(data => {
      this.infracciones = data;
      this.infraccionesAMostrar = data;

      if (this.vistaLista) {
        this.actualizarGraficoBarras();
        this.actualizarGraficoDona();
      }
    });
  }

  ngAfterViewInit(): void {
    this.crearGraficoBarras();
    this.crearGraficoDona();

    this.vistaLista = true;

    if (this.infracciones.length > 0) {
      this.actualizarGraficoBarras();
      this.actualizarGraficoDona();
    }
  }

  ngOnDestroy(): void {
    this.chartBarras?.destroy();
    this.chartDona?.destroy();
  }

  // =========================
  // FILTRO
  // =========================

  aplicarFiltro(event: Event): void {
    const estado = (event.target as HTMLSelectElement).value;

    if (!estado) {
      this.infraccionesAMostrar = [...this.infracciones];
    } else {
      this.infraccionesAMostrar = this.infracciones.filter(
        inf => inf.estado === estado
      );
    }

    this.actualizarGraficoBarras();
    this.actualizarGraficoDona();
  }

  getClaseEstado(estado: EstadoInfraccion): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-pendiente';
      case 'FINALIZADO': return 'estado-finalizado';
      case 'RECHAZADO': return 'estado-rechazado';
      case 'EN PROCESO': return 'estado-proceso';
      default: return '';
    }
  }

  // =========================
  // 🔥 MODAL BARRAS
  // =========================

  abrirModalBarras(): void {
    this.tipoModalActivo = 'barras';
    this.tituloModal = 'Análisis por Estado';

    const conteo = {
      PENDIENTE: 0,
      RECHAZADO: 0,
      'EN PROCESO': 0,
      FINALIZADO: 0
    };

    this.infracciones.forEach(inf => {
      conteo[inf.estado]++;
    });

    this.itemsFiltrados = Object.keys(conteo).map(estado => ({
      ref: estado,
      descripcion: 'Cantidad de infracciones',
      estado: estado as EstadoInfraccion
    }));

    this.modalAbierto = true;
    document.body.classList.add('modal-open');
  }

  // =========================
  // 🔥 MODAL DONA
  // =========================

  abrirModalDona(): void {
    this.tipoModalActivo = 'dona';
    this.tituloModal = 'Análisis por Tipo';

    const conteoPorTipo: Record<string, number> = {};

    this.infracciones.forEach(inf => {
      conteoPorTipo[inf.tipo] = (conteoPorTipo[inf.tipo] || 0) + 1;
    });

    this.itemsFiltrados = Object.keys(conteoPorTipo).map(tipo => ({
      ref: tipo,
      descripcion: `Total de reportes`,
      estado: 'PENDIENTE'
    }));

    this.modalAbierto = true;
    document.body.classList.add('modal-open');
  }

  // =========================
  // MODAL DETALLE INDIVIDUAL
  // =========================

  abrirDetalleInfraccion(infraccion: Infraccion): void {
    this.tipoModalActivo = 'infraccion';
    this.tituloModal = `Detalle: ${infraccion.ref}`;
    this.infraccionSeleccionada = infraccion;

    this.modalAbierto = true;
    document.body.classList.add('modal-open');
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.infraccionSeleccionada = null;
    document.body.classList.remove('modal-open');
  }

  // =========================
  // GRÁFICO BARRAS
  // =========================

  private crearGraficoBarras(): void {
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chartBarras = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['PENDIENTE', 'RECHAZADO', 'EN PROCESO', 'FINALIZADO'],
        datasets: [{
          label: 'Cantidad',
          data: [0, 0, 0, 0],
          backgroundColor: ['#FFCC00', '#FF4D4D', '#33B5E5', '#4CAF50']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private actualizarGraficoBarras(): void {
    if (!this.chartBarras) return;

    const conteo = {
      PENDIENTE: 0,
      RECHAZADO: 0,
      'EN PROCESO': 0,
      FINALIZADO: 0
    };

    this.infracciones.forEach(inf => {
      conteo[inf.estado]++;
    });

    this.chartBarras.data.datasets[0].data = [
      conteo.PENDIENTE,
      conteo.RECHAZADO,
      conteo['EN PROCESO'],
      conteo.FINALIZADO
    ];

    this.chartBarras.update();
  }

  // =========================
  // GRÁFICO DONA
  // =========================

  private crearGraficoDona(): void {
    const canvas = document.getElementById('donaChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chartDona = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  private actualizarGraficoDona(): void {
    if (!this.chartDona) return;

    const conteoPorTipo: Record<string, number> = {};

    this.infracciones.forEach(inf => {
      conteoPorTipo[inf.tipo] = (conteoPorTipo[inf.tipo] || 0) + 1;
    });

    const labels = Object.keys(conteoPorTipo);
    const data = Object.values(conteoPorTipo);

    this.chartDona.data.labels = labels;
    this.chartDona.data.datasets[0].data = data;

    this.chartDona.data.datasets[0].backgroundColor = [
      '#FFCC00',
      '#FF4D4D',
      '#33B5E5',
      '#4CAF50',
      '#9C27B0',
      '#FF9800'
    ].slice(0, labels.length);

    this.chartDona.update();
  }
}