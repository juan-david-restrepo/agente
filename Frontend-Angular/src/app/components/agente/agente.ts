import { Component } from '@angular/core';
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
import { OnInit } from '@angular/core';





    export enum EstadoReporte {
      PENDIENTE = 'pendiente',
      EN_PROCESO = 'en_proceso',
      RECHAZADO = 'rechazado',
      FINALIZADO = 'finalizado'
    }


    export interface Reporte {
    id:number;
    tipo:string;
    direccion:string;
    hora:string;
    descripcion:string;
    foto:string ;
    coordenadas:string;
    etiqueta:string;
    lat?:number;
    lng?:number;
    estado?: EstadoReporte;


    fechaAceptado?: Date; 
    fechaFinalizado?: Date;
    resumenOperativo?: string;
    fechaRechazado?: Date;

    acompanado?: boolean;
    placaCompanero?: string;

    }

    export interface Tarea {
      id:number;
      titulo:string;
      admin:string;
      descripcionTarea:string;
      zona:string;

      estado:'PENDIENTE'|'EN_PROCESO'|'FINALIZADA';

      hora:string;
      fecha: string;
      prioridad: 'BAJA'|'MEDIA'|'ALTA';

      fechaInicio?: Date;
      fechaFin?: Date;
      resumen?: string;
    }

    export interface Notificacion {
    tipo:'REPORTE'|'TAREA';
    texto:string;
    hora:string;
    data?:any;
    }

    type VistaAgente =
    | 'dashboard'
    | 'reportes'
    | 'tareas'
    | 'historial'
    | 'perfil'
    | 'configuracion';

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
      EstadoReporte = EstadoReporte;
      reporteDesdeHistorial: Reporte | null = null;

      origenDetalle: 'historial' | 'reportes' = 'reportes';

      constructor(private agenteService: AgenteServiceTs) {}

      vistaActual: VistaAgente = 'dashboard';

      estadoAgente: 'LIBRE' | 'OCUPADO' | 'FUERA_SERVICIO' = 'LIBRE';

      toggleServicio(event: any) {
        const activo = event.target.checked;

        if (activo) {
          // Si está activado → está en servicio
          this.estadoAgente = 'LIBRE';
        } else {
          // Si está desactivado → fuera de servicio
          this.estadoAgente = 'FUERA_SERVICIO';
        }
      }

      config = {
        modoNoche: false,
        daltonismo: false,
        fontSize: 16,
      };

      mostrarNotificaciones = false;

      reporteHistDetalle: Reporte | null = null;

      historialReportes: Reporte[] = [];

      reportesEntrantes: Reporte[] = [];

      tareasAdmin: Tarea[] = [ ];

      notificaciones: Notificacion[] = [ ];

      perfilAgente = {
        nombre: 'Julian Toro',
        rango: 'Brigadista Nivel II',
        placa: 'ANT-9021',
        cedula: '1.094.882.112',
        celular: '+57 312 456 7890',
        correo: 'j.toro@transito.gov.co',
        numeroDocumento: '1094882112',
        foto: 'https://randomuser.me/api/portraits/men/32.jpg',
        ciudad: 'Armenia',
      };

      comenzarTarea(t: Tarea) {
        const yaOcupado = this.tareasAdmin.some(
          (tarea) => tarea.estado === 'EN_PROCESO',
        );

        if (yaOcupado) return;

        t.estado = 'EN_PROCESO';
        t.fechaInicio = new Date();

        this.estadoAgente = 'OCUPADO';
      }

      finalizarTarea(t: Tarea) {
        t.estado = 'FINALIZADA';
        t.fechaFin = new Date();

        this.estadoAgente = 'LIBRE';
      }

      async aceptarReporte(r: Reporte) {
        const yaHayEnProceso = this.reportesEntrantes.some(
          (rep) => rep.estado === EstadoReporte.EN_PROCESO,
        );

        if (yaHayEnProceso) return;

        try {
          const response = await fetch(
            `http://localhost:8080/api/reportes/tomar/${r.id}`,
            {
              method: 'POST',
              credentials: 'include',
            },
          );

          if (!response.ok) throw new Error();

          const actualizado = await response.json();

          // 🔥 Actualizamos localmente con lo que manda el backend
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
            {
              method: 'POST',
              credentials: 'include',
            },
          );

          if (!response.ok) throw new Error();

          const actualizado = await response.json();

          r.estado = actualizado.estado;
          r.fechaRechazado = new Date();

          this.historialReportes.push({ ...r });

          this.reportesEntrantes = this.reportesEntrantes.filter(
            (x) => x.id !== r.id,
          );

          this.reporteDesdeHistorial = null;
        } catch (error) {
          console.error('Error al rechazar reporte');
        }
      }

      async finalizarReporte(r: Reporte) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/reportes/finalizar/${r.id}`,
            {
              method: 'POST',
              credentials: 'include',
            },
          );

          if (!response.ok) throw new Error();

          const actualizado = await response.json();

          this.historialReportes.push({ ...actualizado });

          this.reportesEntrantes = this.reportesEntrantes.filter(
            (x) => x.id !== r.id,
          );

          this.estadoAgente = 'LIBRE';
        } catch (error) {
          console.error('Error al finalizar reporte');
        }
      }

      verDetalleHist(r: Reporte) {
        this.origenDetalle = 'historial';
        this.reporteDesdeHistorial = r;
        this.vistaActual = 'reportes';
      }

      cambiarVista(v: VistaAgente) {
        this.vistaActual = v;
        this.reporteDesdeHistorial = null;
        this.origenDetalle = 'reportes'; // importante si estamos usando el sistema de origen
      }

      volverDesdeDetalle(origen: 'historial' | 'reportes') {
        this.reporteDesdeHistorial = null;
        this.vistaActual = origen;
      }

      toggleNotificaciones() {
        this.mostrarNotificaciones = !this.mostrarNotificaciones;
      }

      abrirNotif(n: any) {
        if (n.tipo === 'REPORTE') {
          this.vistaActual = 'reportes';
        }

        if (n.tipo === 'TAREA') {
          this.vistaActual = 'tareas';
        }

        this.mostrarNotificaciones = false;
      }

      ngOnInit() {
        this.agenteService.getPerfil().subscribe({
          next: (data) => {
            this.perfilAgente = {
              nombre: data.nombreCompleto,
              cedula: data.numeroDocumento,
              correo: data.email,
              placa: data.placa || 'N/A',
              celular: data.celular,
              numeroDocumento: data.numeroDocumento,
              rango: data.role,
              foto: 'https://randomuser.me/api/portraits/men/32.jpg',
              ciudad: 'N/A',
            };
          },
          error: (err) => {
            console.error('Error cargando perfil', err);
          },
        });
      }

      get hayEnProceso(): boolean {
        return this.reportesEntrantes.some(
          (r) => r.estado === EstadoReporte.EN_PROCESO,
        );
      }

      updateConfig(config: any) {
        document.body.classList.toggle('dark-mode', config.modoNoche);
        document.documentElement.style.setProperty(
          '--font-size-base',
          config.fontSize + 'px',
        );
      }

      asignarReporteACompanero(reporte: Reporte) {
        // esto va en el backend solo es prueba
        console.log(
          `Asignando reporte ${reporte.id} al agente ${reporte.placaCompanero}`,
        );

        // Aquí deberías llamar al backend
        // agenteService.asignarACompanero(...)
      }
      async cargarReportesDesdeBD() {
        try {
          const response = await fetch(
            'http://localhost:8080/api/reportes/agente',
            { credentials: 'include' },
          );

          if (!response.ok) throw new Error();

          const data = await response.json();

          // 🔥 Mapear datos del backend a tu modelo frontend
          this.reportesEntrantes = data.map((r: any) => ({
            id: r.id,
            tipo: r.tipoInfraccion,
            direccion: r.direccion,
            hora: r.horaIncidente,
            descripcion: r.descripcion,
            coordenadas: `${r.latitud},${r.longitud}`,
            lat: r.latitud,
            lng: r.longitud,
            etiqueta: r.prioridad,
            estado: r.estado,
          }));
        } catch (error) {
          console.error('Error cargando reportes');
        }
      }
    }