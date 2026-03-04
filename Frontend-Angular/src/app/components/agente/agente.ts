import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SidebarAgente } from './sidebar-agente/sidebar-agente';
import { Configuracion } from './configuracion/configuracion';
import { PerfilAgente } from './perfil-agente/perfil-agente';
import { Historial } from './historial/historial';
import { Reportes } from './reportes/reportes';
import { Dashboard } from './dashboard/dashboard';
import { Tareas } from './tareas/tareas';

import { AgenteServiceTs } from '../../service/agente.service';
import { WebsocketService } from '../../service/websocket.service';

// ===================== ENUMS =====================

export enum EstadoReporte {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  RECHAZADO = 'rechazado',
  FINALIZADO = 'finalizado',
}

// ===================== INTERFACES =====================

export interface Reporte {
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  placa :string;
  id: number;
  tipo: string;
  direccion: string;
  hora: string;
  fechaIncidente?: Date;
  horaIncidente?: Date;
  descripcion: string;
  foto?: string;
  coordenadas: string;
  etiqueta: string;
evidencias?: string[];
  latitud?: number;
  longitud?: number;
  tipoInfraccion: string;

  estado?: EstadoReporte;

  fechaAceptado?: Date;
  fechaFinalizado?: Date;
  fechaRechazado?: Date;

  resumenOperativo?: string;

  acompanado?: boolean;
  placaCompanero?: string;
}

export interface Tarea {
  id: number;
  titulo: string;
  admin: string;
  descripcion: string;
  zona: string;

  estado: 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADA';

  hora: string;
  fecha: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';

  fechaInicio?: Date;
  fechaFin?: Date;
  resumen?: string;
}

export interface Notificacion {
  tipo: 'REPORTE' | 'TAREA';
  texto: string;
  hora: string;
  data?: any;
}

type VistaAgente =
  | 'dashboard'
  | 'reportes'
  | 'tareas'
  | 'historial'
  | 'perfil'
  | 'configuracion';

// ===================== COMPONENTE =====================

@Component({
  selector: 'app-agente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarAgente,
    Dashboard,
    Reportes,
    Historial,
    Tareas,
    PerfilAgente,
    Configuracion,
  ],
  templateUrl: 'agente.html',
  styleUrls: ['agente.css'],
})
export class Agente implements OnInit {
  // ===================== VARIABLES BASE =====================

  EstadoReporte = EstadoReporte;

  vistaActual: VistaAgente = 'dashboard';

  estadoAgente: 'LIBRE' | 'OCUPADO' | 'FUERA_SERVICIO' = 'LIBRE';

  origenDetalle: 'historial' | 'reportes' = 'reportes';
  reporteDesdeHistorial: Reporte | null = null;

  mostrarNotificaciones = false;

  reportesEntrantes: Reporte[] = [];
  historialReportes: Reporte[] = [];
  tareasAdmin: Tarea[] = [];
  notificaciones: Notificacion[] = [];
  perfilAgente: any = {};
  

  constructor(
    private agenteService: AgenteServiceTs,
    private websocketService: WebsocketService,
  ) {}

  // ===================== CARGA DESDE BD =====================

  async cargarReportesDesdeBD() {
    try {
      const response = await fetch(
        'http://localhost:8080/api/reportes/agente',
        { credentials: 'include' },
      );

      if (!response.ok) {
        throw new Error('Error HTTP ' + response.status);
      }

      const data = await response.json();

      this.reportesEntrantes = data.map(
        (r: any): Reporte => ({
          prioridad: r.prioridad as 'BAJA' | 'MEDIA' | 'ALTA',
          id: r.id,
          tipo: r.tipoInfraccion,
          direccion: r.direccion,
          hora: r.horaIncidente || '',
          descripcion: r.descripcion,
          tipoInfraccion: r.tipoInfraccion,
          placa: r.placa || '',
          foto: r.urlFoto || '',
          coordenadas: `${r.latitud},${r.longitud}`,
          latitud: r.latitud,
          longitud: r.longitud,
          etiqueta: r.prioridad,
          estado: r.estado?.toLowerCase() as EstadoReporte,
        }),
      );
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
  }

  // ===================== ACCIONES REPORTES =====================

  async aceptarReporte(r: Reporte) {
    const yaHayEnProceso = this.reportesEntrantes.some(
      (rep) => rep.estado === EstadoReporte.EN_PROCESO,
    );

    if (yaHayEnProceso) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/reportes/tomar/${r.id}`,
        { method: 'POST', credentials: 'include' },
      );

      if (!response.ok) throw new Error();

      const actualizado = await response.json();

      r.estado = actualizado.estado;
      r.fechaAceptado = new Date();

      this.estadoAgente = 'OCUPADO';
    } catch (error) {
      console.error('Error al aceptar reporte');
    }
  }

  async rechazarReporte(r: Reporte) {
    try {
      const response = await fetch(
        `http://localhost:8080/api/reportes/rechazar/${r.id}`,
        { method: 'POST', credentials: 'include' },
      );

      if (!response.ok) throw new Error();

      r.estado = EstadoReporte.RECHAZADO;
      r.fechaRechazado = new Date();

      this.historialReportes.unshift({ ...r });

      this.reportesEntrantes = this.reportesEntrantes.filter(
        (x) => x.id !== r.id,
      );
    } catch (error) {
      console.error('Error al rechazar reporte');
    }
  }

  async finalizarReporte(r: Reporte) {
    try {
      const response = await fetch(
        `http://localhost:8080/api/reportes/finalizar/${r.id}`,
        { method: 'POST', credentials: 'include' },
      );

      if (!response.ok) throw new Error();

      r.estado = EstadoReporte.FINALIZADO;
      r.fechaFinalizado = new Date();

      this.historialReportes.unshift({ ...r });

      this.reportesEntrantes = this.reportesEntrantes.filter(
        (x) => x.id !== r.id,
      );

      this.estadoAgente = 'LIBRE';
    } catch (error) {
      console.error('Error al finalizar reporte');
    }
  }

  // ===================== NAVEGACIÓN =====================

  cambiarVista(v: VistaAgente) {
    this.vistaActual = v;
    this.reporteDesdeHistorial = null;
    this.origenDetalle = 'reportes';
  }

  verDetalleHist(r: Reporte) {
    this.origenDetalle = 'historial';
    this.reporteDesdeHistorial = r;
    this.vistaActual = 'reportes';
  }

  volverDesdeDetalle(origen: 'historial' | 'reportes') {
    this.reporteDesdeHistorial = null;
    this.vistaActual = origen;
  }

  // ===================== WEBSOCKET =====================

  ngOnInit() {
    this.cargarReportesDesdeBD();

    this.websocketService.connect();

    this.websocketService.reportes$.subscribe((reporteBackend: any) => {
      const nuevoReporte: Reporte = {
        tipoInfraccion: reporteBackend.tipoInfraccion,
        prioridad: reporteBackend.prioridad as 'BAJA' | 'MEDIA' | 'ALTA',
        id: reporteBackend.id,
        tipo: reporteBackend.tipoInfraccion,
        direccion: reporteBackend.direccion,
        placa: reporteBackend.placa || '',
        hora: '',
        descripcion: reporteBackend.descripcion,
        foto: reporteBackend.urlFoto || '',
        evidencias: reporteBackend.evidencias || [],
        coordenadas: `${reporteBackend.latitud},${reporteBackend.longitud}`,
        latitud: reporteBackend.latitud,
        longitud: reporteBackend.longitud,
        etiqueta: reporteBackend.prioridad,
        estado: reporteBackend.estado?.toLowerCase() as EstadoReporte,
      };

      const existe = this.reportesEntrantes.some(
        (r) => r.id === nuevoReporte.id,
      );

      if (!existe) {
        this.reportesEntrantes.unshift(nuevoReporte);

        this.notificaciones.unshift({
          tipo: 'REPORTE',
          texto: `Nuevo reporte en ${nuevoReporte.direccion}`,
          hora: new Date().toLocaleTimeString(),
          data: nuevoReporte,
        });
      }
    });

    this.cargarPerfil();
  }

  // ===================== PERFIL =====================

  cargarPerfil() {
    this.agenteService.getPerfil().subscribe({
      next: (data) => {
        this.perfilAgente = data; // 🔥 FALTABA ESTO
      },
      error: (err) => {
        console.error('Error cargando perfil', err);
      },
    });
  }
  // ================== CONFIG ==================
  config = {
    modoNoche: false,
    daltonismo: false,
    fontSize: 14,
  };


 

  // ================== NOTIFICACIONES ==================

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  abrirNotif(n: any) {
    console.log('Notificación abierta', n);
  }

  // ================== TAREAS ==================

  comenzarTarea(tarea: any) {
    console.log('Comenzar tarea', tarea);
  }

  finalizarTarea(tarea: any) {
    console.log('Finalizar tarea', tarea);
  }

  // ================== ESTADO SERVICIO ==================
  toggleServicio(nuevoEstado: any) {
    this.estadoAgente = nuevoEstado;
  }

  // ================== CONFIG UPDATE ==================
  updateConfig(nuevaConfig: any) {
    this.config = nuevaConfig;
  }
}
