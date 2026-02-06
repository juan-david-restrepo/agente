import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarea } from '../agente';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tareas',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './tareas.html',
  styleUrl: './tareas.css',
})
export class Tareas {
  @Input() tareas!: Tarea[];

  @Output() marcar = new EventEmitter<Tarea>();

  tareaSeleccionada: Tarea | null = null;

  abrir(t: Tarea){
    this.tareaSeleccionada = t;
  }

  cerrar(){
    this.tareaSeleccionada = null;
  }

  marcarTarea(t: Tarea){
    this.marcar.emit(t);
  }
}
