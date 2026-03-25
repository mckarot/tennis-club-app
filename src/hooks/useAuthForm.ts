/**
 * Auth Form Hook
 *
 * Generic form hook for authentication forms.
 * Provides state management, validation, and submission handling
 * for login, registration, and password reset forms.
 *
 * Features:
 * - Form values state management
 * - Field-level errors
 * - Blur validation
 * - Submit handling
 * - Form reset
 * - Touch tracking
 *
 * @module @hooks/useAuthForm
 */

import { useState, useCallback, useMemo } from 'react';
import type { ValidationErrors } from '../firebase/types';

// ==========================================
// HOOK TYPES
// ==========================================

/**
 * Form values type
 */
export interface FormValues {
  [key: string]: string | boolean | undefined;
}

/**
 * Form validator function type
 */
export type FormValidator<T extends FormValues> = (values: T) => ValidationErrors;

/**
 * Form submission handler type
 */
export type FormSubmitHandler<T extends FormValues> = (values: T) => Promise<void | { error?: string }>;

/**
 * Hook return type
 */
export interface UseAuthFormReturn<T extends FormValues> {
  values: T;
  errors: ValidationErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setValues: (newValues: Partial<T>) => void;
  setErrors: (newErrors: ValidationErrors) => void;
  resetForm: () => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(field: K, error: string | undefined) => void;
  setFieldTouched: <K extends keyof T>(field: K, touched: boolean) => void;
  isValid: boolean;
  hasErrors: boolean;
}

/**
 * Hook options
 */
export interface UseAuthFormOptions<T extends FormValues> {
  initialValues: T;
  validate?: FormValidator<T>;
  onSubmit: FormSubmitHandler<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

export function useAuthForm<T extends FormValues>({
  initialValues,
  validate,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseAuthFormOptions<T>): UseAuthFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<ValidationErrors>({});
  const [touched, setTouchedState] = useState<Record<keyof T, boolean>>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = false;
      return acc;
    }, {} as Record<keyof T, boolean>)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate form values
   */
  const validateForm = useCallback(
    (vals: T): ValidationErrors => {
      if (!validate) return {};
      return validate(vals);
    },
    [validate]
  );

  /**
   * Set form values
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  /**
   * Set a single field value
   */
  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Set form errors
   */
  const setErrors = useCallback((newErrors: ValidationErrors) => {
    setErrorsState(newErrors);
  }, []);

  /**
   * Set a single field error
   */
  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrorsState((prev) => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Set field touched state
   */
  const setFieldTouched = useCallback(<K extends keyof T>(field: K, touched: boolean) => {
    setTouchedState((prev) => ({ ...prev, [field]: touched }));
  }, []);

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      setValuesState((prev) => ({ ...prev, [name]: fieldValue }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrorsState((prev) => ({ ...prev, [name]: undefined }));
      }

      // Validate on change if enabled
      if (validateOnChange && validate) {
        const newValues = { ...values, [name]: fieldValue } as T;
        const validationErrors = validateForm(newValues);
        setErrorsState(validationErrors);
      }
    },
    [errors, validateOnChange, validate, validateForm, values]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name } = e.target;

      setTouchedState((prev) => ({ ...prev, [name]: true }));

      // Validate on blur if enabled
      if (validateOnBlur && validate) {
        const validationErrors = validateForm(values);
        setErrorsState(validationErrors);
      }
    },
    [validateOnBlur, validate, validateForm, values]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Run validation before submit
      let validationErrors: ValidationErrors = {};
      if (validate) {
        validationErrors = validateForm(values);
        setErrorsState(validationErrors);
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>);
      setTouchedState(allTouched);

      // Only submit if no errors
      if (Object.keys(validationErrors).length === 0) {
        try {
          const result = await onSubmit(values);
          if (result?.error) {
            setErrorsState((prev) => ({ ...prev, general: result.error }));
          }
        } catch (err) {
          console.error('[useAuthForm] Submit error:', err);
          setErrorsState((prev) => ({
            ...prev,
            general: err instanceof Error ? err.message : 'An unexpected error occurred',
          }));
        }
      }

      setIsSubmitting(false);
    },
    [validate, validateForm, values, onSubmit]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState(
      Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = false;
        return acc;
      }, {} as Record<keyof T, boolean>)
    );
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Check if form has errors
   */
  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    return !hasErrors;
  }, [hasErrors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
    resetForm,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    isValid,
    hasErrors,
  };
}

export default useAuthForm;
