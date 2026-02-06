import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
import Tesseract from 'tesseract.js';
import { Nav } from '../../shared/nav/nav';

@Component({
  selector: 'app-subir-reporte',
  standalone: true,
  imports: [FormsModule, Nav],
  templateUrl: './subir-reporte.html',
  styleUrls: ['./subir-reporte.css'],
  encapsulation: ViewEncapsulation.None
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
            attribution: 'Map data © OpenStreetMap contributors'
          }).addTo(this.map);
        } else {
          this.map.setView([lat, lng], 16);
        }

        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        } else {
          this.marker = L.marker([lat, lng]).addTo(this.map);
        }

        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
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
          this.descripcion += event.results[event.resultIndex][0].transcript + ' ';
        };

        this.recognition.onerror = (event: any) => {
          alert('Error en el reconocimiento de voz: ' + event.error);
        };

        this.recognition.onend = () => this.recognitionRunning = false;
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

  // 📤 Enviar reporte con SweetAlert2
  enviarReporte() {
    Swal.fire({
      icon: 'success',
      title: '¡Reporte enviado!',
      text: 'Tu reporte ha sido registrado exitosamente.',
      confirmButtonText: 'OK',
      customClass: { popup: 'small-popup' },
      allowOutsideClick: false,
      allowEscapeKey: false,
      showClass: { popup: 'swal2-show animate__animated animate__fadeInDown' },
      hideClass: { popup: 'swal2-hide animate__animated animate__fadeOutUp' }
    }).then(() => {
      this.resetFormulario();
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
