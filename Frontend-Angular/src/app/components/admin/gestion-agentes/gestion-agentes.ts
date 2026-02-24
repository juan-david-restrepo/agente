import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Servicios
import { AdminService } from '../../../service/admin-agente.service';
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

  // =========================
  // MODAL ELIMINAR
  // =========================
  tareaAEliminar: Tarea | null = null;
  mostrarModal = false;

  constructor(
    private AdminService: AdminService,
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

    this.AdminService.obtenerAgentePorPlaca(this.placaBuscada).subscribe({
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

  // =========================
  // ELIMINAR (SOLO EJECUTA)
  // =========================
  eliminarTarea(tarea: Tarea): void {
    if (!this.agente) return;

    this.tareasService.eliminarTarea(tarea.id!).subscribe({
      next: () => {
        this.tareas = this.tareas.filter(t => t.id !== tarea.id);

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
  // CONTROL DEL MODAL
  // =========================
  abrirModalEliminar(tarea: Tarea): void {
    this.tareaAEliminar = tarea;
    this.mostrarModal = true;
  }

  cancelarEliminacion(): void {
    this.tareaAEliminar = null;
    this.mostrarModal = false;
  }

  confirmarEliminacion(): void {
    if (!this.tareaAEliminar) return;
    this.eliminarTarea(this.tareaAEliminar);
    this.mostrarModal = false;
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