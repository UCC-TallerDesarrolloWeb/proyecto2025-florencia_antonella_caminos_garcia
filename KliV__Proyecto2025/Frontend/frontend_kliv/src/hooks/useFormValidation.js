import { useState, useCallback } from "react"

/**
 * Hook para manejo y validación de formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Function} validate - Función de validación personalizada
 */
export const useFormValidation = (initialValues = {}, validate = () => ({})) => {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target
        const val = type === "checkbox" ? checked : value
        
        setValues(prev => ({ ...prev, [name]: val }))
        
        // Validar en tiempo real solo si el campo fue tocado
        if (touched[name]) {
            const validationErrors = validate({ ...values, [name]: val })
            setErrors(prev => ({ ...prev, [name]: validationErrors[name] }))
        }
    }, [validate, touched, values])

    const handleBlur = useCallback((e) => {
        const { name } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))
        
        // Validar al perder el foco
        const validationErrors = validate(values)
        setErrors(prev => ({ ...prev, [name]: validationErrors[name] }))
    }, [validate, values])

    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }))
    }, [])

    const resetForm = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
    }, [initialValues])

    const validateForm = useCallback(() => {
        const validationErrors = validate(values)
        setErrors(validationErrors)
        setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
        return Object.keys(validationErrors).length === 0
    }, [validate, values])

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        resetForm,
        validateForm,
        isValid: Object.keys(errors).length === 0
    }
}