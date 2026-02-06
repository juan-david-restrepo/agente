import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Nav } from '../../shared/nav/nav';

@Component({
  selector: 'app-parking',
  imports: [Nav],
  templateUrl: './parking.html',
  styleUrl: './parking.css',
})
export class Parking implements OnInit {
  map!: L.Map;
  userMarker!: L.Marker;
  realTimeMarker!: L.CircleMarker;
  routeControl: any;
  parkingMarkers: L.Marker[] = [];
  parkingData: any[] = [];
  userCoords: { lat: number; lon: number } | null = null;

  ngOnInit(): void {
    this.initMap();

    // Asignación de eventos de botones (según tu HTML)
    const btnUbicacion = document.getElementById('btnUbicacion');
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnStreetView = document.getElementById('btnStreetView');
    const btnBuscar = document.getElementById('btnBuscar');

    if (btnUbicacion) btnUbicacion.addEventListener('click', () => this.irUbicacion());
    if (btnZoomIn) btnZoomIn.addEventListener('click', () => this.map.zoomIn());
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => this.map.zoomOut());
    if (btnStreetView) btnStreetView.addEventListener('click', () => this.mostrarStreetView());
    if (btnBuscar) btnBuscar.addEventListener('click', () => this.obtenerUbicacion());
  }

  // ----------------- Funciones -----------------

  getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  initMap(): void {
    const armeniaCoords: [number, number] = [4.535, -75.675];
    this.map = L.map('map').setView(armeniaCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.userMarker = L.marker(armeniaCoords, { title: 'Tu ubicación' })
      .addTo(this.map)
      .bindPopup('📍 Tu ubicación');

    this.realTimeMarker = L.circleMarker(armeniaCoords, {
      radius: 8,
      fillColor: '#007bff',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 1
    }).addTo(this.map).bindPopup('👤 Estás aquí (en tiempo real)');

    this.updateInfo(` Listo para buscar parqueaderos cercanos en Armenia, Quindío.`);
  }

  updateInfo(htmlContent: string): void {
    const info = document.getElementById('info');
    if (info) info.innerHTML = htmlContent;
  }

  limpiarMapa(): void {
    if (this.routeControl) {
      this.map.removeControl(this.routeControl);
      this.routeControl = null;
    }
    this.parkingMarkers.forEach(m => this.map.removeLayer(m));
    this.parkingMarkers = [];
  }

  async buscarParqueaderos(lat: number, lng: number): Promise<void> {
    this.updateInfo(`⏳ Buscando parqueaderos reales cerca de (${lat.toFixed(5)}, ${lng.toFixed(5)})...`);
    this.limpiarMapa();
    const listado = document.getElementById('listado');
    if (listado) listado.innerHTML = `<li class="text-gray-500">Aún no hay parqueaderos cargados...</li>`;
    this.parkingData = [];

    const overpassQuery = `[out:json];node(around:40000,${lat},${lng})[amenity=parking];out;`;

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
      const data = await response.json();

      if (!data.elements.length) {
        this.updateInfo(`<p class="text-red-600"> No se encontraron parqueaderos en 40 km.</p>`);
        if (listado) listado.innerHTML = `<li class="text-red-600">Sin resultados.</li>`;
        return;
      }

      this.processParkingData(lat, lng, data.elements);
    } catch (error) {
      this.updateInfo("<p class='text-red-500'> Error al buscar parqueaderos.</p>");
      console.error(error);
    }
  }

  processParkingData(userLat: number, userLng: number, parkingNodes: any[]): void {
    const listadoUl = document.getElementById('listado');
    let closestDistance = Infinity;
    let closestParking: any = null;

    parkingNodes.forEach((node, index) => {
      const dist = this.getDistance(userLat, userLng, node.lat, node.lon);
      const name = node.tags && node.tags.name ? node.tags.name : `Parqueadero ${index + 1}`;
      const parkingInfo = {
        lat: node.lat,
        lon: node.lon,
        name,
        distance: dist
      };
      this.parkingData.push(parkingInfo);

      if (dist < closestDistance) {
        closestDistance = dist;
        closestParking = parkingInfo;
      }

      const marker = L.marker([node.lat, node.lon])
        .addTo(this.map)
        .bindPopup(`<strong>🅿️ ${name}</strong><br>📏 ${(dist / 1000).toFixed(2)} km`);
      this.parkingMarkers.push(marker);

      if (listadoUl) {
        listadoUl.innerHTML += `
          <li class="border-b pb-2">
            <strong>🅿️ ${name}</strong><br>
            Coordenadas: (${node.lat.toFixed(5)}, ${node.lon.toFixed(5)})<br>
            Distancia: ${(dist / 1000).toFixed(2)} km
          </li>
        `;
      }
    });

    if (closestParking) {
      this.updateInfo(`<p class="text-green-600 font-bold mt-3">🚗 Más cercano: ${closestParking.name} (${(closestDistance / 1000).toFixed(2)} km)</p>`);

      if (this.routeControl) {
        this.map.removeControl(this.routeControl);
      }

      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(closestParking.lat, closestParking.lon)
        ],
        router: L.Routing.osrmv1({ language: 'es', profile: 'car' }),
        show: false,
        addWaypoints: false,
        routeWhileDragging: false
      }).addTo(this.map);

      this.routeControl.on('routesfound', (e: any) => {
        const route = e.routes[0];
        const durationSec = route.summary.totalTime;
        const distanceKm = route.summary.totalDistance / 1000;
        const minutes = Math.round(durationSec / 60);
        this.updateInfo(`
          <p class="text-blue-800 font-medium">Tiempo estimado: ${minutes} minutos</p>
          <p class="text-blue-800 font-medium">Distancia de ruta: ${distanceKm.toFixed(2)} km</p>
        `);
      });
    }
  }

  irUbicacion(): void {
    if (this.userMarker) {
      this.map.setView(this.userMarker.getLatLng(), 16);
    }
  }

  mostrarStreetView(): void {
    alert('Modo calle no implementado en Leaflet. Usa Google Maps directamente.');
  }

  obtenerUbicacion(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          this.map.setView([this.userCoords.lat, this.userCoords.lon], 13);
          this.userMarker.setLatLng([this.userCoords.lat, this.userCoords.lon]);
          this.realTimeMarker.setLatLng([this.userCoords.lat, this.userCoords.lon]);
          this.buscarParqueaderos(this.userCoords.lat, this.userCoords.lon);
        },
        (err) => {
          this.updateInfo("<p class='text-red-500'> No se pudo obtener tu ubicación. Usa el botón para buscar.</p>");
          console.error(err);
        }
      );
    } else {
      this.updateInfo("<p class='text-red-500'> La geolocalización no está soportada en tu navegador.</p>");
    }
  }
}
