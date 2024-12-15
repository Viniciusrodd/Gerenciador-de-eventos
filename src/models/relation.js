const sequelize = require('sequelize');
const recordModel = require('./recordModel');
const eventModel = require('./eventModel');


recordModel.hasMany(eventModel, {
    foreignKey: 'userId',
    as: 'events',
    sourceKey: 'id'
});

eventModel.belongsTo(recordModel, {
    foreignKey: 'userId',
    as: 'records',
    targetKey: 'id'
})
