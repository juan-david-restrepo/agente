import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Admin } from './components/admin/admin';
import { Login } from './components/login/login';
import { Recuperar } from './components/recuperar/recuperar';
import { Registro } from './components/registro/registro';
import { SubirReporteComponent } from './components/subir-reporte/subir-reporte';
import { Parking } from './components/parking/parking';
import { Agente } from './components/agente/agente';
import { Footer } from './shared/footer/footer';
import { Soporte } from './components/soporte/soporte';
import { PicoPlaca } from './components/pico-placa/pico-placa';
import { Normas } from './components/normas/normas';
import { NoticiasComponent } from './components/noticias/noticias';
import { Perfil } from './components/perfil/perfil';
import { GestionAgentes } from './components/admin/gestion-agentes/gestion-agentes';
import { Path } from 'leaflet';
import { SidebarAdmin } from './components/admin/sidebar-admin/sidebar-admin';
import { ConfigAdminComponent } from './components/admin/config-admin/config-admin';
import { MapaReportesComponent } from './components/admin/mapa-reportes/mapa-reportes';






export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'admin', component: Admin, },
  { path: 'login', component: Login },
  { path: 'recuperar', component: Recuperar },
  { path: 'registro', component: Registro },
  { path: 'subir-reporte', component: SubirReporteComponent, canActivate: [authGuard] },
  { path: 'parking', component: Parking, canActivate: [authGuard] },
  { path: 'agente', component: Agente },
  { path: 'footer', component: Footer },
  { path: 'soporte', component: Soporte },
  { path: 'pico-placa', component: PicoPlaca },
  {path: 'noticias', component: NoticiasComponent},
  {path: 'normas', component: Normas },
  {path: 'perfil', component: Perfil, canActivate: [authGuard] },
  {path: 'gestion-agentes', component: GestionAgentes},
  {path: 'sidebar-admin', component: SidebarAdmin},
  {path: 'config-admin', component: ConfigAdminComponent},
  {path: 'mapa-reportes', component: MapaReportesComponent}
];
