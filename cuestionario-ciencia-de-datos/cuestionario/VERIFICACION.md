# Verificación de la entrega

## Banco inicial

217 preguntas, IDs únicos y referencias estructuradas. 18 históricas y 199 nuevas. 90 de opción única, 16 de selección múltiple, 34 verdadero/falso, 26 de emparejamiento, 45 numéricas y 6 de desarrollo. Se organiza en 14 áreas.

La exactitud académica se trabajó contrastando las fuentes y explicitando erratas y ambigüedades; la validación automática de una clave no demuestra por sí sola la verdad académica de esa clave. Los límites de cobertura se documentan en CRITERIOS.md.

## Pruebas de lógica

12 grupos aprobados:

1. Validación del banco inicial y el paquete de ejemplo.
2. Todas las claves producen puntaje máximo; el desarrollo queda pendiente hasta autoevaluarlo.
3. Respuestas vacías producen cero o estado pendiente según el tipo.
4. Crédito parcial, descuento por distractores, selección de todas las opciones e IDs repetidos.
5. Emparejamiento parcial e incompleto.
6. Coma decimal, cero, entradas inválidas y bordes de tolerancia numérica.
7. Rúbricas sin calificación automática del texto.
8. Selección equilibrada por temas, sin preguntas duplicadas.
9. Resultados de métricas contrastados por fórmulas independientes.
10. Rechazo de duplicados, claves incoherentes, referencias inexistentes, puntajes inválidos y URL no HTTPS.
11. Cantidad y claves de las 18 preguntas históricas recuperables.
12. Autoevaluar un intento anterior no sobrescribe resultados de intentos posteriores.

## Pruebas en navegador

- Parcial histórico: respuestas única y múltiple, marca, navegación, resumen y nota parcial.
- Guardado de respuestas y reanudación después de recargar.
- Entrada numérica inválida rechazada; coma decimal correcta aceptada.
- Desarrollo pendiente: nota global retenida; autoevaluación de 3/4 criterios produce 7,50/10.
- Simulacro con plazo real de un minuto: soluciones ocultas y envío automático al vencer.
- Importación del ejemplo de seis modalidades: se agregaron las seis preguntas en la sesión de prueba.
- Emparejamiento: incompleto rechazado al comprobar y respuesta completa corregida.
- Foco después de corregir en el encabezado de devolución; después de marcar, en el botón de marca.
- Capturas de escritorio y móvil; a 390 px, ancho del documento y viewport coinciden sin desborde horizontal general. La navegación superior tiene desplazamiento horizontal intencional.
- Registro de consola consultado: sin errores o advertencias de la aplicación.

## Revisión de interfaz

Detector de Impeccable: sin hallazgos. Revisión independiente: detectó dos problemas de foco y precedencia del progreso; ambos corregidos y verificados. Disposición final de las dos correcciones: resueltas.

## Límites

No se probó un lector de pantalla real ni todos los navegadores/dispositivos. Las URLs de las fuentes conservan las del conector; su disponibilidad para cada visitante depende de los permisos Drive. No se publicó ni se verificó un despliegue remoto.
