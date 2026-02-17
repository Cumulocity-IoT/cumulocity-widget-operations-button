import { IIdentified, IManagedObject } from '@c8y/client';

export const CODEX_HOOK_LINKS = 'Codex hook links';

export interface SamplePluginConfig {
  text?: string;
  device?: IIdentified & Partial<IManagedObject>;
}
