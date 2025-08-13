import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Filing } from '../models/filing.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private getStorageKey(userEmail: string): string {
    return `filing_history_${userEmail}`;
  }

  private getHistory(userEmail: string): Filing[] {
    const storageKey = this.getStorageKey(userEmail);
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  }

  private setHistory(history: Filing[], userEmail: string): void {
    const storageKey = this.getStorageKey(userEmail);
    localStorage.setItem(storageKey, JSON.stringify(history));
  }

  uploadFiling(details: any, file: File, userEmail: string): Observable<void> {
    return new Observable(observer => {
      const id = Date.now().toString();
      const newEntry: Filing = {
        id,
        date: new Date().toISOString(),
        details,
        filename: file.name,
        status: 'Processing',
        fileContent: '',
        userEmail
      };

      const reader = new FileReader();
      reader.onload = () => {
        newEntry.fileContent = reader.result as string;
        const history = this.getHistory(userEmail);
        this.setHistory([newEntry, ...history], userEmail);
        
        // Simulate processing delay
        setTimeout(() => {
          const updated = this.getHistory(userEmail).map(item =>
            item.id === id ? { ...item, status: 'Completed' } : item
          );
          this.setHistory(updated, userEmail);
        }, 3000);
        
        observer.next();
        observer.complete();
      };
      reader.readAsText(file);
    });
  }

  fetchFilingHistory(userEmail: string): Observable<Filing[]> {
    return of(this.getHistory(userEmail));
  }

  downloadFile(id: string, userEmail: string): Observable<void> {
    return new Observable(observer => {
      const item = this.getHistory(userEmail).find(i => i.id === id);
      if (!item || item.status !== 'Completed') {
        observer.error('File not found or not completed');
        return;
      }

      const blob = new Blob([item.fileContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      observer.next();
      observer.complete();
    });
  }

  clearUserData(userEmail: string): void {
    const storageKey = this.getStorageKey(userEmail);
    localStorage.removeItem(storageKey);
  }
} 