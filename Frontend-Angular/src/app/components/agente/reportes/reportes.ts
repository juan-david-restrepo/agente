import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte } from '../agente';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
 selector: 'app-reportes',
 standalone: true,
 imports: [CommonModule],
 templateUrl: './reportes.html',
 styleUrl: './reportes.css',
})
export class Reportes {

    @Input() origen: 'historial' | 'reportes' = 'reportes';
    @Output() volver = new EventEmitter<'historial' | 'reportes'>();

    @Input() modoLectura: boolean = false;

    @Input() reporteInicial: Reporte | null = null;

    constructor(private sanitizer: DomSanitizer){}
    mapaUrl: SafeResourceUrl | null = null;

    @Input() reportes!: Reporte[];
    @Input() historial!: Reporte[];

    @Output() aceptar = new EventEmitter<Reporte>();
    @Output() rechazar = new EventEmitter<Reporte>();

    volverClick(){
        if(this.origen === 'historial'){
            this.volver.emit('historial');
        } else {
            // Si venimos desde reportes normales
            this.reporteSeleccionado = null;
        }
    }

 reporteSeleccionado: Reporte | null = null;

    seleccionar(r: Reporte){
        this.reporteSeleccionado = r;

        if (r.lat && r.lng) {
            const url = `https://www.google.com/maps?q=${r.lat},${r.lng}&hl=es&z=16&output=embed`;
            this.mapaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        } else {
            this.mapaUrl = null;
        }
    }

 aceptarClick(r: Reporte){
  this.aceptar.emit(r);
  this.reporteSeleccionado = null;
 }

 rechazarClick(r: Reporte){
  this.rechazar.emit(r);
  this.reporteSeleccionado = null;
 }

    getMapaUrl(r: Reporte): SafeResourceUrl {
        if(!r.lat || !r.lng) return '';
        const url = `https://www.google.com/maps?q=${r.lat},${r.lng}&hl=es&z=16&output=embed`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    ngOnChanges() {
        if (this.reporteInicial) {
            this.seleccionar(this.reporteInicial);
        }
    }

}