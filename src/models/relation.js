const sequelize = require('sequelize');
const recordModel = require('./recordModel');
const eventModel = require('./eventModel');


recordModel.hasMany(eventModel, {
    foreignKey: 'userId',
    sourceKey: 'id'
});

eventModel.belongsTo(recordModel, {
    foreignKey: 'userId',
    targetKey: 'id'
})
