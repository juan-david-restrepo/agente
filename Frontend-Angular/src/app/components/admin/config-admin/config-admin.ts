import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarAdmin } from '../sidebar-admin/sidebar-admin';


@Component({
  selector: 'app-config-admin',
  templateUrl: './config-admin.html',
  imports:[RouterModule,SidebarAdmin],
  styleUrls: ['./config-admin.css']
})
export class ConfigAdminComponent {

  toggleDarkMode(event: any) {
    if (event.target.checked) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggleColorBlindMode(event: any) {
    if (event.target.checked) {
      document.body.classList.add('color-blind');
    } else {
      document.body.classList.remove('color-blind');
    }
  }

  changeFontSize(event: any) {
    const size = event.target.value;

    document.body.classList.remove('font-small', 'font-normal', 'font-large');

    document.body.classList.add(`font-${size}`);
  }
}
