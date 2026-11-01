---
name: tool-integrations
description: Conectar e integrar herramientas y servicios externos (APIs, bases de datos, suites ofimáticas o automatización web) al workspace local de forma segura, determinista y paso a paso.
---

# Skill: Tool & Service Integrator

## Propósito
Conectar e integrar herramientas y servicios externos (APIs, bases de datos, suites ofimáticas o automatización web) al workspace local de forma segura, determinista y paso a paso.

## Reglas Críticas de Seguridad
1. Aislamiento de secretos: Comprobar que `.env` esté listado en `.gitignore` antes de crear o editar cualquier credencial.
2. Protección de claves: NUNCA hacer `cat`, imprimir en consola, ni copiar valores del archivo `.env`. Crear siempre una plantilla `.env.example` con los nombres de variables vacías y comentarios explicativos.
3. Modo paso a paso: Integrar y validar UNA sola herramienta por turno. Nunca avanzar al siguiente servicio sin confirmación explícita del usuario.

## Jerarquía de Decisión Técnica para Conexiones
Para cada servicio solicitado, evaluar y seleccionar la opción disponible en este orden estricto:
1. Protocolo MCP (Model Context Protocol): Servidor local configurado para el servicio.
2. API REST / SDK oficial: Mediante cliente en Node.js o Python usando variables del `.env`.
3. Conexión directa a Base de Datos: Clientes SQL/NoSQL mediante pool de conexiones seguro.
4. Automatización con Playwright/Puppeteer: Únicamente si la plataforma no ofrece API ni conector.

## Flujo de Trabajo Operativo
Para cada herramienta indicada por el usuario:
1. Preparación de variables: Añadir las variables necesarias a `.env.example` y pedir al usuario que rellene su `.env` local.
2. Script de prueba mínimo: Crear un script de test ligero y de SOLO LECTURA (ej. consultar perfil, listar 1 registro o verificar handshake/autenticación).
3. Ejecución y validación: Ejecutar el script desde la terminal, mostrar la estructura de la respuesta (sanitizando datos sensibles) y solicitar confirmación.
4. Registro en documentación: Anotar en el archivo `INTEGRATIONS.md` el servicio integrado, método empleado, scripts asociados y variables requeridas.
