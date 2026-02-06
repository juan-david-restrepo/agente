import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Reporte } from '../agente';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial {
  @Input() historial!: Reporte[];

  @Output() verDetalle = new EventEmitter<Reporte>();

  abrir(r: Reporte){
    this.verDetalle.emit(r);
  }

}
