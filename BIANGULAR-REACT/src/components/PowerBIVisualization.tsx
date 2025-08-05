import React, { useState, useEffect } from 'react';
import { getPowerBIConfig, getPowerBISettings, savePowerBISettings, PowerBISettings } from '../config/powerbi-config';

interface PowerBIVisualizationProps {
  menuData: {
    idmenu: number;
    menu: string;
    vista: string | null;
    url: string | null;
    ancho?: string | null;
    alto?: string | null;
  };
  onCustomize?: (settings: PowerBISettings) => void;
}

const PowerBIVisualization: React.FC<PowerBIVisualizationProps> = ({ menuData, onCustomize }) => {
  const [settings, setSettings] = useState<PowerBISettings>(getPowerBISettings(menuData.vista || 'default'));
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Obtener configuración de Power BI
  const powerBIConfig = getPowerBIConfig(menuData.vista || 'default');

  // Simular carga de Power BI
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSettingChange = (key: keyof PowerBISettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Guardar en localStorage
    savePowerBISettings(menuData.vista || 'default', newSettings);
    
    // Notificar al componente padre
    onCustomize?.(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings = powerBIConfig.defaultSettings;
    setSettings(defaultSettings);
    savePowerBISettings(menuData.vista || 'default', defaultSettings);
    onCustomize?.(defaultSettings);
  };

  const getContainerStyle = () => ({
    backgroundColor: settings.backgroundColor,
    borderRadius: `${settings.borderRadius}px`,
    boxShadow: settings.shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
    overflow: 'hidden'
  });

  const getFooterStyle = () => ({
    backgroundColor: settings.footerColor,
    color: settings.primaryColor,
    padding: '12px 20px',
    textAlign: 'center' as const,
    fontSize: '14px',
    fontWeight: '500',
    borderTop: `1px solid ${settings.secondaryColor}20`
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={getContainerStyle()}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando visualización de Power BI...</p>
          <p className="text-gray-500 text-sm mt-2">{powerBIConfig.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Header con controles de personalización */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{powerBIConfig.title}</h1>
            <p className="text-gray-600">{powerBIConfig.description}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={resetToDefaults}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Restablecer</span>
            </button>
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
            >
              <span>🎨</span>
              <span>Personalizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de personalización */}
      {isCustomizing && (
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Personalizar Visualización</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Colores de fondo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color de fondo
                </label>
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Color primario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color primario
                </label>
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Color secundario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color secundario
                </label>
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Color del footer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color del footer
                </label>
                <input
                  type="color"
                  value={settings.footerColor}
                  onChange={(e) => handleSettingChange('footerColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded"
                />
              </div>

              {/* Texto del footer */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto del footer
                </label>
                <input
                  type="text"
                  value={settings.footerText}
                  onChange={(e) => handleSettingChange('footerText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Texto del footer..."
                />
              </div>

              {/* Mostrar footer */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showFooter}
                    onChange={(e) => handleSettingChange('showFooter', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Mostrar footer</span>
                </label>
              </div>

              {/* Sombra */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.shadow}
                    onChange={(e) => handleSettingChange('shadow', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Sombra</span>
                </label>
              </div>

              {/* Border radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border radius: {settings.borderRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.borderRadius}
                  onChange={(e) => handleSettingChange('borderRadius', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor principal de Power BI */}
      <div className="flex-1 relative" style={getContainerStyle()}>
        <iframe
          src={powerBIConfig.url}
          title={`Power BI - ${powerBIConfig.title}`}
          className="w-full h-full border-0"
          allowFullScreen
        />
        
        {/* Footer personalizable */}
        {settings.showFooter && (
          <div style={getFooterStyle()}>
            {settings.footerText}
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerBIVisualization; 