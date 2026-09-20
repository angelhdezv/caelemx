# Clásica · v0.3.0

Ruta: `/catalogo/boda/clasica/`. Invitación estática con carpeta de apertura lateral,
papel marfil, lacre, flores secas y tarjetas ornamentadas. No necesita build ni backend.

La muestra usa datos ficticios: Valeria y Mateo, 22 de mayo de 2027, familias y lugar
inventados. El enlace de ubicación abre el mapa general, sin apuntar al evento de referencia.

## Personalización

Todo el contenido del evento vive en `data/invitations/clasica.json`. Para otro cliente,
copiar el archivo y cambiar `data-source` en el `body` del HTML. El cargador compartido
acepta cualquier fuente HTTP que cumpla el contrato; no se usan parámetros de URL
para cambiar el límite de pases.

| Campo | Qué cambia |
| --- | --- |
| `event.couple` | Nombres; admiten espacios y acentos |
| `event.headline`, `event.quote` | Encabezado y mensaje de la tarjeta |
| `event.startsAt`, `event.schedule` | Fecha UTC, calendario, contador, horarios y ubicaciones |
| `invitation.guestName`, `maxPasses` | Familia invitada y lugares disponibles |
| `rsvp.deadlineAt` | Cierre de la confirmación, en UTC |
| `presentation.clasica.theme.primary` | Color de la carpeta; también deriva el fondo y cambia la miniatura del catálogo |
| `theme.paper`, `ink`, `gold`, `goldLight` | Papel, texto, ornamentos y acentos; formato `#RRGGBB` |
| `presentation.clasica.assets` | PNG de papel, esquinas, anillos y flores con lacre |
| `presentation.clasica.copy` | Etiquetas, botones, estados y mensajes de la interfaz |
| `presentation.clasica.family` | Grupos de padres y padrinos |
| `presentation.clasica.sections` | Activar u ocultar contador, familias, vestimenta, regalos e historia |
| `dressCode`, `gifts`, `story` | Reglas de vestimenta, mesas de regalos y mensaje final |
| `branding` | Marca, favicon, enlace y correo de contacto |

Para probar otra paleta basta con cambiar, por ejemplo, `primary` a `#603649`.
El papel es una textura gris superpuesta: no hay verde incrustado en los PNG.
Las esquinas y anillos usan máscaras PNG y toman el dorado configurado.
El lacre y las flores conservan su material natural; si se necesita otro material,
se puede cambiar su PNG sin tocar componentes.

El calendario se calcula a partir de `event.startsAt` y utiliza la zona del visitante,
igual que los horarios y las otras plantillas. El contador trabaja con el instante UTC.
Las ubicaciones admiten varios momentos en un mismo bloque; los pases van inmediatamente
después de ese bloque. Los textos se insertan como texto, nunca como HTML del JSON.

## Componentes y comportamiento

- `app.js`: carga, tema, metadatos, navegación del catálogo, contador y ciclo de vida.
- `model.js`: validación específica, paleta derivada y calendario puro.
- `view.js` y `dom.js`: componentes de tarjetas, carpeta y detalles.
- `motion.js`: estados `closed → opening → open`, cordón, solapa, repetición y movimiento reducido.
- `rsvp.js`: selector accesible, límites y confirmación mediante el adaptador existente.
- `catalog-preview.js`: miniatura que usa el mismo JSON y los mismos PNG.

El header y las acciones usan la estructura y `invitation-preview.css` de las otras
cuatro demos. El footer usa `js/wedding/footer.js` y `invitation-footer.css`. Ambos
quedan fuera de `#invitation`: están disponibles con la carpeta cerrada o abierta
y conservan los colores y tipografía de Caele.mx cuando cambia la paleta del JSON.
Los textos de navegación se personalizan desde `copy` y la identidad desde `branding`.

La solapa se abre con el sello, con el texto de apertura o con teclado. Los detalles
permanecen ocultos e inertes hasta la apertura. El foco pasa a la invitación. El enlace
para saltar permite abrir al instante. La preferencia de movimiento reducido también
abre al instante. La animación tiene un final alternativo por tiempo para evitar que
una pestaña en segundo plano quede bloqueada.

## Confirmación de muestra

El catálogo conserva `rsvp.mode: "demo"`: seleccionar y confirmar pases muestra el
resultado, sin enviar ni almacenar respuestas. La tarjeta lo indica explícitamente.
No usar un JSON público como control de autorización de invitados. Para recibir
confirmaciones reales se necesita conectar el adaptador `confirmAttendance` y validar
los límites en el destino. Los modos no implementados se rechazan, sin simular un envío.

## Recursos gráficos

Se crearon cuatro PNG con generación de imágenes integrada, basados en la propuesta
visual aprobada. Se conservaron como PNG, con tamaños de web y transparencia en los
elementos recortados. Las fuentes Great Vibes y Cormorant Garamond se sirven localmente;
sus licencias OFL están junto a los archivos WOFF.

| PNG | Dirección gráfica usada |
| --- | --- |
| `seal-flowers.png` | Una rama de nube seca color marfil, tallos finos y lacre circular dorado mate con olivo grabado; vista frontal, fondo transparente, sin tarjeta ni cordón. |
| `corner.png` | Una esquina superior izquierda de filigrana dorada, hojas y curvas de papelería clásica, trazos legibles; PNG transparente para reflejar en cuatro posiciones. |
| `paper-grain.png` | Textura repetible de papel de algodón sin recubrimiento, gris neutro, fibras finas, iluminación uniforme y sin pliegues, para superponer al color configurable. |
| `rings.png` | Dos alianzas entrelazadas y pequeñas ramas de olivo, grabado lineal dorado, frontal y transparente, sin texto ni papel. |

## Verificación

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

`npm` se usa solamente para pruebas; GitHub Pages continúa sirviendo los archivos
estáticos directamente. La prueba de navegador inicia y cierra su propio servidor.
El flujo `.github/workflows/clasica.yml` ejecuta estas comprobaciones y conserva
capturas de 320, 390 y 1440 píxeles, estado cerrado, abierto, pases y cambio de paleta
en el artefacto `clasica-visual-qa`. También comprueba teclado, reapertura, movimiento
reducido, JSON faltante, texto escapado, cero pases y plazo vencido. Compara el header
y footer con las otras cuatro demos y verifica que cambiar la paleta no afecte la
navegación, que los controles sigan disponibles y que se pueda volver al catálogo.

La navegación estática y los mensajes de carga y error sirven de contingencia si el
JSON no existe; al cargar, los datos del JSON actualizan la navegación y la invitación.
