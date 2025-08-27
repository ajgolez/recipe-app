/**
 * Form validation utilities with error handling
 */

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class FormValidator {
  private rules: Map<string, ValidationRule[]> = new Map();

  addRule(field: string, rule: ValidationRule): FormValidator {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    this.rules.get(field)!.push(rule);
    return this;
  }

  validate(data: Record<string, any>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [field, rules] of this.rules.entries()) {
      const value = data[field];
      const errors: string[] = [];

      for (const rule of rules) {
        try {
          if (!rule.validate(value)) {
            errors.push(rule.message);
          }
        } catch (error) {
          console.error(`Validation error for field ${field}:`, error);
          errors.push('Validation error occurred');
        }
      }

      results[field] = {
        isValid: errors.length === 0,
        errors
      };
    }

    return results;
  }

  isFormValid(data: Record<string, any>): boolean {
    const results = this.validate(data);
    return Object.values(results).every(result => result.isValid);
  }
}

// Common validation rules
export const ValidationRules = {
  required: (message: string = 'This field is required'): ValidationRule => ({
    validate: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return !isNaN(value);
      if (Array.isArray(value)) return value.length > 0;
      return value != null && value !== undefined;
    },
    message
  }),

  email: (message: string = 'Please enter a valid email address'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Optional field
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.trim());
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Optional field
      return value.trim().length >= min;
    },
    message: message || `Must be at least ${min} characters long`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Optional field
      return value.trim().length <= max;
    },
    message: message || `Must be no more than ${max} characters long`
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    validate: (value: number) => {
      if (value == null) return true; // Optional field
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `Must be between ${min} and ${max}`
  }),

  url: (message: string = 'Please enter a valid URL'): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Optional field
      try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    },
    message
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // Optional field
      return regex.test(value);
    },
    message
  }),

  custom: (validatorFn: (value: any) => boolean, message: string): ValidationRule => ({
    validate: validatorFn,
    message
  })
};

// React hook for form validation
export const useFormValidation = () => {
  const createValidator = () => new FormValidator();

  const validateField = (value: any, rules: ValidationRule[]): ValidationResult => {
    const errors: string[] = [];

    for (const rule of rules) {
      try {
        if (!rule.validate(value)) {
          errors.push(rule.message);
        }
      } catch (error) {
        console.error('Validation error:', error);
        errors.push('Validation error occurred');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return { createValidator, validateField, ValidationRules };
};

// Input sanitization utilities
export const sanitize = {
  string: (value: string): string => {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/[<>]/g, '');
  },

  number: (value: any): number | null => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  },

  email: (value: string): string => {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase().replace(/[<>]/g, '');
  },

  url: (value: string): string => {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/[<>]/g, '');
  }
};