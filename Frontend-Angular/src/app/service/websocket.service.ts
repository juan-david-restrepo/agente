import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Subject } from 'rxjs/internal/Subject';
import SockJS from 'sockjs-client/dist/sockjs';


@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private stompClient!: Client;

  // 👇 ESTE ES EL QUE TE FALTA
  private reportesSubject = new Subject<any>();
  public reportes$ = this.reportesSubject.asObservable();

     connect() {

    const socket = new SockJS('http://localhost:8080/ws');
   this.stompClient = new Client({
     webSocketFactory: () => socket,
     reconnectDelay: 5000,
     
   });


    this.stompClient.onConnect = () => {
      console.log('Conectado al WebSocket');
    };

    this.stompClient.activate();
  }

  subscribe(topic: string, callback: (message: any) => void) {
    this.stompClient.subscribe(topic, (msg) => {
      callback(JSON.parse(msg.body));
    });
  }
}
