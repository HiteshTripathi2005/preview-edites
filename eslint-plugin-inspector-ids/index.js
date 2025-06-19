const addInspectorIds = require('./rules/add-inspector-ids');

module.exports = {
  rules: {
    'add-inspector-ids': addInspectorIds,
  },
  configs: {
    recommended: {
      rules: {
        'inspector-ids/add-inspector-ids': 'error',
      },
    },
  },
};
