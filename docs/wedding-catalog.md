# Invitaciones de boda: datos y replicación

Las cinco plantillas son HTML/CSS/JS estático y cargan sus datos con `fetch`. Servir desde la raíz por HTTP (por ejemplo `python3 -m http.server 8000`); no requieren build ni backend.

## Archivos de contenido

| Plantilla | JSON editable |
| --- | --- |
| Minimalista | `data/invitations/minimalista.json` |
| Editorial | `data/invitations/editorial.json` |
| Solsticio | `data/invitations/solsticio.json` |
| Bordado | `data/invitations/bordado.json` |
| Clásica | `data/invitations/clasica.json` |

Cada archivo contiene un evento completo e independiente. Ninguno hereda nombres, fotos o pases de otra demo. `js/wedding/service.js` es el único cargador; `model.js` valida el contrato antes de renderizar. Un JSON inexistente o inválido produce un error, sin reemplazarlo silenciosamente por otro evento.

## Replicar para un cliente

1. Copiar el JSON del estilo elegido, por ejemplo a `data/invitations/ana-y-luis.json`.
2. Cambiar identificadores, nombres, frases, imágenes, horarios, ubicaciones, vestimenta, regalos y pases dentro de ese archivo. Conservar `schemaVersion: 1`.
3. Copiar el HTML de esa plantilla a la ruta del cliente, conservando sus enlaces a CSS/JS. Cambiar únicamente la fuente de datos en el elemento `body`:

```html
<body data-source="/data/invitations/ana-y-luis.json">
```

Conservar los demás atributos del `body`, en particular `class` y `data-template` cuando estén presentes. No hay que cambiar el código del renderer ni el CSS para personalizar el contenido. Las rutas absolutas asumen publicación en la raíz del dominio; al crear un repositorio por invitación, copiar también los assets, CSS y JS referidos.

## Contrato compartido (schemaVersion 1)

| Campo | Contenido |
| --- | --- |
| `id`, `locale` | Identidad del evento e idioma de formato |
| `branding` | Logo, favicon, nombre, descripción y URL de Cáele |
| `event.couple`, `headline`, `quote` | Nombres, encabezado y frase de portada |
| `event.startsAt` | Instante UTC que usa la portada y el contador |
| `event.timeZone` | Zona del lugar como referencia para preparar el evento; no fuerza la zona del visitante |
| `event.schedule[]` | Momentos con `id` único, `label`, `title`, `startsAt` UTC y `venue` |
| `event.schedule[].venue` | Nombre, dirección, enlace de Maps e imagen opcional |
| `story` | Etiqueta, título y texto de la historia de pareja |
| `media.cover`, `media.gallery[]` | URLs y textos alternativos; `caption` para recuerdos; Solsticio admite `position` y `crop` |
| `dressCode` | Título, reglas, nota e ilustración `{ src, alt }` |
| `gifts` | Mensaje y arreglo de mesas `{ id, label, url }` |
| `invitation` | Identificador de la invitación y `maxPasses` |
| `rsvp` | Fecha límite UTC y modo `demo` |
| `presentation` | Frases y decoración propias del estilo; conservar al copiar el JSON de la plantilla |

Todos los horarios usan ISO 8601 UTC con sufijo `Z`, por ejemplo `2027-11-20T23:00:00Z`. La portada, cada momento del itinerario y el plazo de RSVP se formatean con la zona del dispositivo. El contador resta instantes UTC y se detiene en cero. El itinerario se muestra en el orden del arreglo; las cinco plantillas admiten múltiples lugares.

Los textos de interfaz (por ejemplo «Confirmar asistencia» o «Ver ubicación») y las animaciones pertenecen al código de la plantilla. Los datos y frases del cliente están en el JSON.

## API y RSVP

`data-source` puede apuntar a la respuesta JSON de una API que respete el mismo contrato y permita su lectura desde el sitio. La confirmación sigue siendo simulada y se reinicia al recargar. Para recibir confirmaciones reales hay que implementar `confirmAttendance` en `service.js`, con autorización, límites de pases y plazo validados en el servidor. Un archivo JSON público no sustituye el control de acceso de una API.

## Verificación

`node --experimental-vm-modules tests/bordado.cjs` comprueba las cuatro fuentes, carga de una fuente de cliente, independencia entre eventos, UTC, horarios, pases, archivos de imágenes y sintaxis de módulos.

Las fotos, direcciones y mesas de regalos actuales son de muestra. Revisar los recursos del cliente antes de publicar. El footer y la navegación de catálogo son compartidos por las cuatro plantillas. La revisión visual en navegador queda fuera de esta sesión, según la preferencia del usuario.

## Clásica (v0.3.0)

Clásica extiende el contrato con tema, familias, etiquetas y elementos PNG configurables. Ver [clasica.md](clasica.md) para replicación y pruebas visuales. Su encabezado y footer adaptan los mismos enlaces de catálogo y crédito a la papelería clásica.
