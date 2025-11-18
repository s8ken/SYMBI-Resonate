export type AppConfig = {
  TENANT_ID: string
  MODEL_ID: string
  POLICY_PACK: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  ED25519_PUBLIC_KEY_BASE64?: string
  ED25519_PRIVATE_KEY_BASE64?: string
  ED25519_KEYS_JSON?: string
}

function requireEnv(name: keyof AppConfig, fallback?: string): string {
  const v = (import.meta as any).env?.[`VITE_${name}`] ?? process?.env?.[`VITE_${name}`]
  const value = v ?? fallback
  if (!value) throw new Error(`Missing required env var VITE_${name}`)
  return String(value)
}

export const config: AppConfig = {
  TENANT_ID: requireEnv('TENANT_ID'),
  MODEL_ID: requireEnv('MODEL_ID'),
  POLICY_PACK: requireEnv('POLICY_PACK'),
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('SUPABASE_ANON_KEY'),
  ED25519_PUBLIC_KEY_BASE64: (import.meta as any).env?.VITE_ED25519_PUBLIC_KEY_BASE64 ?? process?.env?.VITE_ED25519_PUBLIC_KEY_BASE64,
  ED25519_PRIVATE_KEY_BASE64: (import.meta as any).env?.VITE_ED25519_PRIVATE_KEY_BASE64 ?? process?.env?.VITE_ED25519_PRIVATE_KEY_BASE64,
  ED25519_KEYS_JSON: (import.meta as any).env?.VITE_ED25519_KEYS_JSON ?? process?.env?.VITE_ED25519_KEYS_JSON,
}
