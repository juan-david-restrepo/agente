import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Avatar {
    private avatarSubject = new BehaviorSubject<string>(
    localStorage.getItem('avatar') || 'assets/images/images (3).png'
  );

  avatar$ = this.avatarSubject.asObservable();

  setAvatar(avatar: string) {
    this.avatarSubject.next(avatar);
    localStorage.setItem('avatar', avatar);
  }

  getAvatar(): string {
    return this.avatarSubject.value;
  }
}
