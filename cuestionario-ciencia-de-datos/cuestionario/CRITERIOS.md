# Criterios académicos, correcciones y límites

## Fuentes y alcance

Se recuperaron los 11 archivos de clase/artículo DDS, el resumen de 74 páginas y la evaluación formativa. El parcial de 2024 no contenía texto recuperable: se descargaron y revisaron visualmente sus cinco páginas. El libro de Bonaccorso se identificó como bibliografía adicional; no se leyó íntegramente ni se convirtió su contenido completo en temario obligatorio.

El banco incluye preguntas sobre los contenidos desarrollados disponibles. No constituye garantía de exhaustividad sobre todo lo que puede tomar la cátedra ni de una nota futura. La asignación de 1 punto por pregunta y los tiempos configurables son herramientas de estudio.

## Fidelidad a las evaluaciones

- Parcial 2024: se recuperan sus 10 consignas y claves visibles, con normalización de redacción. Tres preguntas usan selección múltiple con crédito parcial. Las otras son de opción única. Se conservan las claves históricas, incluso donde la redacción requiere una nota crítica.
- Formativa 2026: se recuperan 8 preguntas de opción única y verdadero/falso. Los dos emparejamientos muestran las selecciones del intento marcado incorrecto sin revelar una solución fiable por par; se omiten de la reproducción histórica. Se incluyen emparejamientos nuevos sobre contenidos verificables.
- El estilo visual conserva panel celeste para la pregunta, bloque de estado/puntuación y devolución amarilla. La navegación, guardado, importación y repaso son funciones adicionales de la aplicación.
- Los valores parciales visibles (por ejemplo 2/3 y 1/2) permiten observar crédito positivo. No permiten reconstruir todos los pesos negativos o ajustes ocultos del campus. Se documentan por eso dos políticas de práctica.

## Corrección

Cada pregunta tiene un puntaje máximo `points`. La nota global es 10 × puntos obtenidos / puntos máximos.

| Tipo | Fracción obtenida |
|---|---|
| Única y verdadero/falso | 1 si coincide la opción; de otro modo 0 |
| Múltiple exigente | máx(0, aciertos/correctas − distractores elegidos/distractores totales) |
| Múltiple crédito positivo | aciertos/correctas, sin descuento; seleccionar todo puede dar 1 |
| Emparejamiento | pares correctos / pares totales, también si quedó incompleto |
| Numérica | 1 si valor está dentro de tolerancia absoluta; de otro modo 0 |
| Desarrollo | criterios autoevaluados como cumplidos / total de criterios |

Los desarrollos sin autoevaluar no se califican como correctos. Se informa nota automática por separado y se demora la global hasta completar las rúbricas. Un parcial de práctica no equivale a una corrección docente. Las preguntas sin responder siguen dentro del denominador de su parte; la selección múltiple vacía obtiene 0.

## Erratas y precisiones

| Material | Problema | Criterio usado en el banco |
|---|---|---|
| Resumen p. 69 | Denominador de F1 como producto | F1 = 2PR/(P+R) = 2TP/(2TP+FP+FN). Contraste: [scikit-learn F1](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.f1_score.html). |
| Árboles, Teoría de información: Entropía | Cota con −log2(k) | La cota superior es +log2(k). Se verifica para la uniforme: −Σ(1/k)log2(1/k)=log2(k). |
| PCA pp. 17–20 | Texto que sugiere suma de loadings igual a 1 | Norma euclídea 1: Σφ²=1; no Σφ=1. La fórmula de la propia clase muestra la restricción. |
| Resumen p. 39 | Ajuste decimal descrito como cantidad de decimales | Es escalado x/10^j con max absoluto menor que 1, no redondeo. Fórmula en Preprocesamiento. |
| Resumen p. 36 / Preprocesamiento | Borrar tuplas no introduce sesgo | No es una garantía: depende del mecanismo de ausencia. Ejemplo lógico: si falta ingreso solo en hogares de bajos ingresos, borrarlos altera la población representada. |
| Logística / Resumen pp. 66–67 | Acertar clase equivale a costo cero | Con y=1 y p=0,8, la clase se acierta a umbral 0,5, pero −ln(0,8)>0. El costo cero ocurre en el límite de probabilidad correcta 1. |
| Logística: Máxima verosimilitud | Se afirma supuesto gaussiano en cada predictor | La verosimilitud condicional es Bernoulli para y; no se exige distribución normal a cada x. Contraste: [modelo logístico oficial](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression). |
| Logística: frontera | Uso superpuesto de ≥ y ≤ en cero | Se fija ŷ=1 para p≥0,5; la frontera es la igualdad. La región no es lo mismo que la frontera. |
| Árboles: sobreajuste | Error de train siempre 0 sin corte | No es cierto con entradas idénticas y etiquetas contradictorias. No puede separarse información inexistente. |
| Resumen p. 18 | DDS expandido como Desarrollo Dirigido por el Dominio | En esta materia significa Data Driven Scrum. |
| Resumen pp. 47–48 | Selección del modelo final con test | La selección usa validación; prueba final se reserva para el procedimiento elegido. |
| No supervisado pp. 65–67 | Marcado inicial de ruido en DBSCAN | Es provisional; un no núcleo puede luego incorporarse como borde. minPts cuenta el propio punto. Contraste: [DBSCAN oficial](https://scikit-learn.org/stable/modules/generated/sklearn.cluster.DBSCAN.html). |

## Claves históricas que requieren cuidado

- **Parcial, pregunta 2:** marca difusión comercial/ciudadana, valor ciudadano y transparencia. El contraste de opciones comerciales es ambiguo; no usar la clave como definición general de datos abiertos.
- **Parcial, pregunta 5:** marca dos características de presentación como incorrectas, pero no penaliza en la clave los gestos exagerados. Se conserva el resultado visible y se explicita la ambigüedad.
- **Parcial, pregunta 7:** la respuesta histórica es daily de pie. Es una convención, no una obligación universal que invalide reuniones sentadas.
- **Parcial, pregunta 10:** selecciona pares CSV/XLSX, XLSX/XML y CSV/JSON. Un portal también puede contener imágenes; la clave no prueba lo contrario.
- **Formativa, pregunta 3:** DD/MM/AAAA es el formato del caso; no se universaliza como único estándar correcto.

El simulacro mixto excluye preguntas con `note` para que esas ambigüedades no distorsionen la práctica. Los modos históricos sí las conservan y explican.

## Contenido insuficiente o no desarrollado

- Unidad 3 del resumen, p. 45: solo lista tipos de gráficos, análisis exploratorio y técnicas. Las preguntas generales sobre histogramas, barras, dispersión y comunicación son ampliaciones señaladas, no una reconstrucción de filminas ausentes.
- Minería de texto figura en un índice sin desarrollo. No se inventan técnicas, algoritmos o criterios de evaluación para ese tema.
- Modelos de almacenamiento del resumen p. 44 se señalan como no dados en clase; el ejemplo de esquema estrella se marca como ampliación.
- El artículo DDS contrasta el proceso y las revisiones. No se convierten la bibliografía ni las afirmaciones históricas sobre crecimiento de datos en hechos actuales evaluables.
- El formato nuevo de JSON permite incorporar los materiales que falten, con referencias y preguntas revisadas.

## Uso recomendado

1. Hacé un simulacro sin consultar la clave para diagnosticar.
2. Revisá cada error y explicá por qué descartaste los distractores; volvé a la fuente enlazada.
3. Practicá cálculos sin mirar resultados y desarrollos con rúbrica.
4. Repetí errores en otra sesión y luego un intento mixto. Un acierto por reconocimiento no equivale a poder explicar el concepto.
