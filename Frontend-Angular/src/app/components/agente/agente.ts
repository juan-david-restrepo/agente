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
import { AgenteServiceTs } from '../../service/agente.service.ts';
import { OnInit } from '@angular/core';




    export interface Reporte {
    id:number;
    tipo:string;
    direccion:string;
    hora:string;
    descripcion:string;
    foto:string;
    coordenadas:string;
    etiqueta:string;
    lat?:number;
    lng?:number;
    estado?:'pendiente'|'aceptado'|'rechazado';
    }

    export interface Tarea {
    id:number;
    titulo:string;
    admin:string;
    descripcionTarea:string;
    zona:string;
    finalizada:boolean;
    hora:string;
    fecha: string;
    prioridad: 'BAJA'|'MEDIA'|'ALTA';
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
      Configuracion
    ],
    templateUrl: 'agente.html',
    styleUrls: ['agente.css']
    })


export class Agente implements OnInit {

    reporteDesdeHistorial: Reporte | null = null;

    origenDetalle: 'historial' | 'reportes' = 'reportes';


    constructor(private agenteService: AgenteServiceTs) {}

    vistaActual: VistaAgente = 'dashboard';

    estadoAgente:'LIBRE'|'OCUPADO'|'FUERA_SERVICIO' = 'LIBRE';

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
      modoNoche:false,
      daltonismo:false,
      fontSize:16
    };

    mostrarNotificaciones = false;

    reporteHistDetalle: Reporte | null = null


    historialReportes:Reporte[]=[];

      reportesEntrantes:Reporte[]=[
        {
          id:1,
          tipo:'Mal parqueo',
          direccion:'Carrera 15 #23-40',
          hora:'13:05',
          descripcion:'Vehículo bloqueando entrada',
          foto:'https://images.unsplash.com/photo-1590483734724-38817405119c?w=500',
          coordenadas:'4.653,-74.083',
          etiqueta:'Alta',
          lat:4.653,
          lng:-74.083,
          estado:'pendiente'
        },
        {
          id:2,
          tipo:'Accidente leve',
          direccion:'Calle 80 #45-20',
          hora:'14:20',
          descripcion:'Choque entre dos motos',
          foto:'https://images.unsplash.com/photo-1519583272095-6433daf26b6e?w=500',
          coordenadas:'4.670,-74.080',
          etiqueta:'Alta',
          lat:4.670,
          lng:-74.080,
          estado:'pendiente'
        }
      ];

      tareasAdmin:Tarea[]=[
        {
          id:1,
          titulo:'Operativo alcoholemia',
          admin:'Admin Central',
          descripcionTarea:'Apoyar retén zona norte',
          zona:'Zona Norte',
          finalizada:false,
          hora:'10:00 AM',
          fecha:'2026-06-15',
          prioridad: 'ALTA'
        },
        {
          id:2,
          titulo:'Control vehicular',
          admin:'Supervisor',
          descripcionTarea:'Revisión documentos vehículos pesados',
          zona:'Autopista Sur',
          finalizada:true,
          hora:'02:00 PM',
          fecha:'2026-06-15',
          prioridad: 'MEDIA'
        }
      ];

      notificaciones:Notificacion[]=[
        {
          tipo:'REPORTE',
          texto:'Nuevo reporte recibido',
          hora:'Hace 2 min'
        },
        {
          tipo:'TAREA',
          texto:'Nueva tarea asignada',
          hora:'Hace 10 min'
        }
      ];

      perfilAgente = {
        nombre:'Julian Toro',
        rango:'Brigadista Nivel II',
        placa:'ANT-9021',
        cedula:'1.094.882.112',
        celular:'+57 312 456 7890',
        correo:'j.toro@transito.gov.co',
        numeroDocumento:'1094882112',
        foto:'https://randomuser.me/api/portraits/men/32.jpg',
        ciudad:'Armenia'
      };

    marcarTarea(t:Tarea){
      t.finalizada = !t.finalizada;
    }

    aceptarReporte(r: Reporte){
      //  Evitar duplicados
      if (r.estado === 'aceptado') return;

      r.estado = 'aceptado';

      this.historialReportes.push({ ...r }); // copia segura

      this.reportesEntrantes =
        this.reportesEntrantes.filter(x => x.id !== r.id);

      this.estadoAgente = 'OCUPADO';

      //  salir del detalle automáticamente
      this.reporteDesdeHistorial = null;
    }

    rechazarReporte(r:Reporte){
       if (r.estado === 'rechazado') return;

        r.estado = 'rechazado';

        this.historialReportes.push({ ...r });

        this.reportesEntrantes =
          this.reportesEntrantes.filter(x => x.id !== r.id);

        this.reporteDesdeHistorial = null;
    }

      verDetalleHist(r: Reporte) {
        this.origenDetalle = 'historial';
        this.reporteDesdeHistorial = r;
        this.vistaActual = 'reportes';
      } 

      cambiarVista(v: VistaAgente){
        this.vistaActual = v;
        this.reporteDesdeHistorial = null;
        this.origenDetalle = 'reportes'; // importante si estamos usando el sistema de origen
      }

      volverDesdeDetalle(origen: 'historial' | 'reportes'){
        this.reporteDesdeHistorial = null;
        this.vistaActual = origen;
      }

      toggleNotificaciones(){
        this.mostrarNotificaciones = !this.mostrarNotificaciones;
      }

      abrirNotif(n:any){

        if(n.tipo === 'REPORTE'){
          this.vistaActual = 'reportes';
        }

        if(n.tipo === 'TAREA'){
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
            ciudad: 'N/A'
          };
        },
        error: (err) => {
          console.error('Error cargando perfil', err);
        }
      });
    }


    updateConfig(config: any) {
      document.body.classList.toggle('dark-mode', config.modoNoche);
      document.documentElement.style.setProperty(
        '--font-size-base',
        config.fontSize + 'px'
      );
    }

}