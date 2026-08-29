import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido.')
    .email('Ingresá un correo válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
const phoneRegex = /^\+?[\d\s-]{8,15}$/;
const cuitMultipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

const addError = (errors, field, message) => {
  if (!errors[field]) {
    errors[field] = message;
  }
};

const validateEmail = (value, errors, field = 'email') => {
  if (!value?.trim()) {
    addError(errors, field, 'El correo electrónico es requerido.');
    return;
  }

  if (!emailRegex.test(value.trim())) {
    addError(errors, field, 'Ingresá un correo válido.');
  }
};

const validatePassword = (value, errors, field = 'password') => {
  if (!value) {
    addError(errors, field, 'La contraseña es requerida.');
    return;
  }

  if (value.length < 8) {
    addError(errors, field, 'La contraseña debe tener al menos 8 caracteres.');
  } else if (!/[A-Z]/.test(value)) {
    addError(errors, field, 'La contraseña debe contener al menos una mayúscula.');
  } else if (!/[0-9]/.test(value)) {
    addError(errors, field, 'La contraseña debe contener al menos un número.');
  }
};

const isValidCuit = (value) => {
  if (!value || !cuitRegex.test(value.trim())) {
    return false;
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) {
    return false;
  }

  const checkDigit = Number(digits[10]);
  const sum = cuitMultipliers.reduce((acc, multiplier, index) => {
    return acc + Number(digits[index]) * multiplier;
  }, 0);

  let expected = 11 - (sum % 11);
  if (expected === 11) expected = 0;
  if (expected === 10) expected = 9;

  return checkDigit === expected;
};

export const validateLoginData = (data) => {
  const errors = {};
  validateEmail(data.email, errors);

  if (!data.password) {
    addError(errors, 'password', 'La contraseña es requerida.');
  }

  return errors;
};

export const validateResetPasswordRequest = (data) => {
  const errors = {};
  validateEmail(data.email, errors);
  return errors;
};

export const validateNewPassword = (data) => {
  const errors = {};
  validatePassword(data.password, errors);

  if (!data.confirmPassword) {
    addError(errors, 'confirmPassword', 'Confirmá tu contraseña.');
  } else if (data.password !== data.confirmPassword) {
    addError(errors, 'confirmPassword', 'Las contraseñas no coinciden.');
  }

  return errors;
};

export const citizenRegisterSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido.').min(2, 'El nombre debe tener al menos 2 caracteres.'),
  apellido: z.string().trim().min(1, 'El apellido es requerido.').min(2, 'El apellido debe tener al menos 2 caracteres.'),
  email: z.string().trim().min(1, 'El correo electrónico es requerido.').regex(emailRegex, 'Ingresá un correo válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula.')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número.'),
  confirmPassword: z.string().min(1, 'Confirmá tu contraseña.'),
  provincia: z.string().trim().min(1, 'La provincia es requerida.'),
  ciudad: z.string().trim().min(1, 'La ciudad es requerida.'),
  zona: z.string().trim().min(1, 'La zona es requerida.'),
  acceptTerms: z.any().refine((val) => val === true, {
    message: 'Debés aceptar los términos para continuar.'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export const institutionRegisterSchema = z.object({
  contactName: z.string().trim().min(1, 'El nombre del responsable es requerido.').min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().trim().min(1, 'El correo electrónico institucional es requerido.').regex(emailRegex, 'Ingresá un correo válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula.')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número.'),
  confirmPassword: z.string().min(1, 'Confirmá tu contraseña.'),
  institutionName: z.string().trim().min(1, 'El nombre o razón social es requerido.').min(2, 'El nombre o razón social es requerido.'),
  cuit: z.string().trim().min(1, 'El CUIT es requerido.').refine(isValidCuit, { message: 'Ingresá un CUIT válido (ej: 20-12345678-9).' }),
  institutionType: z.string().trim().min(1, 'Debes seleccionar un tipo de institución.'),
  phone: z.string().trim().min(1, 'El teléfono de contacto es requerido.').regex(phoneRegex, 'Ingresá un teléfono válido.'),
  provincia: z.string().trim().min(1, 'La provincia es requerida.'),
  ciudad: z.string().trim().min(1, 'La ciudad es requerida.'),
  zona: z.string().trim().min(1, 'La zona es requerida.'),
  address: z.string().trim().min(1, 'La dirección es requerida.').min(5, 'La dirección debe ser más detallada.'),
  termsAccepted: z.any().refine((val) => val === true, {
    message: 'Debés aceptar los términos para continuar.'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export const validateVerifyEmail = (data) => {
  const errors = {};

  if (!data.code?.trim()) {
    addError(errors, 'code', 'El código es requerido.');
  } else if (data.code.trim().length !== 6) {
    addError(errors, 'code', 'El código debe tener exactamente 6 dígitos.');
  }

  return errors;
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;
