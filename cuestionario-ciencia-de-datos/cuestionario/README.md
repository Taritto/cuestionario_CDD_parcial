# Cuestionario de Ciencia de Datos

Aplicación web estática lista para revisar y publicar. No requiere instalación, cuenta, base de datos ni conexión al Drive para corregir. Las fuentes enlazadas pueden requerir acceso al Drive.

## Abrir

Abrí `index.html` con tu navegador. También puede servirse la carpeta en un servidor HTTP estático. Incluí todos los archivos de esta carpeta en la publicación y usá `index.html` como entrada. No requiere proceso de compilación ni variables secretas.

## Funciones

- Banco inicial de 217 preguntas: 18 históricas y 199 nuevas.
- Opción única, múltiple, verdadero/falso, emparejamiento, numérica y desarrollo con rúbrica.
- Práctica con devolución inmediata, simulacro, parcial 2024, formativa y repaso de errores.
- Selección equilibrada por tema cuando se eligen todos, orden de opciones aleatorio, marcas de revisión y resumen antes de entregar.
- Temporizador con envío automático al vencimiento. El reloj sigue al salir de la pantalla; no se pausa al cerrar una pestaña.
- Guardado local, reanudación, historial de 12 intentos, resultados por tema y copias JSON.
- Importación validada de preguntas/fuentes/notas y exportación del banco completo.

## Archivos

- `index.html`, `styles.css`, `core.js`, `app.js`, `bank.js`: aplicación desplegable.
- `banco.json`: banco legible y portable.
- `banco.schema.json`, `ejemplo-importacion.json`, `FORMATO-JSON.md`: contrato y ejemplos.
- `COBERTURA.md`: índice por tema, modalidad y pregunta.
- `CRITERIOS.md`: límites de cobertura, correcciones y fidelidad a Moodle.

## Datos y actualización

Los datos se guardan en localStorage del navegador. No se sincronizan entre equipos ni se envían a un servidor. El almacenamiento puede estar limitado o deshabilitado; la aplicación lo informa. Exportá banco y progreso para conservarlos.

El borrado de datos del navegador elimina estas copias locales. Cambiar de dominio, puerto o navegador abre otro almacenamiento. Las soluciones están incluidas en los archivos: es una herramienta de estudio, no una plataforma segura de exámenes.

Publicación pendiente de autorización del usuario. El enlace local de previsualización funciona únicamente mientras el servidor de revisión esté activo.
