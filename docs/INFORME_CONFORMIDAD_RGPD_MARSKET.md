# INFORME TÉCNICO-JURÍDICO DE CONFORMIDAD Y ANÁLISIS DE RIESGOS (RGPD / LOPDGDD)

| **Destinatarios** | Equipo Directivo y Delegado de Protección de Datos (DPD) – Colegio Miravalles - El Redín / Fomento |
| :--- | :--- |
| **Objeto** | Evaluación de Privacidad desde el Diseño y Conformidad Normativa de la Plataforma Educativa **MARS-KET 2.0** |
| **Entorno de Producción** | Servidor Dedicado / Hosting Gestionado en **CDMON** (Centros de Datos en España - UE) |
| **Fecha de Emisión** | 25 de octubre de 2026 |
| **Dictamen General** | **FAVORABLE / RIESGO RESIDUAL NULO A DESPRECIABLE** (Modelo Zero-PII Estricto) |

---

## 1. Objeto y Ámbito de Aplicación

El presente informe tiene por objeto evaluar formalmente las garantías técnico-jurídicas implementadas en el ecosistema digital **MARS-KET 2.0** (en adelante, *la Plataforma*), desarrollado para la simulación interdepartamental de gestión aeroespacial y emprendimiento empresarial en el marco curricular de Educación Secundaria Obligatoria y Bachillerato.

El propósito pedagógico de la plataforma es proporcionar un simulador de mercado (pedidos B2B, presupuestos, balances contables y control de lanzamientos físicos) sin someter al alumnado menor de edad a entornos que requieran el tratamiento de datos de carácter personal.

El análisis dictamina la adecuación del sistema a las prescripciones del:
* **Reglamento (UE) 2016/679** del Parlamento Europeo y del Consejo (RGPD).
* **Ley Orgánica 3/2018**, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
* **Ley 34/2002**, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE).
* Criterios y directrices de la **Agencia Española de Protección de Datos (AEPD)** sobre entornos educativos y protección del menor en el ámbito digital.

---

## 2. Fundamentación Jurídica y Principios del RGPD Aplicados

La arquitectura de MARS-KET 2.0 se fundamenta en la premisa jurídica de que **el mejor tratamiento de datos personales es su no existencia**. La plataforma no procesa ni custodia información categorizable como dato personal según la definición del **Art. 4.1 del RGPD**.

### 2.1. Principio de Minimización de Datos al Extremo: Arquitectura Zero-PII (Art. 5.1.c RGPD)
El principio de minimización exige que los datos sean «adecuados, pertinentes y limitados a lo necesario». MARS-KET 2.0 lleva este principio al nivel óptimo:
1. **Inexistencia de Cuentas de Usuario:** La base de datos no contiene tablas de usuarios (`users`, `alumnos`, `estudiantes`, `identities`).
2. **Ausencia de Identificadores Directos:** No se recaba, solicita ni almacena ningún nombre de pila, apellidos, número de matrícula escolar, dirección de correo electrónico corporativo o personal, teléfono, documento de identidad (DNI/NIE) ni fotografías de alumnos.
3. **Persistencia Exclusiva de Entidades Ficticias:** La base de datos relacional y documental únicamente almacena entidades simuladas del proyecto didáctico: empresas (*Astra Dynamics, Pulsar, Zenith Technologies...*), catálogo de suministros sintéticos, transacciones en divisa virtual educativa y estados de prototipos aeroespaciales.

### 2.2. Privacidad desde el Diseño y por Defecto (Art. 25 RGPD)
Conforme al Art. 25.1 del RGPD, el sistema ha sido concebido desde la fase de diseño para impedir estructuralmente la entrada de datos personales al servidor:
* **Autenticación por Seudonimización Ciega (Air-Gap Identificativo):**
  * El acceso del alumnado no se realiza mediante credenciales nominales, sino a través de **roles funcionales simulados** (`CEO`, `TECNICO`, `FINANZAS`, `MARKETING`, `OPERACIONES_IA`) vinculados a una empresa ficticia (`coId`).
  * Los códigos de acceso y claves departamentales son generados y distribuidos por el profesorado de forma manual y analógica en el aula física.
  * **Principio de desconexión lógica:** No existe en toda la infraestructura de la base de datos ningún registro que vincule el rol funcional (`S|astra|TECNICO`) con la identidad civil del estudiante que ocupa dicho puesto. La tabla de correspondencia persona-rol sólo existe en la libreta o control docente del profesor fuera del sistema informático.

### 2.3. Responsabilidad Proactiva (Art. 24 RGPD) y Salvaguardas Técnicas
El responsable del tratamiento debe ser capaz de demostrar que el tratamiento cumple con la normativa. En MARS-KET 2.0, se documentan las siguientes medidas técnicas en código:
* **Sanitización Dinámica de Estado (`sanitizeStateForClient`):** Las claves maestras docentes y secretos criptográficos son despojados mediante funciones nativas de base de datos (`json_remove`) antes de que cualquier payload abandone el servidor hacia el navegador.
* **Aislamiento Perimetral del Repositorio de Datos:** El motor de base de datos reside en un directorio interno (`/data/`) protegido a nivel de servidor web Apache mediante `.htaccess` con directiva estricta `Require all denied`, haciendo inaccesible el archivo físico de base de datos desde internet.
* **Seguridad Criptográfica en Bóveda:** Los identificadores de acceso departamental se procesan con envoltorios de ofuscación criptográfica (`authVault` con formato `VLT_`), impidiendo la lectura en texto plano.

---

## 3. Matriz de Vectores de Exposición y Medidas de Mitigación

A continuación se detalla la matriz de análisis de riesgos sobre los vectores potenciales de exposición de información:

| Vector Potencial de Riesgo | Riesgo Teórico Identificado | Medida Técnica y Organizativa de Mitigación Implementada | Riesgo Residual |
| :--- | :--- | :--- | :---: |
| **Texto Libre en Buzón Unidireccional** (`suggestionsToAlex`) | Un alumno podría escribir voluntariamente su nombre o datos de terceros en una sugerencia. | 1. **Canal Unidireccional:** El buzón no genera conversación ni difusión pública; solo es visible por los coordinadores docentes del proyecto.<br>2. **Módulo de Moderación Activa (`moderation_alerts`):** Detección y filtrado léxico automatizado en el backend.<br>3. **Purga Inmediata:** Posibilidad técnica documentada de vaciado atómico inmediato del array de mensajes en el panel docente sin almacenamiento histórico permanente. | **DESPRECIABLE** |
| **Direcciones IP y Metadatos de Red** | Consideración de la IP como dato personal en supuestos de trazabilidad (Sentencia TJUE Breyer C-582/14). | 1. **Cero Logs en Base de Datos:** Ni `api/index.php` ni el frontend capturan o persisten la variable `$_SERVER['REMOTE_ADDR']`.<br>2. **Telemetría Agregada:** El módulo de telemetría solo incrementa contadores escalares globales (`totalLogins`), sin registrar IPs, marcas de tiempo individuales ni identificadores únicos de cliente.<br>3. Los logs de conexión a nivel de socket TCP/Apache son los básicos de seguridad de infraestructura gestionados por el proveedor (CDMON) en cumplimiento del Art. 32 RGPD (garantía de resiliencia y disponibilidad frente a ataques DDoS). | **NULO** |
| **Intercambio y Entrega de Tareas y Documentos** | Almacenamiento de archivos con autoría personal o metadatos de alumnos en el hosting. | **Arquitectura de Desacoplamiento Externo:** La plataforma no dispone de módulo de carga de ficheros (upload) en el servidor de CDMON. Todos los entregables (`deliverables`) son enlaces externos a documentos custodiados en **Google Workspace corporativo del colegio** (`@colegiomiravalleselredin.com`). La plataforma solo almacena la cadena URI. | **NULO** |
| **Cookies y Rastreo de Navegación** | Incumplimiento del Art. 22.2 de la LSSI-CE por rastreo no consentido de menores. | **Inexistencia de Cookies de Terceros ni Trackers:** No se integra Google Analytics, Meta Pixel, ni redes publicitarias. La persistencia de sesión se gestiona únicamente mediante `localStorage` de HTML5 y cabeceras personalizadas (`X-Marsket-Auth`), con carácter estrictamente técnico y funcional. Exento de consentimiento según Art. 22.2 LSSI. | **NULO** |
| **Ataque de Inyección SQL / XSS** | Alteración indebida de estados o inyección de scripts maliciosos. | 1. Backend implementado mediante consultas preparadas con PDO (`prepare` / `execute`).<br>2. Cabeceras estrictas de seguridad activas: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`.<br>3. Límite máximo de carga fijado en 2 MB (`Payload Too Large` 413) contra saturación de buffer. | **BAJO** |
| **Brecha de Seguridad en el Servidor (Hosting CDMON)** | Exfiltración de la base de datos por un atacante externo. | En el supuesto de una brecha total en el servidor web, **el atacante solo obtendría datos ficticios de empresas simuladas** (kilos de bicarbonato de sodio, presupuestos virtuales de misiones a Marte y textos didácticos). Al no existir datos identificativos de menores, **no existe obligación de notificación a la AEPD ni a los interesados (Arts. 33 y 34 RGPD)** por ausencia total de riesgo para los derechos y libertades de personas físicas. | **NULO** |

---

## 4. Delimitación de Terceros y Encargados de Tratamiento

### 4.1. Proveedor de Infraestructura: 10DENCE HISPAHARD, S.L. (CDMON)
* **Ubicación Geográfica:** Centros de datos de alta seguridad ubicados en territorio español (Barcelona / Girona).
* **Marco de Cumplimiento:** Sujeto 100% a la legislación española y comunitaria de protección de datos.
* **Calificación Jurídica:** Al no albergar MARS-KET 2.0 datos de carácter personal de alumnos ni familias, CDMON actúa como mero proveedor de infraestructura técnica de alojamiento de software y bases de datos lógicas, sin que se produzca una relación de Encargo de Tratamiento en los términos del **Art. 28 del RGPD** respecto a los estudiantes del centro.

### 4.2. Ecosistema de Documentación: Google Workspace for Education
* La edición de memorias, hojas de cálculo de costes y presentaciones orales de los alumnos se desarrolla dentro de las cuentas institucionales del Colegio Miravalles - El Redín.
* Este tratamiento ya se encuentra formalmente amparado bajo el **Contrato Marco institucional de Fomento de Centros de Enseñanza con Google**, contando con sus correspondientes evaluaciones de impacto, autorizaciones de matriculación y salvaguardas DPD vigentes.

---

## 5. Régimen de Cookies y Sociedad de la Información (LSSI-CE)

En cumplimiento del **artículo 22.2 de la Ley 34/2002 (LSSI-CE)** y la Guía de Cookies de la AEPD:
* La plataforma **no utiliza cookies de análisis, publicitarias ni de comportamiento**.
* El sistema emplea exclusivamente almacenamiento web local (`localStorage` de navegador) para guardar el token funcional de la empresa en la sesión activa del alumno.
* Al tratarse de almacenamiento con **finalidad exclusivamente técnica** (necesario para el funcionamiento del servicio expresamente solicitado por el usuario), la plataforma se encuentra legalmente **exenta de la obligación de mostrar un banner de consentimiento de cookies**.

---

## 6. Conclusión y Dictamen para la Dirección y el DPD

A la luz del análisis técnico del código fuente, del esquema relacional de la base de datos y de los flujos de red:

1. La plataforma educativa **MARS-KET 2.0** opera bajo un estándar integral de **Privacidad desde el Diseño (Art. 25 RGPD)** y **Minimización Máxima (Zero-PII)**.
2. El sistema **no recoge, no procesa, no perfila ni almacena datos de carácter personal de menores de edad**, garantizando un riesgo de exposición jurídica prácticamente inexistente ante la Agencia Española de Protección de Datos (AEPD).
3. Su implantación y utilización didáctica en el aula **NO REQUIERE la solicitud de consentimientos informados adicionales a las familias** relativos a esta herramienta, bastando la cobertura curricular del centro y el marco ya establecido para las cuentas corporativas de Google Workspace.

Por todo lo expuesto, se emite **DICTAMEN FAVORABLE INCONDICIONADO** para la continuidad y explotación didáctica ordinaria de MARS-KET 2.0 en el centro educativo.

---
*Documento emitido por la Consultoría y Auditoría de Seguridad de la Información y Protección de Datos.*  
*Certificación técnica de cumplimiento arquitectónico v1.1.07.*
