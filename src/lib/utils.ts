import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Native utility functions to replace lodash

/**
 * Shallow equality check for objects and arrays
 */
export function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.constructor !== b.constructor) return false;

    if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!isEqual(a[i], b[i])) return false;
        }
        return true;
    }

    if (typeof a === 'object') {
        const getKeys = (obj: object) => Object.keys(obj)
            .filter(key => key !== 'created_at' && key !== 'updated_at')
            .sort();

        const keysA = getKeys(a);
        const keysB = getKeys(b);

        if (keysA.length !== keysB.length) {
            return false;
        }

        for (let i = 0; i < keysA.length; i++) {
            const keyA = keysA[i];
            const keyB = keysB[i];
            
            if (keyA !== keyB || !isEqual(a[keyA], b[keyB])) {
                return false;
            }
        }

        return true;
    }

    return false;
}

/**
 * Sort array by field(s) with direction
 */
export function orderBy<T>(
  array: T[], 
  field: keyof T | ((item: T) => any), 
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  const getter = typeof field === 'function' ? field : (item: T) => item[field];
  const multiplier = direction === 'desc' ? -1 : 1;
  
  return [...array].sort((a, b) => {
    const aVal = getter(a);
    const bVal = getter(b);
    
    if (aVal < bVal) return -1 * multiplier;
    if (aVal > bVal) return 1 * multiplier;
    return 0;
  });
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Calculate mean of array by field
 */
export function meanBy<T>(array: T[], field: keyof T | ((item: T) => number)): number {
  if (array.length === 0) return 0;
  const getter = typeof field === 'function' ? field : (item: T) => item[field] as number;
  const sum = array.reduce((acc, item) => acc + getter(item), 0);
  return sum / array.length;
}

/**
 * Calculate sum of array by field
 */
export function sumBy<T>(array: T[], field: keyof T | ((item: T) => number)): number {
  const getter = typeof field === 'function' ? field : (item: T) => item[field] as number;
  return array.reduce((acc, item) => acc + getter(item), 0);
}

/**
 * Round number to specified decimal places
 */
export function round(number: number, precision: number = 0): number {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

/**
 * Remove items from array (mutates original array)
 */
export function remove<T>(array: T[], predicate: (item: T) => boolean): T[] {
  const removed: T[] = [];
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      removed.unshift(array.splice(i, 1)[0]);
    }
  }
  return removed;
}

/**
 * Deep clone an object or array
 */
export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (Array.isArray(obj)) return obj.map(item => cloneDeep(item)) as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = cloneDeep(obj[key]);
    }
  }
  return cloned;
} 