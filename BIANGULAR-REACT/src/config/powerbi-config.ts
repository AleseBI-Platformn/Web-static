/**
 * Configuración de Power BI para ALESE CORP
 * URLs y configuraciones de visualizaciones
 */

export interface PowerBIConfig {
  url: string;
  title: string;
  description: string;
  defaultSettings: PowerBISettings;
}

export interface PowerBISettings {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  footerColor: string;
  showFooter: boolean;
  borderRadius: number;
  shadow: boolean;
}

// Configuración por defecto para todas las visualizaciones
export const defaultPowerBISettings: PowerBISettings = {
  backgroundColor: '#ffffff',
  primaryColor: '#0078d4', // Azul Microsoft
  secondaryColor: '#106ebe',
  footerText: 'ALESE CORP - Power BI Dashboard',
  footerColor: '#f8f9fa',
  showFooter: true,
  borderRadius: 8,
  shadow: true
};

// URLs de Power BI por menú
export const powerBIConfigs: { [key: string]: PowerBIConfig } = {
  'reportes': {
    url: 'https://app.powerbi.com/view?r=eyJrIjoiYzE3YjM5YzAtYzE3Yi00YzE3Yi1hYzE3Yi1iYzE3Yi1jYzE3YiIsImMiOjh9',
    title: 'Reportes Generales',
    description: 'Dashboard principal de reportes y métricas',
    defaultSettings: {
      ...defaultPowerBISettings,
      primaryColor: '#e74c3c', // Rojo para reportes
      secondaryColor: '#c0392b',
      footerText: 'ALESE CORP - Reportes y Métricas'
    }
  },
  
  'dashboard': {
    url: 'https://app.powerbi.com/view?r=eyJrIjoiYzE3YjM5YzAtYzE3Yi00YzE3Yi1hYzE3Yi1iYzE3Yi1jYzE3YiIsImMiOjh9',
    title: 'Dashboard Principal',
    description: 'Vista general del negocio',
    defaultSettings: {
      ...defaultPowerBISettings,
      primaryColor: '#27ae60', // Verde para dashboard
      secondaryColor: '#229954',
      footerText: 'ALESE CORP - Dashboard Principal'
    }
  },
  
  'usuarios': {
    url: 'https://app.powerbi.com/view?r=eyJrIjoiYzE3YjM5YzAtYzE3Yi00YzE3Yi1hYzE3Yi1iYzE3Yi1jYzE3YiIsImMiOjh9',
    title: 'Análisis de Usuarios',
    description: 'Métricas y comportamiento de usuarios',
    defaultSettings: {
      ...defaultPowerBISettings,
      primaryColor: '#9b59b6', // Púrpura para usuarios
      secondaryColor: '#8e44ad',
      footerText: 'ALESE CORP - Análisis de Usuarios'
    }
  },
  
  'config': {
    url: 'https://app.powerbi.com/view?r=eyJrIjoiYzE3YjM5YzAtYzE3Yi00YzE3Yi1hYzE3Yi1iYzE3Yi1jYzE3YiIsImMiOjh9',
    title: 'Configuración del Sistema',
    description: 'Panel de configuración y administración',
    defaultSettings: {
      ...defaultPowerBISettings,
      primaryColor: '#f39c12', // Naranja para configuración
      secondaryColor: '#e67e22',
      footerText: 'ALESE CORP - Configuración del Sistema'
    }
  },
  
  'admin': {
    url: 'https://app.powerbi.com/view?r=eyJrIjoiYzE3YjM5YzAtYzE3Yi00YzE3Yi1hYzE3Yi1iYzE3Yi1jYzE3YiIsImMiOjh9',
    title: 'Administración',
    description: 'Panel de administración del sistema',
    defaultSettings: {
      ...defaultPowerBISettings,
      primaryColor: '#34495e', // Gris oscuro para admin
      secondaryColor: '#2c3e50',
      footerText: 'ALESE CORP - Panel de Administración'
    }
  }
};

/**
 * Obtener configuración de Power BI por vista
 */
export const getPowerBIConfig = (vista: string): PowerBIConfig => {
  const config = powerBIConfigs[vista.toLowerCase()];
  
  if (config) {
    return config;
  }
  
  // Configuración por defecto si no se encuentra
  return {
    url: 'https://app.powerbi.com/view?r=eyJrIjoiYzE3YjM5YzAtYzE3Yi00YzE3Yi1hYzE3Yi1iYzE3Yi1jYzE3YiIsImMiOjh9',
    title: 'Visualización Power BI',
    description: 'Dashboard de Power BI',
    defaultSettings: defaultPowerBISettings
  };
};

/**
 * Guardar configuración personalizada en localStorage
 */
export const savePowerBISettings = (vista: string, settings: PowerBISettings): void => {
  try {
    localStorage.setItem(`powerbi-settings-${vista}`, JSON.stringify(settings));
  } catch (error) {
    console.error('Error guardando configuración de Power BI:', error);
  }
};

/**
 * Cargar configuración personalizada desde localStorage
 */
export const loadPowerBISettings = (vista: string): PowerBISettings | null => {
  try {
    const saved = localStorage.getItem(`powerbi-settings-${vista}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error cargando configuración de Power BI:', error);
    return null;
  }
};

/**
 * Obtener configuración completa (por defecto + personalizada)
 */
export const getPowerBISettings = (vista: string): PowerBISettings => {
  const config = getPowerBIConfig(vista);
  const savedSettings = loadPowerBISettings(vista);
  
  return {
    ...config.defaultSettings,
    ...savedSettings
  };
}; 