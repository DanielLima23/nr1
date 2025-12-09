import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {

  get(key: string): string {
    return localStorage.getItem(key) || '';
  }

  set(key: string, value: any): boolean {
    if (value !== undefined && value !== null && value !== '') {
      localStorage.setItem(key, String(value));
      return true;
    }
    console.warn('Valor inválido');
    return false;
  }

  has(key: string): boolean {
    return !!localStorage.getItem(key);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  setObject(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  getObject(key: string): any | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  updateObject(key: string, partial: any): any | null {
    const current = this.getObject(key);
    if (!current) return null;

    const updated = { ...current, ...partial };
    this.setObject(key, updated);
    return updated;
  }

  deleteObject(key: string) {
    this.remove(key);
  }
}
