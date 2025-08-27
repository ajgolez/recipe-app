/**
 * Safe localStorage operations with error handling
 */

export interface StorageError extends Error {
  code: 'QUOTA_EXCEEDED' | 'SECURITY_ERROR' | 'PARSE_ERROR' | 'NOT_SUPPORTED' | 'UNKNOWN';
}

export class StorageManager {
  private static isSupported(): boolean {
    try {
      const test = 'localStorage_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static get<T>(key: string, fallback?: T): T | null {
    if (!this.isSupported()) {
      console.warn('localStorage is not supported');
      return fallback || null;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return fallback || null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get item "${key}" from localStorage:`, error);
      return fallback || null;
    }
  }

  static set<T>(key: string, value: T): boolean {
    if (!this.isSupported()) {
      console.warn('localStorage is not supported');
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Failed to set item "${key}" in localStorage:`, error);
      
      if (error instanceof Error) {
        const storageError = error as StorageError;
        
        if (error.name === 'QuotaExceededError') {
          storageError.code = 'QUOTA_EXCEEDED';
        } else if (error.name === 'SecurityError') {
          storageError.code = 'SECURITY_ERROR';
        } else {
          storageError.code = 'UNKNOWN';
        }
        
        throw storageError;
      }
      
      return false;
    }
  }

  static remove(key: string): boolean {
    if (!this.isSupported()) {
      console.warn('localStorage is not supported');
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item "${key}" from localStorage:`, error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isSupported()) {
      console.warn('localStorage is not supported');
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  static getStorageUsage(): { used: number; available: number; percentage: number } | null {
    if (!this.isSupported()) {
      return null;
    }

    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }

      // Most browsers have ~5MB storage limit
      const estimated = 5 * 1024 * 1024; // 5MB in bytes
      return {
        used: total,
        available: estimated,
        percentage: (total / estimated) * 100
      };
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
      return null;
    }
  }
}

/**
 * Safe JSON operations
 */
export class JSONManager {
  static safeStringify(value: any, fallback: string = '{}'): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('JSON stringify error:', error);
      return fallback;
    }
  }

  static safeParse<T>(jsonString: string, fallback?: T): T | null {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON parse error:', error);
      return fallback || null;
    }
  }
}

/**
 * Hook for using safe storage operations in React components
 */
export const useStorage = () => {
  const get = <T>(key: string, fallback?: T) => StorageManager.get<T>(key, fallback);
  
  const set = <T>(key: string, value: T) => {
    try {
      return StorageManager.set(key, value);
    } catch (error) {
      if (error instanceof Error) {
        const storageError = error as StorageError;
        switch (storageError.code) {
          case 'QUOTA_EXCEEDED':
            throw new Error('Storage quota exceeded. Please clear some browser data and try again.');
          case 'SECURITY_ERROR':
            throw new Error('Storage access denied. Please check your browser settings.');
          default:
            throw new Error('Failed to save data. Please try again.');
        }
      }
      throw error;
    }
  };

  const remove = (key: string) => StorageManager.remove(key);
  const clear = () => StorageManager.clear();
  const getUsage = () => StorageManager.getStorageUsage();

  return { get, set, remove, clear, getUsage };
};