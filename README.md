# 🏢 HR Tech API - Sistema Inteligente de Recursos Humanos

Este proyecto es el "motor" (backend) de una plataforma moderna diseñada para modernizar los departamentos de Recursos Humanos. No solo gestiona la información de los empleados de forma segura, sino que **actúa como un consultor virtual** gracias a la integración de Inteligencia Artificial de última generación.

### 🌟 Características Principales (Lo que resuelve):

* 🔒 **Seguridad y Control de Accesos:** Sistema de inicio de sesión (Login) donde cada usuario tiene un rol. Un empleado normal no puede ver lo mismo que el CEO o el equipo de HR. *(Técnicamente: Autenticación con JWT y Middleware de Roles).*
* 🧠 **Consultor de IA Integrado (Bilingüe):** Conectado directamente al "cerebro" de Google (Gemini 2.5 Flash). La API es capaz de leer todos los datos de la empresa y generar un reporte instantáneo analizando si los sueldos son justos comparados con el rendimiento de los empleados.
* 🛡️ **Datos a prueba de balas:** Antes de guardar cualquier información, el sistema verifica que no haya errores (como sueldos negativos o correos falsos), garantizando que la base de datos siempre esté limpia. *(Técnicamente: Validación estricta con Zod).*
* 🏗️ **Arquitectura Sólida:** Construido para escalar y no fallar bajo presión, utilizando las herramientas favoritas de la industria actual.

### 🛠️ Stack Tecnológico (Para los curiosos del código):

* **Lenguaje base:** Node.js + TypeScript (Para un código seguro y sin errores sorpresa).
* **Base de Datos:** SQL Server gestionado a través de Prisma ORM (Consultas rápidas y seguras).
* **Inteligencia Artificial:** SDK oficial de Google Generative AI.
* **Arquitectura:** API RESTful escalable.

### 🧠 Integración con el Frontend

El backend funciona como el núcleo lógico del sistema, exponiendo una API RESTful que es consumida por el frontend desarrollado en React.

* 📡 **Comunicación vía HTTP:** Intercambio de datos en formato JSON entre frontend y backend.
* 🔐 **Autenticación Centralizada:** Uso de JWT para validar cada request proveniente del cliente.
* 🧾 **Endpoints Especializados:** Rutas diseñadas para operaciones específicas como gestión de empleados, sueldos y generación de reportes.
* 🧠 **Procesamiento con IA:** El backend recibe solicitudes del frontend, procesa datos empresariales y consulta a Gemini para generar insights inteligentes.
* 🛡️ **Validación y Seguridad:** Toda la información enviada desde el frontend es validada antes de ser procesada o almacenada.

### 🔄 Flujo General del Sistema

```text
Frontend (React) → API REST (Node.js + Express) → Lógica de Negocio → Base de Datos (SQL Server)
                                               → Integración IA (Gemini 2.5)
                                               → Respuesta JSON → Frontend