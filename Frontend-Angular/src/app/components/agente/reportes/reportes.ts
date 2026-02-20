import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reporte } from '../agente';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@Component({
 selector: 'app-reportes',
 standalone: true,
 imports: [CommonModule, FormsModule],
 templateUrl: './reportes.html',
 styleUrl: './reportes.css',
})
export class Reportes {

    mostrarModalResumen = false;

    abrirModalResumen(){
        this.mostrarModalResumen = true;
    }

    fechaRechazado?: Date;

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
    @Output() finalizar = new EventEmitter<Reporte>();

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

    getDuracion(r: Reporte){
        if(!r.fechaAceptado || !r.fechaFinalizado) return '';

        const diff = r.fechaFinalizado.getTime() - r.fechaAceptado.getTime();

        const horas = Math.floor(diff / 3600000);
        const minutos = Math.floor((diff % 3600000) / 60000);

        if(horas > 0){
            return `${horas}h ${minutos}min`;
        }

        return `${minutos} minutos`;
    }

    ngOnChanges() {
        if (this.reporteInicial) {
            this.seleccionar(this.reporteInicial);
        }
    }

    get reportesOrdenados(){
        return [...this.reportes].sort((a,b)=>{
            if(a.estado === 'en_proceso')return -1;
            if(b.estado === 'en_proceso')return 1;
            return 0;
        })
    }

    mostrarModal = false;
    resumenTexto = '';

    abrirModalFinalizar(){
        this.mostrarModal = true;
    }

    confirmarFinalizar(){
        if(!this.reporteSeleccionado) return;

        // 🚨 Validación
        if(!this.resumenTexto || this.resumenTexto.trim().length < 10){
            alert('Debes escribir un resumen del operativo (mínimo 10 caracteres)');
            return;
        }

        this.reporteSeleccionado.estado = 'finalizado';
        this.reporteSeleccionado.fechaFinalizado = new Date();
        this.reporteSeleccionado.resumenOperativo = this.resumenTexto.trim();

        this.finalizar.emit(this.reporteSeleccionado);

        this.mostrarModal = false;
        this.resumenTexto = '';
        this.reporteSeleccionado = null;

    }

}