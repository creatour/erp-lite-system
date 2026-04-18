const jwt = require('jsonwebtoken')

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization || ''
  if (!authHeader || typeof authHeader !== 'string') {
    return null
  }
  const parts = authHeader.split(' ')
  return parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : null
}

exports.requireAuth = (req, res, next) => {
  const token = getTokenFromHeader(req)
  if (!token) {
    return res.status(401).json({ error: 'Authorization token missing' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    return next()
  } catch (error) {
    console.error('JWT verification failed:', error.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

exports.requireAdmin = (req, res, next) => {
  const role = req.user?.role ? String(req.user.role).toLowerCase() : null
  if (!req.user || role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  return next()
}
