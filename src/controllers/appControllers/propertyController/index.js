const list = require('./list');
const summary = require('./summary');
const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./delete');
const addVisit = require('./addVisit');
const listVisits = require('./listVisits');

module.exports = {
  list,
  summary,
  create,
  read,
  update,
  delete: remove,
  addVisit,
  listVisits,
};