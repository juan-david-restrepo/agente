import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
 selector: 'app-dashboard',
 standalone: true,
 imports: [FormsModule, CommonModule],
 templateUrl: './dashboard.html',
 styleUrl: './dashboard.css',
})
export class Dashboard {

 @Input() estadoAgente!:string;

 modoGrafica:'SEMANA'|'ANIO'|'DIA'='SEMANA';

 fechaSeleccionada='';

 get maxValor() {
  return Math.max(...this.statsActual.map(s => s.valor));
}

get statsNormalizados() {
  const max = this.maxValor;
  return this.statsActual.map(s => ({
    ...s,
    porcentaje: (s.valor / max) * 100
  }));
}


fechaInicio = '';
fechaFin = '';

filtrarPorRango(){
  console.log('Filtrar desde', this.fechaInicio, 'hasta', this.fechaFin);
  // aquí luego puedes conectar con backend
}

statsSemana=[
 {label:'Lun',valor:40},
 {label:'Mar',valor:70},
 {label:'Mie',valor:30},
 {label:'Jue',valor:90},
 {label:'Vie',valor:60},
 {label:'Sab',valor:20},
 {label:'Dom',valor:50}
];

statsAnio=[
 {label:'Ene',valor:120},
 {label:'Feb',valor:90},
 {label:'Mar',valor:150},
 {label:'Abr',valor:70},
 {label:'May',valor:180},
 {label:'Jun',valor:140},
 {label:'Jul',valor:200},
 {label:'Ago',valor:160},
 {label:'Sep',valor:130},
 {label:'Oct',valor:170},
 {label:'Nov',valor:110},
 {label:'Dic',valor:190}
];

statsDia=[
 {label:'00',valor:5},
 {label:'06',valor:15},
 {label:'12',valor:25},
 {label:'18',valor:10}
];
 get statsActual(){
  if(this.modoGrafica==='SEMANA') return this.statsSemana;
  if(this.modoGrafica==='ANIO') return this.statsAnio;
  return this.statsDia;
 }

 cambiarModoGrafica(modo:'SEMANA'|'ANIO'|'DIA'){
  this.modoGrafica = modo;
 }

}