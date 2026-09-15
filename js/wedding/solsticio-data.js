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
  {src:"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85",alt:"Elena y Gabriel en un prado iluminado",caption:"Nuestro lugar favorito",position:"50% 42%"},
  {src:"https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85",alt:"Manos entrelazadas de Elena y Gabriel",caption:"Siempre cerca",position:"50% 35%",detail:true}
 ]},
 dressCode: {...weddingData.dressCode,title:"Formal · Tonos suaves",guidelines:["Vestido largo o midi", "Traje en tonos suaves"],illustration:{src:"/assets/wedding/solsticio/attire.svg",alt:"Dibujo de vestido y traje"}},
 gifts: {...weddingData.gifts,message:"Tu presencia es nuestro mejor regalo."},
 invitation: {id:"solsticio-family",maxPasses:2},
 rsvp: {mode:"demo",deadlineAt:"2027-06-14T22:00:00Z"},
 presentation: {solsticio:{galleryTitle:"Los días contigo",galleryNote:"En los pequeños momentos también vive lo eterno.",venueTitle:"La bendición de nuestra unión",mapsLabel:"Ver ubicación",acceptedTitle:"Tu lugar está reservado.",acceptedMessage:"Nos vemos para celebrar"}}
};
