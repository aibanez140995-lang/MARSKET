# 🗺️ MARS-KET OS — Índice de Diseños y Arquitectura (`SITEMAP.md`)

Este archivo es el índice central de especificaciones técnicas bajo el **Elephant-Goldfish Model (EGM)** para **MARS-KET OS**.

---

## 1. Contexto Base del Proyecto (Elephant Baseline)

* **[Contexto Maestro del Elefante (`marsket-elephant`)](../../.agents/skills/marsket-elephant/SKILL.md):** Arquitectura del sistema, leyes innegociables (Zero-Text RGPD, Vanilla JS + Tailwind local, 44px BYOD, persistencia dual CDMON SQLite + Cloudflare D1) y mapa de módulos.
* **[Tribunal de Arquetipos de Aula (`classroom-personas`)](../../.agents/skills/classroom-personas/SKILL.md):** 10 arquetipos realistas de alumnado y profesorado para pruebas en paralelo estilo Goldfish con Test de 5 Segundos y filtro TRIZ de contradicciones.
* **[Constitución Técnica y Operativa (`core-rules.md`)](../../.agents/rules/core-rules.md):** Reglas del ciclo de agentes y estándares de calidad visual.
* **[Catálogo Funcional (`FUNCIONES.md`)](../FUNCIONES.md):** Resumen general de módulos y capacidades del simulador.
* **[Informe de Conformidad RGPD y Menores (`INFORME_CONFORMIDAD_RGPD_MARSKET.md`)](../INFORME_CONFORMIDAD_RGPD_MARSKET.md):** Marco jurídico LOPDGDD art. 7, política Zero-PII y medidas técnicas de privacidad escolar.
* **[Protocolo de Pruebas (`PRUEBAS.md`)](../PRUEBAS.md)** y **[Registro de Defectos (`DEFECT_LEDGER.md`)](../DEFECT_LEDGER.md):** Histórico de validación y aseguramiento de calidad.

---

## 2. Especificaciones de Diseño EGM (`docs/designs/`)

Aquí se indexan los documentos de diseño técnico aprobados tras pasar por el flujo `/egm:egm-brainstorm` ➔ `/egm:egm-draft` ➔ `/egm:egm-review` ➔ `/egm:egm-resolve`:

| Fecha | Documento de Diseño | Estado | Resumen / Alcance |
| :--- | :--- | :--- | :--- |
| `2026-11-17` | **[`auditoria_integral_classroom_personas_v2_0_12.md`](./auditoria_integral_classroom_personas_v2_0_12.md)** | `Implementado (v2.0.13–v2.0.16)` | Auditoría integral del Tribunal `@classroom-personas` sobre los 5 roles de alumnado (`Técnico`, `Finanzas`, `Operaciones e IA`, `CEO` y `Marketing`) + Hoja de Ruta `v2.0.13` / `v2.0.14`. |
| `2026-11-18` | **[`mejora_continua_docente_alumnado_v2_0_21_draft.md`](./mejora_continua_docente_alumnado_v2_0_21_draft.md)** | `Aprobado EGM / En 4 Fases (v2.0.21–v2.0.24)` | Plan de mejora continua auditado por los 5 Goldfishes EGM y resuelto con Coordinación: Fase 1 (`v2.0.21` Multi-PC `DOC_12`/`company_state` + UI Alumnado), Fase 2 (`v2.0.22` Llavero `👁️`, Telemetría, Catálogo I+D y Reset Único), Fase 3 (`v2.0.23` Estudio Precios `€` + Contratos In-Situ) y Fase 4 (`v2.0.24` Fase V Gala/Proyector). |
| `2026-11-22` | **[`orbital_report_phase2.md`](./orbital_report_phase2.md)** | `Propuesto (EGM Draft)` | Fase 2 de ORBITAL REPORT y Estudio A3: portada web de 3 niveles con rotación (`Portada`, `Debajo de portada`, `Hemeroteca`) sin Drive, modos opcionales en Pág. 7 (*Quién es quién* mixto Zero-PII) y Pág. 8 (*Más allá del cohete* con hueco `DOC_12`, QR SVG y Launch Library 2 en español), más acceso aislado `VIP-0000` / `0000`. |
