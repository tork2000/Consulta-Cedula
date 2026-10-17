/**
 * Validador oficial de formato de cédula de identidad venezolana
 * Soporta cédulas históricas y actuales: Entre 6 y 8 dígitos numéricos (ejemplos: V-7654321, V-12345678, E-87654321).
 */

export interface CedulaValidationResult {
  isValid: boolean;
  error?: string;
  errorDetail?: string;
  normalized: string;
  nacionalidad?: 'V' | 'E';
  numero?: string;
  breakdown: {
    hasValidPrefix: boolean;
    hasHyphen: boolean;
    digitsCount: number;
    hasValidDigitsCount: boolean;
    hasExact8Digits: boolean; // Conservado para compatibilidad
    hasInvalidChars: boolean;
  };
}

// Cédulas venezolanas válidas: V o E seguido de 6 a 8 dígitos
export const CEDULA_REGEX = /^(V|E)-\d{6,8}$/;

/**
 * Validador cuando el usuario selecciona V o E y solo coloca los dígitos en el campo
 */
export function validateCedulaDigits(
  digitsInput: string,
  nationality: 'V' | 'E'
): CedulaValidationResult {
  const raw = digitsInput || '';
  const digitsOnly = raw.replace(/\D/g, '');
  const hasInvalidChars = /[^\d]/.test(raw);
  const digitsCount = digitsOnly.length;
  // En Venezuela las cédulas tienen legalmente entre 6 y 8 dígitos (por ejemplo 7 dígitos como V-7654321 u 8 dígitos como V-24123456)
  const hasValidDigitsCount = digitsCount >= 6 && digitsCount <= 8;

  const breakdown = {
    hasValidPrefix: true, // Seleccionado explícitamente en el botón V / E
    hasHyphen: true,      // Se sobreentiende automáticamente
    digitsCount,
    hasValidDigitsCount,
    hasExact8Digits: hasValidDigitsCount,
    hasInvalidChars,
  };

  if (!raw.trim() || digitsCount === 0) {
    return {
      isValid: false,
      error: 'Ingresa los números de la cédula',
      errorDetail: 'Debes colocar entre 6 y 8 números de la cédula (por ejemplo: 7 dígitos como 7654321 u 8 dígitos como 12345678).',
      normalized: `${nationality}-`,
      nacionalidad: nationality,
      numero: '',
      breakdown,
    };
  }

  if (hasInvalidChars) {
    return {
      isValid: false,
      error: 'Solo se permiten números',
      errorDetail: 'En el cuadro solo debes escribir los dígitos (0-9). La letra y el guion ya están asignados automáticamente.',
      normalized: `${nationality}-${digitsOnly}`,
      nacionalidad: nationality,
      numero: digitsOnly,
      breakdown,
    };
  }

  if (digitsCount < 6) {
    return {
      isValid: false,
      error: `Dígitos incompletos (${digitsCount} de 6 a 8)`,
      errorDetail: `Las cédulas venezolanas tienen entre 6 y 8 dígitos. Ingresaste ${digitsCount} número(s).`,
      normalized: `${nationality}-${digitsOnly}`,
      nacionalidad: nationality,
      numero: digitsOnly,
      breakdown,
    };
  }

  if (digitsCount > 8) {
    return {
      isValid: false,
      error: `Exceso de dígitos (${digitsCount}/8)`,
      errorDetail: `La cédula puede tener como máximo 8 números. Se han colocado ${digitsCount - 8} de más.`,
      normalized: `${nationality}-${digitsOnly.slice(0, 8)}`,
      nacionalidad: nationality,
      numero: digitsOnly.slice(0, 8),
      breakdown,
    };
  }

  return {
    isValid: true,
    normalized: `${nationality}-${digitsOnly}`,
    nacionalidad: nationality,
    numero: digitsOnly,
    breakdown,
  };
}

export function validateCedulaFormat(rawInput: string): CedulaValidationResult {
  const input = (rawInput || '').trim().toUpperCase();

  const firstChar = input.charAt(0);
  const secondChar = input.charAt(1);
  const hasValidPrefix = firstChar === 'V' || firstChar === 'E';
  const hasHyphen = secondChar === '-';
  const digitsOnly = input.replace(/\D/g, '');
  const nonDigitAfterHyphen = input.slice(2).replace(/\d/g, '');
  const hasInvalidChars = nonDigitAfterHyphen.length > 0;
  const hasValidDigitsCount = digitsOnly.length >= 6 && digitsOnly.length <= 8;

  const breakdown = {
    hasValidPrefix,
    hasHyphen,
    digitsCount: digitsOnly.length,
    hasValidDigitsCount,
    hasExact8Digits: hasValidDigitsCount,
    hasInvalidChars,
  };

  if (!input) {
    return {
      isValid: false,
      error: 'Ingresa un número de cédula.',
      errorDetail: 'El campo no puede estar vacío.',
      normalized: '',
      breakdown,
    };
  }

  if (CEDULA_REGEX.test(input)) {
    const [nacionalidad, numero] = input.split('-');
    return {
      isValid: true,
      normalized: input,
      nacionalidad: nacionalidad as 'V' | 'E',
      numero,
      breakdown,
    };
  }

  let errorTitle = 'Formato de cédula incorrecto';
  let errorDetail = "La cédula debe comenzar con 'V' o 'E', seguido de un guion y entre 6 y 8 dígitos numéricos (ejemplo: V-7654321 o V-12345678).";

  if (!hasValidPrefix) {
    errorTitle = "Nacionalidad no válida o faltante";
    errorDetail = "El documento debe comenzar obligatoriamente con la letra 'V' (Venezolano) o 'E' (Extranjero).";
  } else if (!hasHyphen) {
    errorTitle = "Falta el guion separador (-)";
    errorDetail = `Se requiere un guion después de la letra ${firstChar}. Por ejemplo: ${firstChar}-...`;
  } else if (hasInvalidChars) {
    errorTitle = "Caracteres no numéricos detectados";
    errorDetail = "Después del guion solo se permiten dígitos del 0 al 9, sin letras ni espacios.";
  } else if (digitsOnly.length < 6) {
    errorTitle = `Dígitos incompletos (${digitsOnly.length} números)`;
    errorDetail = `Las cédulas venezolanas tienen entre 6 y 8 dígitos. Faltan números para completar el mínimo de 6 o 7 dígitos.`;
  } else if (digitsOnly.length > 8) {
    errorTitle = `Exceso de dígitos (${digitsOnly.length}/8)`;
    errorDetail = `La cédula debe tener como máximo 8 dígitos numéricos. Hay ${digitsOnly.length - 8} dígito(s) de más.`;
  }

  return {
    isValid: false,
    error: errorTitle,
    errorDetail,
    normalized: input,
    breakdown,
  };
}

/**
 * Función inteligente para sugerir o corregir automáticamente el formato
 */
export function autoFormatCedula(rawInput: string, defaultNationality: 'V' | 'E' = 'V'): string {
  if (!rawInput) return '';

  let cleaned = rawInput.trim().toUpperCase();

  let nationality: 'V' | 'E' = defaultNationality;
  if (cleaned.startsWith('V')) {
    nationality = 'V';
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('E')) {
    nationality = 'E';
    cleaned = cleaned.substring(1);
  }

  const digits = cleaned.replace(/\D/g, '');

  if (digits.length === 0) {
    return `${nationality}-`;
  }

  if (digits.length <= 8) {
    return `${nationality}-${digits}`;
  }

  return `${nationality}-${digits.slice(0, 8)}`;
}

/**
 * Cálculo del Dígito Verificador del RIF (SENIAT Venezuela - Módulo 11)
 * Para cédulas de 6 o 7 dígitos, el SENIAT las rellena con ceros a la izquierda a 8 dígitos para ponderar.
 */
export function calculateVenezuelanRif(nationality: 'V' | 'E', cedulaDigitsStr: string): string {
  const digits = cedulaDigitsStr.replace(/\D/g, '').padStart(8, '0');
  const prefixVal = nationality === 'V' ? 1 : 2;
  const weights = [3, 2, 7, 6, 5, 4, 3, 2];

  let sum = prefixVal * 4;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i], 10) * weights[i];
  }

  const remainder = sum % 11;
  let checkDigit = 11 - remainder;
  if (checkDigit >= 10) {
    checkDigit = 0;
  }

  return `${nationality}-${digits}-${checkDigit}`;
}
