import { useState, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para manejo optimizado de formularios
 * Incluye validación, estados de error y funciones de reset
 */
const useFormState = (initialState = {}, validationRules = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validar campo individual
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value, formData);
      if (error) return error;
    }
    return '';
  }, [validationRules, formData]);

  // Validar todo el formulario
  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach(fieldName => {
      const fieldError = validateField(fieldName, formData[fieldName]);
      if (fieldError) {
        newErrors[fieldName] = fieldError;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setIsValid(!hasErrors);
    return !hasErrors;
  }, [formData, validateField]);

  // Actualizar campo individual
  const updateField = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar campo si ya ha sido tocado
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  }, [touched, validateField]);

  // Marcar campo como tocado
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));

    // Validar campo al tocarlo
    if (isTouched) {
      const fieldError = validateField(name, formData[name]);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  }, [formData, validateField]);

  // Resetear formulario
  const resetForm = useCallback((newInitialState = initialState) => {
    setFormData(newInitialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialState]);

  // Resetear errores
  const resetErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Función para manejar submit
  const handleSubmit = useCallback(async (onSubmit) => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      return true;
    } catch (error) {
      console.error('Error en submit:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  // Función para manejar cambios de input
  const handleChange = useCallback((name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updateField(name, value);
  }, [updateField]);

  // Función para manejar blur de input
  const handleBlur = useCallback((name) => () => {
    setFieldTouched(name, true);
  }, [setFieldTouched]);

  // Estado calculado para validación
  const formState = useMemo(() => ({
    isValid,
    isSubmitting,
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length
  }), [isValid, isSubmitting, errors]);

  return {
    // Estados
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    formState,

    // Funciones
    updateField,
    setFieldTouched,
    resetForm,
    resetErrors,
    handleSubmit,
    handleChange,
    handleBlur,
    validateForm,
    validateField
  };
};

export default useFormState; 