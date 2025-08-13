import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/filing.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('userSession');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        this.currentUserSubject.next(userData);
      } catch (error) {
        console.error('Error parsing saved user session:', error);
        localStorage.removeItem('userSession');
      }
    }
  }

  login(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('userSession', JSON.stringify(user));
  }

  logout(): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser && currentUser.user === 'guest') {
      // Clear guest user data - will be handled by ApiService
    }
    
    this.currentUserSubject.next(null);
    localStorage.removeItem('userSession');
    localStorage.removeItem('currentView');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserEmail(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    if (user.user === 'guest') return user.email || '';
    return 'user@gmail.com';
  }
} 