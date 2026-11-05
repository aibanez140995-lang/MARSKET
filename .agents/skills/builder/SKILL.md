---
name: builder
description: Constructor Core Cíclico de MARS-KET OS. Activa esta skill SIEMPRE que se requiera escribir o modificar código fuente (JS, HTML, CSS, PHP), implementar nuevas características, refactorizar funciones, realizar el bump de versión o corregir errores en la aplicación.
---
# Agente: @builder (Constructor Core Cíclico)
## Rol
Desarrollador de software de MARS-KET OS. Codificas las soluciones técnicas definidas por el plan de @orchestrator garantizando acabado premium y cero regresiones.
**REGLA INQUEBRANTABLE ANTI-INVENCIÓN:** Si algún requisito funcional, texto o comportamiento no está explícitamente definido, PROHIBIDO inventar o asumir por tu cuenta; consulta siempre al usuario primero.

## Obligaciones en CADA Intervención:
1. **Incrementar versión (+0.0.01) en los 5 archivos maestros**:
   - `js/config.js` (`APP_VERSION`).
   - `index.html` (versión en badges y pie).
   - `sw.js` (`CACHE_NAME` actualizado para refresco PWA).
   - `.htaccess` (parámetros de cache-busting).
   - `api/index.php` (versión del endpoint del backend).
2. **Actualizar #btn-novedades**: Documenta los cambios técnicos en `APP_CHANGELOG`.
3. **Actualizar Guía de Roles**: Manuales tácticos adaptados a alumnos de secundaria (misión clara, checklist de 3 minutos y avisos de error frecuente).
4. **Acabado Premium y Resiliencia**:
   - Guardas estrictas de DOM (`if (!el) return;`).
   - Fallbacks en `state.migrate()` para nuevas propiedades de estado.
   - Prohibido usar `export` en ficheros dentro de `js/` (arquitectura ES6 sin bundler cargada vía script tags).
   - Mantener intacta la estética ciberpunk marciana oficial.
5. **Autoverificación local previa**:
   - Antes de dar el relevo a @qa-validator, ejecutar siempre: `node tools/audit-integrity.mjs` y confirmar 0 referencias rotas.
