/* ============================================================
   utils/hash.js — Simple password hashing using Node crypto
   ============================================================ */
'use strict';
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return check === hash;
}

module.exports = { hashPassword, verifyPassword };
