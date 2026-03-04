import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Reporte } from '../agente';
import { EstadoReporte } from '../agente';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes {
  constructor(private sanitizer: DomSanitizer) {}

  /* =========================
     INPUTS / OUTPUTS
  ========================= */

  @Input() reportes: Reporte[] = [];
  @Input() modoLectura: boolean = false;
  @Input() hayEnProceso: boolean = false;
  @Input() reporteInicial: Reporte | null = null;

  @Output() aceptar = new EventEmitter<Reporte>();
  @Output() rechazar = new EventEmitter<Reporte>();
  @Output() finalizar = new EventEmitter<Reporte>();

  /* =========================
     VARIABLES
  ========================= */

  reporteSeleccionado: Reporte | null = null;
  mapaUrl: SafeResourceUrl | null = null;
  cargando = false;
  
  /* =========================
     CICLO VIDA
  ========================= */

  ngOnInit() {
    this.cargando = false;
  }

  ngOnChanges() {
    if (this.reporteInicial) {
      this.seleccionar(this.reporteInicial);
    }
  }

  /* =========================
     SELECCIONAR REPORTE
  ========================= */

  seleccionar(r: Reporte) {
    this.reporteSeleccionado = r;

    if (r.latitud && r.longitud) {
      const url = `https://www.google.com/maps?q=${r.latitud},${r.longitud}&hl=es&z=16&output=embed`;
      this.mapaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.mapaUrl = null;
    }
  }

  /* =========================
     ORDENAMIENTO
  ========================= */

  get reportesOrdenados() {
    if (!this.reportes) return [];

    return [...this.reportes].sort((a, b) => {
      if (a.estado === 'en_proceso') return -1;
      if (b.estado === 'en_proceso') return 1;
      return 0;
    });
  }

  /* =========================
     FILTROS
  ========================= */

  filtroActivo: 'TODOS' | 'BAJA' | 'MEDIA' | 'ALTA' = 'TODOS';

  cambiarFiltro(filtro: 'TODOS' | 'BAJA' | 'MEDIA' | 'ALTA') {
    this.filtroActivo = filtro;
  }

  get reportesFiltrados() {
    if (this.filtroActivo === 'TODOS') {
      return this.reportesOrdenados;
    }

    return this.reportesOrdenados.filter(
      (r) => r.prioridad?.toUpperCase() === this.filtroActivo,
    );
  }

  /* =========================
     ACCIONES
  ========================= */

  aceptarClick(r: Reporte) {
    if (this.hayEnProceso) {
      this.mostrarAlerta('Ya tienes un reporte en proceso');
      return;
    }

    this.aceptar.emit(r);
  }

  rechazarClick(r: Reporte) {
    if (this.hayEnProceso) {
      this.mostrarAlerta('No puedes rechazar mientras tienes uno en proceso');
      return;
    }

    this.rechazar.emit(r);
    this.reporteSeleccionado = null;
  }

  /* =========================
     FINALIZAR
  ========================= */

  mostrarModal = false;
  resumenTexto = '';

  abrirModalFinalizar() {
    this.mostrarModal = true;
  }

  confirmarFinalizar() {
    if (!this.reporteSeleccionado) return;

    if (!this.resumenTexto || this.resumenTexto.trim().length < 10) {
      this.mostrarAlerta('Debes escribir mínimo 10 caracteres');
      return;
    }

    this.reporteSeleccionado.estado = EstadoReporte.PENDIENTE;
    this.reporteSeleccionado.resumenOperativo = this.resumenTexto.trim();

    this.finalizar.emit(this.reporteSeleccionado);

    this.mostrarModal = false;
    this.resumenTexto = '';
    this.reporteSeleccionado = null;
  }

  /* =========================
     ZOOM IMAGEN
  ========================= */

  mostrarImagenZoom = false;
  imagenZoomUrl: string | null = null;
  zoomScale = 1;

  abrirZoom(url: string) {
    this.imagenZoomUrl = url;
    this.mostrarImagenZoom = true;
  }

  cerrarZoom() {
    this.mostrarImagenZoom = false;
    this.imagenZoomUrl = null;
    this.zoomScale = 1;
  }

  zoomConRueda(event: WheelEvent) {
    event.preventDefault();

    if (event.deltaY < 0) {
      this.zoomScale += 0.1;
    } else {
      this.zoomScale -= 0.1;
    }

    if (this.zoomScale < 1) this.zoomScale = 1;
    if (this.zoomScale > 3) this.zoomScale = 3;
  }

  /* =========================
     PRIORIDAD CSS
  ========================= */

  getClasePrioridad(prioridad: string) {
    if (!prioridad) return '';

    switch (prioridad.toLowerCase()) {
      case 'alta':
        return 'prioridad-alta';
      case 'media':
        return 'prioridad-media';
      case 'baja':
        return 'prioridad-baja';
      default:
        return '';
    }
  }

  /* =========================
     ALERTAS
  ========================= */

  mensajeAlerta: string | null = null;

  mostrarAlerta(msg: string) {
    this.mensajeAlerta = msg;

    setTimeout(() => {
      this.mensajeAlerta = null;
    }, 3000);
  }
}
