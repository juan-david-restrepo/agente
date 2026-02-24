import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import Tesseract from 'tesseract.js';
import { Nav } from '../../shared/nav/nav';
import { SubirReporteService } from '../../service/subir-reporte.service';

export interface ReporteRequest {
  descripcion: string;
  placa: string;
  direccion: string;
  latitud: number;
  longitud: number;
  fechaIncidente: string | null;
  horaIncidente: string | null;
  tipoInfraccion: string;
  estado: string;
}


@Component({
  selector: 'app-subir-reporte',
  standalone: true,
  imports: [FormsModule, Nav],
  templateUrl: './subir-reporte.html',
  styleUrls: ['./subir-reporte.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SubirReporteComponent implements OnInit {
  fileList: File[] = [];
  placa: string = '';
  descripcion: string = '';
  fecha: string = '';
  hora: string = '';
  direccion: string = '';
  coordenadas: string = '';

  private map: any;
  private marker: any;
  recognition: any;
  recognitionRunning = false;

  constructor(private reporteService: SubirReporteService) {}

  ngOnInit(): void {}

  // 📸 Subir archivos y previsualizar
  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);
    this.fileList = [...this.fileList, ...newFiles].slice(0, 5);
    this.previewFiles();
  }

  removeFile(index: number) {
    this.fileList.splice(index, 1);
    this.previewFiles();
  }

  previewFiles() {
    const preview = document.getElementById('preview');
    if (!preview) return;
    preview.innerHTML = '';

    this.fileList.forEach((file, index) => {
      const div = document.createElement('div');
      div.className = 'preview-item me-2 mb-2';

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.className = 'remove-btn';
      removeBtn.onclick = () => this.removeFile(index);

      if (file.type.startsWith('image')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onclick = () => window.open(img.src, '_blank');
        div.appendChild(img);

        // 🔍 OCR para detectar placa
        Tesseract.recognize(img.src, 'eng').then(({ data }: { data: any }) => {
          const matches = data.text.match(/[A-Z]{3}[- ]?\d{3}/);
          if (matches && matches[0]) {
            this.placa = matches[0].replace(/[- ]/, '');
          }
        });
      } else if (file.type.startsWith('video')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.controls = true;
        div.appendChild(video);
      }

      div.appendChild(removeBtn);
      preview.appendChild(div);
    });
  }

  // 🗺️ Obtener ubicación y mostrar en mapa
  obtenerUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.coordenadas = `${lat}, ${lng}`;

        if (!this.map) {
          this.map = L.map('map').setView([lat, lng], 16);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenStreetMap contributors',
          }).addTo(this.map);
        } else {
          this.map.setView([lat, lng], 16);
        }

        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        } else {
          this.marker = L.marker([lat, lng]).addTo(this.map);
        }

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        );
        const data = await res.json();
        this.direccion = data.display_name || 'Ubicación no encontrada';
      });
    } else {
      alert('Geolocalización no disponible en este navegador.');
    }
  }

  // 🎙️ Reconocimiento de voz
  iniciarVoz() {
    if ('webkitSpeechRecognition' in window) {
      if (!this.recognition) {
        // @ts-ignore
        this.recognition = new webkitSpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event: any) => {
          this.descripcion +=
            event.results[event.resultIndex][0].transcript + ' ';
        };

        this.recognition.onerror = (event: any) => {
          alert('Error en el reconocimiento de voz: ' + event.error);
        };

        this.recognition.onend = () => (this.recognitionRunning = false);
      }

      if (this.recognitionRunning) {
        this.recognition.stop();
        this.recognitionRunning = false;
      } else {
        this.recognition.start();
        this.recognitionRunning = true;
      }
    } else {
      alert('El reconocimiento de voz no está disponible en este navegador.');
    }
  }

  enviarReporte() {
    if (!this.descripcion || !this.coordenadas) {
      Swal.fire('Error', 'Completa los campos obligatorios', 'error');
      return;
    }

    const [lat, lng] = this.coordenadas.split(',').map((c) => Number(c.trim()));
  const reporte: ReporteRequest = {
    descripcion: this.descripcion,
    placa: this.placa,
    direccion: this.direccion,
    latitud: lat,
    longitud: lng,
    fechaIncidente: this.fecha || null,
    horaIncidente: this.hora || null,
    tipoInfraccion: 'GENERAL',
    estado: 'PENDIENTE',
  };


    this.reporteService.crearReporte(reporte, this.fileList).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Reporte enviado!',
          text: 'Tu reporte ha sido registrado exitosamente.',
          confirmButtonText: 'OK',
        }).then(() => {
          this.resetFormulario();
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo enviar el reporte', 'error');
      },
    });
  }

  // 🔄 Reset formulario
  resetFormulario() {
    this.fileList = [];
    this.descripcion = '';
    this.fecha = '';
    this.hora = '';
    this.direccion = '';
    this.coordenadas = '';
    this.placa = '';

    const preview = document.getElementById('preview');
    if (preview) preview.innerHTML = '';

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }
}
