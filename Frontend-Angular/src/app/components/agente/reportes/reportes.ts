import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte } from '../agente';

@Component({
 selector: 'app-reportes',
 standalone: true,
 imports: [CommonModule],
 templateUrl: './reportes.html',
 styleUrl: './reportes.css',
})
export class Reportes {

 @Input() reportes!: Reporte[];
 @Input() historial!: Reporte[];

 @Output() aceptar = new EventEmitter<Reporte>();
 @Output() rechazar = new EventEmitter<Reporte>();

 reporteSeleccionado: Reporte | null = null;

 seleccionar(r: Reporte){
  this.reporteSeleccionado = r;
 }

 aceptarClick(r: Reporte){
  this.aceptar.emit(r);
  this.reporteSeleccionado = null;
 }

 rechazarClick(r: Reporte){
  this.rechazar.emit(r);
  this.reporteSeleccionado = null;
 }

 getMapaUrl(r: Reporte){
  if(!r.lat || !r.lng) return '';
  return `https://www.google.com/maps?q=${r.lat},${r.lng}&hl=es&z=16&output=embed`;
 }

}