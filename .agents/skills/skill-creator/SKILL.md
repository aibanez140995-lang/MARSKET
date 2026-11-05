---
name: skill-creator
description: Crea nuevas skills, modifica y optimiza las existentes, y mide su rendimiento técnico en Antigravity 2.0. Activa esta skill SIEMPRE que el usuario pida crear una skill desde cero, convertir un flujo de la conversación en una regla o directiva reutilizable, editar o auditar una skill existente, ejecutar evaluaciones (evals) comparativas, analizar la varianza de rendimiento o mejorar la descripción de una skill para optimizar su activación automática (triggering).
---

# Skill Creator (Antigravity 2.0 & Gemini Edition)

## 🛑 REGLA INQUEBRANTABLE ANTI-INVENCIÓN (Directiva Permanente)
- **PROHIBIDO INVENTAR O SUPONER**: Si desconoces un dato o criterio del usuario, **NUNCA lo inventes ni lo asumas**. Pregunta siempre primero al usuario.

Meta-skill diseñada para crear nuevas habilidades operativas (`skills`) y mejorarlas iterativamente mediante pruebas empíricas dentro de Google Antigravity 2.0.

## Resumen del Flujo de Trabajo

El proceso de ingeniería de una skill sigue este ciclo:

1. **Definición de intención**: Determinar qué debe hacer la skill, cuándo debe activarse y qué formato de salida o artefactos produce.
2. **Borrador inicial (`SKILL.md`)**: Escribir la directiva modular aplicando divulgación progresiva (*progressive disclosure*).
3. **Casos de prueba (`evals.json`)**: Diseñar prompts realistas de prueba y ejecutarlos mediante subagentes o runners de Antigravity (con skill vs. línea base sin skill).
4. **Evaluación cualitativa y cuantitativa**:
   - Definir aserciones (*assertions*) verificables programáticamente mientras se ejecutan las pruebas.
   - Generar o lanzar el visor de resultados (`eval-viewer/generate_review.py` o reporte estático HTML) para revisión del usuario junto con las métricas de tokens y latencia.
5. **Iteración y refinamiento**: Reescribir la skill basándose en el feedback del usuario y en los fallos detectados en el benchmark, extrayendo scripts recurrentes a la carpeta `scripts/`.
6. **Optimización de Triggering y Registro**: Ajustar el campo `description` del frontmatter YAML y registrar la skill en el índice maestro del workspace (`GEMINI.md` o `.antigravity/rules/`).

Tu trabajo al usar esta skill es identificar en qué etapa del ciclo se encuentra el usuario y guiarlo sin fricción. Si el usuario solo quiere prototipar rápido sin correr benchmarks formales (*"solo créala rápido sin tests"*), adáptate y salta directamente al borrador y registro.

---

## Comunicación con el Usuario

Adapta la densidad técnica al perfil del usuario observando el contexto del proyecto:
- Si el usuario maneja código, scripts y arquitectura, ve directo al grano con términos técnicos (`JSON`, `assertions`, `subagents`, `exit codes`).
- Si el usuario muestra un perfil menos técnico, explica brevemente conceptos como *assertion* (comprobación automática) o *benchmark* (comparativa de rendimiento) sin añadir relleno innecesario.

---

## Fase 1: Creación de la Skill

### 1.1 Captura de Intención (Capture Intent)

Si la conversación actual ya contiene un flujo de trabajo exitoso que el usuario quiere empaquetar (ej. *"convierte esto que acabamos de hacer en una skill"*), extrae primero del historial: herramientas invocadas, comandos de terminal ejecutados, correcciones aplicadas por el usuario y formatos de entrada/salida.

Confirma o despeja con el usuario estas 4 variables antes de redactar:
1. **Capacidad operativa**: ¿Qué tarea exacta debe resolver Gemini al cargar esta skill?
2. **Disparadores (Triggers)**: ¿Qué frases, contextos o tipos de archivos deben activarla?
3. **Formato de salida**: ¿Qué entregable exacto espera (archivos modificados, JSON, informe Markdown, ejecución de comandos)?
4. **Estrategia de verificación**: ¿Configuramos casos de prueba (`evals`)?
   - *Recomendado* para salidas objetivas (transformación de archivos, generación de código, extracción de datos, automatización de scripts).
   - *Opcional* para salidas subjetivas (redacción creativa, diseño conceptual).

### 1.2 Investigación Previa

Antes de preguntar al usuario cosas que están en su entorno:
- Inspecciona el workspace actual, `package.json`, `requirements.txt`, servidores MCP activos y otras skills existentes en `skills/` o `.antigravity/skills/`.
- Verifica dependencias, rutas de archivos de ejemplo y restricciones de seguridad (como variables en `.env`).

### 1.3 Escritura del archivo `SKILL.md`

Estructura el archivo con el siguiente formato obligatorio:

- **name**: Identificador en `kebab-case` (ej. `marsket-audit`, `tool-integrator`).
- **description**: Mecanismo primario de enrutamiento de Gemini. Debe incluir **qué hace** la skill y **cuándo usarla**.
  - *Nota crítica sobre Triggering en Gemini*: Los modelos tienden a resolver tareas simples por su cuenta sin consultar skills externas (*undertriggering*). Redacta descripciones proactivas y explícitas. Ejemplo: en lugar de *"Genera fichas de ejercicios en PDF"*, escribe *"Genera fichas de ejercicios académicos en formato PDF. Usa esta skill SIEMPRE que el usuario mencione crear boletines, fichas de trabajo, hojas de problemas o material imprimible para alumnos, incluso si no pide explícitamente un PDF"*.
- **compatibility** *(opcional)*: Herramientas CLI requeridas (`node`, `python3`, `playwright`, MCPs específicos).

#### Anatomía del Directorio de la Skill

```text
skills/<skill-name>/
├── SKILL.md              # (Obligatorio) Frontmatter YAML + Instrucciones núcleo (<500 líneas)
├── scripts/              # (Opcional) Scripts deterministas (Python/Node/Bash) ejecutables por el agente
├── references/           # (Opcional) Documentación extensa, esquemas o normativas cargadas bajo demanda
└── assets/               # (Opcional) Plantillas HTML/Markdown, logos o archivos base de salida
```
