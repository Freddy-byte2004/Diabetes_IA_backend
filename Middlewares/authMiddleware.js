const authService = require('../Services/authService');

module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Token malformado' });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const decoded = authService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(500).json({ message: 'Error al verificar token', error: err.message });
  }
};
