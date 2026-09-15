import { weddingData } from "./data.js";
// Same API schema, independent event content for this demo.
export const solsticioData = {
 ...weddingData,
 id: "solsticio-demo",
 event: {...weddingData.event,
  couple: [{name:"Elena"},{name:"Gabriel"}],
  quote: "Que la luz nos encuentre siempre juntos.",
  startsAt: "2027-06-21T22:00:00Z",
  venue: {...weddingData.event.venue, name:"Capilla del Jardín", address:"San Miguel de Allende, Guanajuato", image:{src:"/assets/wedding/solsticio/chapel.svg",alt:"Ilustración de una capilla entre cipreses"}}
 },
 media: {...weddingData.media, gallery:[
  {src:"/assets/wedding/solsticio/couple-meadow.jpg",alt:"Pareja de muestra abrazada en un prado al atardecer",caption:"Nuestro lugar favorito",position:"50% 35%"},
  {src:"/assets/wedding/solsticio/couple-meadow.jpg",alt:"Detalle de las manos entrelazadas de la misma pareja",caption:"Siempre cerca",position:"65% 100%",crop:{scale:2.8,origin:"65% 100%"}}
 ]},
 dressCode: {...weddingData.dressCode,title:"Formal · Tonos suaves",guidelines:["Vestido largo o midi", "Traje en tonos suaves"],illustration:{src:"/assets/wedding/solsticio/attire.svg",alt:"Dibujo de vestido y traje"}},
 gifts: {...weddingData.gifts,message:"Tu presencia es nuestro mejor regalo."},
 invitation: {id:"solsticio-family",maxPasses:2},
 rsvp: {mode:"demo",deadlineAt:"2027-06-14T22:00:00Z"},
 presentation: {solsticio:{artwork:{border:"/assets/wedding/solsticio/meadow-border.webp"},heroNote:"Algunos amores también son un lugar.",galleryTitle:"Los días contigo",galleryNote:"En los pequeños momentos también vive lo eterno.",venueTitle:"La bendición de nuestra unión",mapsLabel:"Ver ubicación",acceptedTitle:"Tu lugar está reservado.",acceptedMessage:"Nos vemos para celebrar"}}
};
