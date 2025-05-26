const { Sequelize } = require('sequelize');
const config = require('../config/config');

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'mysql',
    logging: false,
});

const Team = require('../models/team')(sequelize);
const Game = require('../models/game')(sequelize);

Game.belongsTo(Team, { as: 'team1', foreignKey: 'team1Id' });
Game.belongsTo(Team, { as: 'team2', foreignKey: 'team2Id' });
Team.hasMany(Game, { foreignKey: 'team1Id' });
Team.hasMany(Game, { foreignKey: 'team2Id' });


const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Team = Team;
db.Game = Game;

db.sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced');

    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

module.exports = db;