// SIMULAZIONE di pagamento: valida solo il formato dei campi, non addebita nulla
// e conserva esclusivamente le ultime 4 cifre.
function validateCard(card) {
  const err = (m) => Object.assign(new Error(m), { status: 400 });
  if (!card) throw err('Dati carta mancanti');
  const num = String(card.number || '').replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(num)) throw err('Numero di carta non valido');
  if (!String(card.name || '').trim()) throw err('Intestatario mancante');
  const m = /^(\d{2})\/(\d{2})$/.exec(String(card.expiry || ''));
  if (!m || +m[1] < 1 || +m[1] > 12) throw err('Scadenza non valida (MM/AA)');
  const exp = new Date(2000 + +m[2], +m[1], 0, 23, 59, 59);
  if (exp < new Date()) throw err('Carta scaduta');
  if (!/^\d{3,4}$/.test(String(card.cvv || ''))) throw err('CVV non valido');
  return num.slice(-4);
}
module.exports = { validateCard };
