-- CORRECCIONES PARA LA BASE DE DATOS ALESE CORP
-- Ejecutar estos comandos para corregir los problemas identificados

-- 1. RENOMBRAR LA TABLA DE PERMISOS CON NOMBRE PROBLEMÁTICO
RENAME TABLE `___________________________permisos` TO `usuario_permisos`;

-- 2. LIMPIAR REGISTROS VACÍOS EN PERMISOS
DELETE FROM `usuario_permisos` WHERE `UsuCod` = '' OR `UsuCod` IS NULL OR `idmenu` = 0;

-- 3. CORREGIR EL CAMPO DE ESTADO EN USUARIOS
-- Cambiar 'act' por '1' y 'des' por '0' para consistencia
UPDATE `usuarios` SET `UsuEst` = '1' WHERE `UsuEst` = 'act';
UPDATE `usuarios` SET `UsuEst` = '0' WHERE `UsuEst` = 'des';

-- 4. AGREGAR ÍNDICES PARA MEJORAR RENDIMIENTO
ALTER TABLE `usuario_permisos` ADD INDEX `idx_usuario_cod` (`UsuCod`);
ALTER TABLE `usuario_permisos` ADD INDEX `idx_menu_id` (`idmenu`);
ALTER TABLE `usuarios` ADD INDEX `idx_usuario_estado` (`UsuEst`);
ALTER TABLE `usuarios` ADD INDEX `idx_perfil` (`idperfil`);
ALTER TABLE `menus` ADD INDEX `idx_menu_estado` (`estado`);
ALTER TABLE `menus` ADD INDEX `idx_menu_parent` (`parent`);

-- 5. VALIDAR INTEGRIDAD DE DATOS
-- Eliminar permisos que referencian menús inexistentes
DELETE FROM `usuario_permisos` 
WHERE `idmenu` NOT IN (SELECT `idmenu` FROM `menus`);

-- Eliminar permisos que referencian usuarios inexistentes  
DELETE FROM `usuario_permisos` 
WHERE `UsuCod` NOT IN (SELECT `UsuCod` FROM `usuarios`);

-- 6. AGREGAR USUARIOS DE PRUEBA SI NO EXISTEN
INSERT IGNORE INTO `usuarios` 
(`UsuCod`, `UsuNom`, `UsuApePat`, `UsuApeMat`, `UsuEmail`, `UsuClave`, `UsuPerfil`, `UsuEst`, `idperfil`) 
VALUES 
('admin', 'Administrador', 'Sistema', '', 'admin@alesecorp.com', 'admin123', 'Administrador', '1', 40),
('test', 'Usuario', 'Prueba', '', 'test@alesecorp.com', 'test123', 'Usuario de Prueba', '1', 25);

-- 7. OPTIMIZAR CONSULTAS CON NUEVAS VISTAS
CREATE OR REPLACE VIEW `v_usuario_completo` AS
SELECT 
    u.UsuCod,
    u.UsuNom,
    u.UsuApePat,
    u.UsuApeMat,
    u.UsuEmail,
    u.UsuPerfil,
    u.UsuEst,
    u.idperfil,
    p.perfil as nombre_perfil,
    CONCAT_WS(' ', u.UsuNom, u.UsuApePat, u.UsuApeMat) as nombre_completo
FROM usuarios u
LEFT JOIN perfiles p ON u.idperfil = p.idperfil
WHERE u.UsuEst = '1';

CREATE OR REPLACE VIEW `v_permisos_usuario` AS
SELECT DISTINCT
    up.UsuCod,
    up.idmenu,
    m.menu,
    m.vista,
    m.icono,
    m.url,
    m.parent,
    'usuario' as tipo_permiso
FROM usuario_permisos up
INNER JOIN menus m ON up.idmenu = m.idmenu
WHERE m.estado = '1'

UNION

SELECT DISTINCT
    u.UsuCod,
    pm.idmenu,
    m.menu,
    m.vista,
    m.icono,
    m.url,
    m.parent,
    'perfil' as tipo_permiso
FROM usuarios u
INNER JOIN perfil_menus pm ON u.idperfil = pm.idperfil
INNER JOIN menus m ON pm.idmenu = m.idmenu
WHERE u.UsuEst = '1' AND m.estado = '1';
