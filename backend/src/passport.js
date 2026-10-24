const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { ACCESS_SECRET, ADMIN_CODE, OPERATOR_CODE } = require('./config');

const ROLES = ['user', 'supplier', 'operator', 'admin'];

// LOGIN: email + password con hash bcrypt
passport.use('local-login', new LocalStrategy({ usernameField: 'email', badRequestMessage: 'Inserisci email e password' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || !(await bcrypt.compare(password, user.password))) return done(null, false, { message: 'Credenziali non valide' });
      done(null, user);
    } catch (e) { done(e); }
  }));

// REGISTRAZIONE: strategia dedicata, valida ruolo e codici d'invito
passport.use('local-register', new LocalStrategy({ usernameField: 'email', passReqToCallback: true, badRequestMessage: 'Compila tutti i campi' },
  async (req, email, password, done) => {
    try {
      const { name, role = 'user', company, inviteCode } = req.body;
      if (!name?.trim()) return done(null, false, { message: 'Nome obbligatorio' });
      if (!/^\S+@\S+\.\S+$/.test(email)) return done(null, false, { message: 'Email non valida' });
      if (password.length < 8) return done(null, false, { message: 'La password deve avere almeno 8 caratteri' });
      if (!ROLES.includes(role)) return done(null, false, { message: 'Ruolo non valido' });
      if (role === 'supplier' && !company?.trim()) return done(null, false, { message: 'Indica il nome dell\'azienda' });
      if (role === 'admin' && inviteCode !== ADMIN_CODE) return done(null, false, { message: 'Codice amministratore errato' });
      if (role === 'operator' && inviteCode !== OPERATOR_CODE) return done(null, false, { message: 'Codice operatore errato' });
      if (await User.findOne({ email: email.toLowerCase().trim() })) return done(null, false, { message: 'Email già registrata' });
      const user = await User.create({
        name: name.trim(), email: email.toLowerCase().trim(), role,
        company: role === 'supplier' ? company.trim() : undefined,
        password: await bcrypt.hash(password, 12),
      });
      done(null, user);
    } catch (e) { done(e); }
  }));

// API protette: access token JWT in header Authorization: Bearer
passport.use('jwt', new JwtStrategy({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: ACCESS_SECRET },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.sub).select('-password -sessions');
      done(null, user || false);
    } catch (e) { done(e); }
  }));

// helper: authenticate che risponde in JSON
const authLocal = (strategy) => (req, res, next) =>
  passport.authenticate(strategy, { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ message: info?.message || 'Richiesta non valida' });
    req.user = user; next();
  })(req, res, next);

module.exports = { passport, authLocal };
