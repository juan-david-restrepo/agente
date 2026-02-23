import { Component } from '@angular/core'; // CORREGIDO: Importación desde @angular/core
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Servicios
import { AgentesService } from '../../../service/agentes.service';
import { ReportesService } from '../../../service/reportes.service';
import { TareasService } from '../../../service/tareas.service';

// Modelos y Componentes
import { Agente } from '../../../models/agente.model';
import { Reporte } from '../../../models/reporte.model';
import { Tarea } from '../../../models/tarea.model';
import { SidebarAdmin } from '../sidebar-admin/sidebar-admin';

@Component({
  selector: 'app-gestion-agentes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarAdmin],
  templateUrl: './gestion-agentes.html',
  styleUrl: './gestion-agentes.css',
})
export class GestionAgentes {

  // =========================
  // PROPIEDADES DE ESTADO
  // =========================
  placaBuscada: string = '';
  agente: Agente | null = null;
  
  reportes: Reporte[] = [];
  tareas: Tarea[] = [];
  
  cargando = false;
  cargandoReportes = false;
  cargandoTareas = false;
  error = '';

  // PROPIEDADES DEL FORMULARIO
  descripcionTarea = '';
  fechaTarea = '';
  horaTarea = '';
  prioridadTarea: 'BAJA' | 'MEDIA' | 'ALTA' = 'MEDIA';
  mensajeTarea = '';

  constructor(
    private agentesService: AgentesService,
    private reportesService: ReportesService,
    private tareasService: TareasService
  ) {}

  // =========================
  // MÉTODOS DE BÚSQUEDA
  // =========================
  buscarAgente(): void {
    if (!this.placaBuscada.trim()) {
      this.error = 'Ingrese un número de placa';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.agente = null;
    this.reportes = [];
    this.tareas = [];

    this.agentesService.obtenerAgentePorPlaca(this.placaBuscada).subscribe({
      next: (data) => {
        this.agente = data;
        this.cargando = false;
        this.cargarReportes();
        this.cargarTareas();
      },
      error: () => {
        this.error = 'No se encontró ningún agente con esa placa';
        this.cargando = false;
      }
    });
  }

  // =========================
  // GESTIÓN DE REPORTES
  // =========================
  cargarReportes(): void {
    if (!this.agente) return;
    this.cargandoReportes = true;

    this.reportesService.obtenerReportesPorAgente(this.agente.placa).subscribe({
      next: (data) => {
        this.reportes = data;
        this.cargandoReportes = false;
      },
      error: () => {
        this.reportes = [];
        this.cargandoReportes = false;
      }
    });
  }

  // =========================
  // GESTIÓN DE TAREAS
  // =========================
  cargarTareas(): void {
    if (!this.agente) return;
    this.cargandoTareas = true;

    this.tareasService.obtenerTareasPorAgente(this.agente.placa).subscribe({
      next: (data) => {
        // Mapeamos la listaTareas que viene del objeto Agente en el Backend
        if (data && data.listaTareas) {
          this.tareas = data.listaTareas.map((t: any) => ({
            id: t.id,
            descripcion: t.descripcion,
            fecha: t.fecha,
            hora: t.hora,
            prioridad: t.prioridad,
            placaAgente: data.placa
          }));
        } else {
          this.tareas = [];
        }
        this.cargandoTareas = false;
      },
      error: () => {
        this.tareas = [];
        this.cargandoTareas = false;
      }
    });
  }

  asignarTarea(): void {
    if (!this.agente) return;

    if (!this.descripcionTarea || !this.fechaTarea || !this.horaTarea) {
      this.mensajeTarea = 'Complete todos los campos';
      return;
    }

    const nuevaTarea = {
      descripcion: this.descripcionTarea,
      fecha: this.fechaTarea,
      hora: this.horaTarea,
      prioridad: this.prioridadTarea
    };

    this.tareasService.asignarTarea(this.agente.placa, nuevaTarea).subscribe({
      next: (agenteActualizado) => {
        // Actualizamos la tabla con la lista completa del backend para que aparezcan todas
        this.tareas = agenteActualizado.listaTareas.map((t: any) => ({
          id: t.id,
          descripcion: t.descripcion,
          fecha: t.fecha,
          hora: t.hora,
          prioridad: t.prioridad,
          placaAgente: agenteActualizado.placa
        }));

        this.mensajeTarea = '¡Tarea añadida con éxito!';
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('Error al asignar tarea:', err);
        this.mensajeTarea = 'Error al asignar la tarea';
      }
    });
  }

  eliminarTarea(tarea: any): void {
    if (!this.agente || !confirm('¿Desea eliminar esta tarea?')) return;

    // Se envía el ID único de la tarea para borrar la fila exacta en MySQL
    this.tareasService.eliminarTarea(tarea.id).subscribe({
      next: () => {
        // Filtramos localmente para respuesta inmediata
        this.tareas = this.tareas.filter(t => t.id !== tarea.id);
        
        // Si ya no quedan tareas, el agente puede volver a estar disponible
        if (this.tareas.length === 0 && this.agente) {
          this.agente.estado = 'DISPONIBLE';
        }
        this.mensajeTarea = 'Tarea eliminada correctamente';
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.mensajeTarea = 'No se pudo eliminar la tarea';
      }
    });
  }

  // =========================
  // UTILIDADES
  // =========================
  limpiarFormulario(): void {
    this.descripcionTarea = '';
    this.fechaTarea = '';
    this.horaTarea = '';
    this.prioridadTarea = 'MEDIA';
  }
}