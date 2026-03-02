import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import Chart from 'chart.js/auto';
import { SidebarAdmin } from './sidebar-admin/sidebar-admin';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/* ====================================================
    🔹 INTERFACES
==================================================== */
interface Reporte {
  ref: string;
  tipo: string;
  estado: 'Pendiente' | 'Validado';
}

interface ItemFiltrado {
  ref: string;
  descripcion: string;
  estado: string;
  claseEstado: string;
}

interface Infraccion {
  ref: string;
  tipo: string;
  agente: string;
  fecha: string;
  estado: 'Pendiente' | 'Validado';
}

/* ====================================================
    🔹 COMPONENTE ÚNICO
==================================================== */
@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  imports: [SidebarAdmin, RouterModule, CommonModule]
})
export class Admin implements OnInit, AfterViewInit, OnDestroy {

  /* --- ESTADO GENERAL --- */
  menuAbierto = false;
  modalAbierto = false;
  tituloModal = '';
  tipoModalActivo: 'reportes' | 'infraccion' = 'reportes';

  itemsFiltrados: ItemFiltrado[] = [];
  infraccionSeleccionada: Infraccion | null = null;

  /* --- DATOS --- */
  infracciones: Infraccion[] = [
    { ref: 'INF-001', tipo: 'Exceso de velocidad', agente: 'Agente Martínez', fecha: '02/03/2026', estado: 'Pendiente' },
    { ref: 'INF-002', tipo: 'Mal estacionado', agente: 'Agente López', fecha: '01/03/2026', estado: 'Validado' },
    { ref: 'INF-003', tipo: 'Semáforo en rojo', agente: 'Agente Pérez', fecha: '28/02/2026', estado: 'Pendiente' }
  ];

  private todosLosReportes: Reporte[] = [
    { ref: 'REP-001', tipo: 'Accidente vial', estado: 'Pendiente' },
    { ref: 'REP-002', tipo: 'Manejo errático', estado: 'Validado' },
    { ref: 'REP-003', tipo: 'Accidente vial', estado: 'Pendiente' },
    { ref: 'REP-004', tipo: 'Semáforo dañado', estado: 'Validado' },
    { ref: 'REP-005', tipo: 'Vehículo mal estacionado', estado: 'Pendiente' },
    { ref: 'REP-006', tipo: 'Otros', estado: 'Validado' }
  ];

  private chartBarras?: Chart;
  private chartPastel?: Chart;

  /* ====================================================
      🔹 CICLO DE VIDA
  ==================================================== */

  ngOnInit(): void {
    // Al cargar el panel principal, aplicamos las preferencias guardadas
    this.cargarPreferencias();
  }

  ngAfterViewInit(): void {
    this.crearGraficoBarras();
    this.crearGraficoPastel();
  }

  ngOnDestroy(): void {
    this.chartBarras?.destroy();
    this.chartPastel?.destroy();
  }

  /* ====================================================
      ⚙️ LÓGICA DE ACCESIBILIDAD (Persistencia)
  ==================================================== */

  private cargarPreferencias(): void {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) document.body.classList.add('dark-mode');

    const isColorBlind = localStorage.getItem('colorBlind') === 'true';
    if (isColorBlind) document.body.classList.add('color-blind');

    const savedSize = localStorage.getItem('fontSize') || 'normal';
    // Limpiamos por si acaso y aplicamos
    document.body.classList.remove('font-small', 'font-normal', 'font-large');
    document.body.classList.add(`font-${savedSize}`);
  }

  /* ====================================================
      📊 GRÁFICOS (Chart.js)
  ==================================================== */

  private crearGraficoBarras(): void {
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
    if (!canvas) return;

    const categorias = ['Accidente vial', 'Manejo errático', 'Semáforo dañado', 'Vehículo mal estacionado', 'Otros'];
    const cantidades = categorias.map(cat => this.todosLosReportes.filter(r => r.tipo === cat).length);

    this.chartBarras = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: categorias,
        datasets: [{
          label: 'Reportes',
          data: cantidades,
          backgroundColor: '#2563eb',
          borderRadius: 8,
          barThickness: 22
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: { 
          x: { beginAtZero: true, ticks: { precision: 0 } }, 
          y: { grid: { display: false } } 
        },
        onClick: (event) => {
          const points = this.chartBarras?.getElementsAtEventForMode(event as any, 'index', { intersect: false }, true);
          if (points && points.length > 0) {
            const label = this.chartBarras?.data.labels?.[points[0].index] as string;
            this.mostrarReportesPorCategoria(label);
          }
        }
      }
    });
  }

  private crearGraficoPastel(): void {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas) return;
    const estados: ('Pendiente' | 'Validado')[] = ['Pendiente', 'Validado'];
    const cantidades = estados.map(e => this.todosLosReportes.filter(r => r.estado === e).length);
    
    this.chartPastel = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: estados,
        datasets: [{ data: cantidades, backgroundColor: ['#ef4444', '#10b981'], borderWidth: 0 }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false, 
        cutout: '70%', 
        plugins: { legend: { position: 'bottom' } } 
      }
    });
  }

  /* ====================================================
      🔥 CONTROL DE MODALES
  ==================================================== */

  private mostrarReportesPorCategoria(categoria: string): void {
    this.tipoModalActivo = 'reportes';
    this.tituloModal = `Reportes de: ${categoria}`;
    this.itemsFiltrados = this.todosLosReportes
      .filter(r => r.tipo === categoria)
      .map(r => ({
        ref: r.ref,
        descripcion: `Incidente de tipo ${r.tipo}`,
        estado: r.estado,
        claseEstado: r.estado === 'Pendiente' ? 'pending' : 'validated'
      }));
    this.abrirModal();
  }

  abrirDetalleInfraccion(infraccion: Infraccion): void {
    this.tipoModalActivo = 'infraccion';
    this.tituloModal = `Detalle de Infracción: ${infraccion.ref}`;
    this.infraccionSeleccionada = infraccion;
    this.abrirModal();
  }

  abrirModalDetalle(seccion: string): void {
    if (seccion === 'reportes') {
      this.mostrarReportesPorCategoria('Accidente vial');
    }
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
}