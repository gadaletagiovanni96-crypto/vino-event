const Event = require('../models/Event');
const StandType = require('../models/StandType');

async function getEvent() {
  let ev = await Event.findOne();
  if (!ev) {
    ev = await Event.create({
      title: 'Calici & Colline',
      subtitle: 'Festival del vino delle colline pugliesi',
      description: 'Una giornata dedicata ai vini del territorio: degustazioni guidate con i produttori, abbinamenti con prodotti tipici, musica dal vivo al tramonto e masterclass con sommelier. Acquista il biglietto, presentalo all\'ingresso tramite QR code e ricevi il calice ufficiale con 10 gettoni di degustazione.',
      date: new Date('2026-06-20T16:00:00'),
      location: 'Masseria Le Vigne, Locorotondo (BA)',
      program: [
        { time: '16:00', title: 'Apertura cancelli', description: 'Ritiro del calice e dei gettoni' },
        { time: '17:00', title: 'Masterclass: i rossi del Sud', description: 'Con il sommelier Marco Leone' },
        { time: '19:00', title: 'Aperitivo tra i filari', description: 'Prodotti tipici e bollicine' },
        { time: '21:00', title: 'Live music', description: 'Concerto jazz sotto le stelle' },
      ],
      ticketTypes: [
        { name: 'Ingresso Standard', description: 'Calice, 10 gettoni di degustazione', price: 25 },
        { name: 'Ingresso Premium', description: 'Calice, 20 gettoni, masterclass inclusa', price: 45 },
      ],
      maxTickets: 200,
    });
  }
  return ev;
}

async function ensureStands() {
  if (await StandType.countDocuments()) return;
  await StandType.create([
    { name: 'Base', level: 1, price: 150, quantity: 10, visibility: 'Postazione nell\'area laterale, nome nell\'elenco espositori', description: 'Banco 2x2 m' },
    { name: 'Standard', level: 2, price: 350, quantity: 6, visibility: 'Postazione nel percorso principale, logo sul sito e sul programma', description: 'Banco 3x3 m con corrente' },
    { name: 'Premium', level: 3, price: 800, quantity: 3, visibility: 'Postazione all\'ingresso, logo in homepage, citazione sui social e durante gli annunci', description: 'Gazebo 4x4 m con corrente e acqua' },
  ]);
}

function eventView(ev) {
  const o = ev.toObject ? ev.toObject() : ev;
  const available = Math.max(0, o.maxTickets - o.soldTickets);
  return { ...o, available, soldOut: available === 0 };
}

module.exports = { getEvent, ensureStands, eventView };
