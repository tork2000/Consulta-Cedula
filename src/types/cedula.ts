export interface ElectoralData {
  habilitado_votacion: boolean;
  estado: string;
  municipio: string;
  parroquia: string;
  centro_electoral: string;
  mesa?: string;
}

export interface CivilRegistryData {
  estado_inscripcion?: string;
  tomo?: string;
  folio?: string;
  ano?: number;
}

export interface CedulaQueryResult {
  nacionalidad: 'V' | 'E';
  cedula: string;
  cedula_completa: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  nombre_completo: string;
  rif: string;
  fecha_nacimiento?: string;
  sexo?: 'M' | 'F';
  estado_civil?: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO';
  cne: ElectoralData;
  registro_civil?: CivilRegistryData;
  raw?: Record<string, unknown>;
}

export interface ApiResponsePayload {
  ok: boolean;
  source: string;
  is_live_api: boolean;
  notice?: string;
  data?: CedulaQueryResult;
  error?: string;
  code?: string;
  details?: string;
}

export interface QueryHistoryItem {
  id: string;
  timestamp: number;
  cedula_completa: string;
  nacionalidad: 'V' | 'E';
  numero: string;
  nombre_completo: string;
  rif: string;
  is_live_api: boolean;
  source: string;
  fullData: CedulaQueryResult;
}

export interface ApiSettings {
  app_id: string;
  token: string;
  useCustomKeys: boolean;
  offlineSimulationAllowed: boolean;
}
