# Cómo ampliar el banco

La aplicación acepta JSON UTF-8, versión 1. Desde **Banco y JSON → Agregar preguntas**, elegí tu archivo. La importación valida el paquete completo antes de cambiar el banco y solo agrega preguntas con IDs nuevos.

El archivo `ejemplo-importacion.json` contiene un ejemplo funcional de cada uno de los seis tipos. Sus consignas son copias didácticas de preguntas existentes: reemplazalas por tu contenido antes de usarlo como ampliación. `banco.schema.json` es el esquema JSON Schema 2020-12; la aplicación añade validaciones de referencias y coherencia que JSON Schema no expresa por sí solo.

## Estructura

```json
{
  "schemaVersion": 1,
  "title": "Material adicional",
  "sources": [
    {"id": "apunte-extra", "title": "Apunte adicional", "url": "https://example.com/apunte"}
  ],
  "topics": [{"id": "tema-extra", "title": "Tema adicional"}],
  "questions": [
    {
      "id": "EXTRA-100",
      "topic": "tema-extra",
      "type": "single",
      "difficulty": "intermedia",
      "origin": "ampliacion",
      "points": 1,
      "prompt": "¿Cuántos clasificadores requiere One-vs-Rest con cuatro clases?",
      "options": [
        {"id": "a", "text": "4"},
        {"id": "b", "text": "6"},
        {"id": "c", "text": "12"}
      ],
      "answer": ["a"],
      "explanation": "Se entrena uno por clase. One-vs-One usaría 4×3/2=6.",
      "references": [{"source": "apunte-extra", "locator": "Sección One-vs-Rest"}]
    }
  ],
  "notes": ["Notas sobre el alcance de este material."]
}
```

La URL example.com es ilustrativa: reemplazala por una referencia real que hayas verificado.

## Campos de cada pregunta

| Campo | Regla |
|---|---|
| id | Único y estable. Letras ASCII, números, punto, guion o guion bajo; empezar con letra o número; máximo 100 caracteres. No usar constructor, prototype ni __proto__. |
| topic | ID de un tema incluido en `topics` del paquete. |
| type | `single`, `multiple`, `truefalse`, `matching`, `numeric` o `essay`. |
| difficulty | Texto de 1 a 60 caracteres. Metadato de autoría; no determina la nota ni filtra intentos en esta versión. |
| origin | `historica`: recuperada de evaluación; `nueva`: nueva en modalidad Moodle observada; `ampliacion`: entrenamiento adicional. |
| points | Número mayor que 0 y hasta 100. La nota pondera por este valor. |
| prompt | Consigna autocontenida; hasta 12.000 caracteres. Explicitar unidades, convención y datos necesarios. |
| explanation | Fundamento de la solución; hasta 12.000 caracteres. Explicar también el error conceptual que se quiere evitar. |
| references | Lista no vacía de objetos `source` (ID) y `locator` (página/sección/pregunta). |
| note | Opcional. Aclaración sobre ambigüedad o límite de fuente. Los simulacros excluyen preguntas con este campo. |

## Campos específicos

- **single:** `options` con 2 a 30 objetos `id`/`text`; `answer` lista exactamente un ID correcto.
- **multiple:** misma lista; `answer` contiene todos los IDs correctos, sin duplicados. Debe haber por lo menos un distractor. El orden visual de las opciones no determina la respuesta.
- **truefalse:** exactamente dos opciones con IDs `true` y `false`; `answer` incluye solo el ID correcto.
- **matching:** `pairs` contiene 2 a 30 objetos con `id`, `left` y `right`. Los textos `right` deben ser distintos. La correspondencia correcta es la que figura en cada objeto; no requiere `answer`. El selector usa el ID del par al que pertenece la definición elegida.
- **numeric:** `answer` es un número JSON (punto decimal), y `tolerance` un número no negativo que define tolerancia absoluta. El formulario de respuesta acepta coma o punto. No se interpretan unidades, porcentajes ni separadores de miles.
- **essay:** `rubric` lista de 1 a 20 criterios. Se califican manualmente por autoevaluación, a partes iguales. No requiere `answer` ni simula evaluación automática del texto.

## Integridad e importación

1. Cada ID de pregunta debe ser nuevo: un ID ya existente rechaza el paquete. No se sobreescriben preguntas desde el importador.
2. Incluí en el paquete todos los temas y fuentes usados por sus preguntas. Podés copiar los que ya existen, conservando exactamente sus IDs, títulos y URLs.
3. Un tema o fuente existente con el mismo ID pero otro contenido provoca un conflicto. Para contenido nuevo usá otro ID.
4. Las URLs de fuentes deben ser HTTPS. Se presentan como enlaces; no se ejecutan como código. Todo el texto se muestra como texto, sin HTML.
5. Tamaño máximo de importación: 8 MB y 5.000 preguntas en el banco resultante. Si falla, no se incorpora ninguna pregunta.
6. El banco importado vive en el navegador. Exportalo para conservarlo o trasladarlo. En una actualización del sitio no se sincroniza automáticamente con otros dispositivos.
7. Para cambiar una pregunta del banco inicial en una nueva publicación, editá `banco.json`, validalo y regenerá `bank.js` como `window.INITIAL_BANK = <objeto JSON>;`. `bank.js` se carga sin depender de una petición de archivos JSON, por lo que también funciona abriendo `index.html` directamente. Un navegador que ya tiene un banco importado conserva su copia local.

## Agregar información antes de escribir preguntas

Podés registrar un nuevo documento en `sources` y observaciones en `notes`, aunque el paquete aún no tenga preguntas. La app incorpora fuentes/notas y no transforma automáticamente un PDF o un apunte en preguntas. Las preguntas nuevas deben revisarse antes de importarlas.

## Progreso y resultados

El JSON del banco es distinto del JSON de progreso. **Mis intentos → Exportar progreso** guarda historial, respuestas y sesión; restaurarlo requiere confirmación y reemplaza el progreso local, conservando el banco. Se retienen hasta 12 intentos. **Descargar resultado** exporta un intento individual para revisión, no es un archivo de restauración.

La app valida estructura y consistencia; no verifica si una nueva respuesta es académicamente correcta. Contrastá solución, distractores y fuente antes de incorporar material.
