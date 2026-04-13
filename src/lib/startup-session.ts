import type { ProductSpec, StartupInput, StartupOverview } from '@/types';

export const STARTUP_SESSION_KEYS = {
  input: 'startupInput',
  overview: 'startupOverview',
  productSpec: 'productSpec',
  masterplan: 'masterplan',
} as const;

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = sessionStorage.getItem(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function readStartupInput() {
  return readJson<StartupInput>(STARTUP_SESSION_KEYS.input);
}

export function writeStartupInput(value: StartupInput) {
  writeJson(STARTUP_SESSION_KEYS.input, value);
}

export function readStartupOverview() {
  return readJson<StartupOverview>(STARTUP_SESSION_KEYS.overview);
}

export function writeStartupOverview(value: StartupOverview) {
  writeJson(STARTUP_SESSION_KEYS.overview, value);
}

export function readProductSpec() {
  return readJson<ProductSpec>(STARTUP_SESSION_KEYS.productSpec);
}

export function writeProductSpec(value: ProductSpec) {
  writeJson(STARTUP_SESSION_KEYS.productSpec, value);
}

export function readMasterplan() {
  if (typeof window === 'undefined') {
    return null;
  }

  return sessionStorage.getItem(STARTUP_SESSION_KEYS.masterplan);
}

export function writeMasterplan(value: string) {
  sessionStorage.setItem(STARTUP_SESSION_KEYS.masterplan, value);
}

export function clearStartupSession() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(STARTUP_SESSION_KEYS.input);
  sessionStorage.removeItem(STARTUP_SESSION_KEYS.overview);
  sessionStorage.removeItem(STARTUP_SESSION_KEYS.productSpec);
  sessionStorage.removeItem(STARTUP_SESSION_KEYS.masterplan);
}