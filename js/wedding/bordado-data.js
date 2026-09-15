// API-shaped content. Instants are UTC; each guest sees their device's local time.
export const bordadoData = {
 schemaVersion: 1, id: 'boda-bordado-demo', locale: 'es-MX',
 branding: { name: 'Cáele.mx', logo: '/assets/branding/logo.svg', url: '/' },
 event: {
  type: 'wedding', headline: 'Nos casamos',
  couple: [{ name: 'Valentina' }, { name: 'Santiago' }],
  quote: 'Contigo, todo encuentra su lugar.',
  startsAt: '2027-11-20T23:00:00Z', timeZone: 'America/Mexico_City',
  schedule: [
   { id: 'ceremony', label: '01 · El sí', title: 'Ceremonia', startsAt: '2027-11-20T23:00:00Z', venue: { name: 'Jardín Los Olivos', address: 'Ciudad de México, México', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jardin+Los+Olivos+Ciudad+de+Mexico' } },
   { id: 'reception', label: '02 · La fiesta', title: 'Celebración', startsAt: '2027-11-21T00:00:00Z', venue: { name: 'Salón del Jardín', address: 'Ciudad de México, México', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Salon+del+Jardin+Ciudad+de+Mexico' } }
  ]
 },
 story: { label: 'Nuestra historia', title: 'Nos elegimos', text: 'Entre tantas historias, elegimos la nuestra.' },
 media: {
  cover: { src: '/assets/wedding/bordado/couple.jpg', alt: 'Una pareja se abraza bajo la luz cálida del atardecer' },
  gallery: [
   { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80', alt: 'Un recuerdo del día de nuestra boda' },
   { src: '/assets/wedding/bordado/couple.jpg', alt: 'Juntos, en nuestro lugar favorito' },
   { src: 'https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&w=600&q=80', alt: 'Los detalles de nuestra celebración' }
  ]
 },
 dressCode: { title: 'Formal', guidelines: ['Vestido largo o midi; traje y camisa.', 'Elige calzado cómodo para disfrutar del jardín.'], note: 'Reservamos el blanco para la novia.' },
 gifts: { message: 'Tu compañía es nuestro mejor regalo.', registries: [{ id: 'liverpool', label: 'Liverpool', url: 'https://mesaderegalos.liverpool.com.mx/' }, { id: 'amazon', label: 'Amazon', url: 'https://www.amazon.com.mx/wedding' }] },
 invitation: { id: 'bordado-guest-demo', maxPasses: 2 },
 rsvp: { deadlineAt: '2027-11-10T23:59:00Z', mode: 'demo' }
};
