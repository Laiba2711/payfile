/**
 * Postgres enums can't contain an empty string. Sale.network was '' | 'TRC20'
 * in Mongo; in Prisma it is NONE | TRC20. These helpers preserve the
 * frontend-facing '' for empty so no client code has to change.
 */
const networkToDb = (value) => (value === '' || value === undefined || value === null ? 'NONE' : value);
const networkFromDb = (value) => (value === 'NONE' ? '' : value);

module.exports = { networkToDb, networkFromDb };
