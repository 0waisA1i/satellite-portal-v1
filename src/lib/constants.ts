export const ADMIN_EMAIL = "admin@satellite.com";

export interface ClientConfig {
  usesTwoTabView: boolean;
  isH2o: boolean;
  isKathairos: boolean;
  isEnsights: boolean;
  hasArchiveFeature: boolean;
  hasArchetypeStrip: boolean;
}

const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  usesTwoTabView: false,
  isH2o: false,
  isKathairos: false,
  isEnsights: false,
  hasArchiveFeature: false,
  hasArchetypeStrip: false,
};

export const CLIENT_CONFIG: Record<string, ClientConfig> = {
  h2oallegiant: {
    ...DEFAULT_CLIENT_CONFIG,
    isH2o: true,
    hasArchiveFeature: true,
  },
  kathairos: {
    ...DEFAULT_CLIENT_CONFIG,
    usesTwoTabView: true,
    isKathairos: true,
    hasArchiveFeature: true,
    hasArchetypeStrip: true,
  },
  gridvest: {
    ...DEFAULT_CLIENT_CONFIG,
    usesTwoTabView: true,
    hasArchiveFeature: true,
    hasArchetypeStrip: true,
  },
  cleantechgrowthlab: {
    ...DEFAULT_CLIENT_CONFIG,
    usesTwoTabView: true,
    hasArchiveFeature: true,
    hasArchetypeStrip: true,
  },
  ensights: {
    ...DEFAULT_CLIENT_CONFIG,
    usesTwoTabView: true,
    isEnsights: true,
    hasArchiveFeature: true,
    hasArchetypeStrip: true,
  },
};

export function getClientConfig(clientId: string): ClientConfig {
  return CLIENT_CONFIG[clientId] ?? DEFAULT_CLIENT_CONFIG;
}
