const { Sequelize } = require('sequelize');
const config = require('../config/config'); // We'll create this config file

const sequelize = new Sequelize(config.database, config.user, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'mysql',
    logging: false, // Set to true to see SQL queries
});

const Team = require('../models/team')(sequelize);
const Game = require('../models/game')(sequelize);

// Define associations
Game.belongsTo(Team, { as: 'team1', foreignKey: 'team1Id' });
Game.belongsTo(Team, { as: 'team2', foreignKey: 'team2Id' });
Team.hasMany(Game, { foreignKey: 'team1Id' });
Team.hasMany(Game, { foreignKey: 'team2Id' });


const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Team = Team;
db.Game = Game;

// Sync models with the database
db.sequelize.sync({ alter: true }) // `alter: true` will update table schemas without dropping data
    .then(() => {
        console.log('Database synced');
        // You might want to seed initial teams here if they don't exist
        // For example:
        // Team.findOrCreate({ where: { name: 'Team A' } });
        // Team.findOrCreate({ where: { name: 'Team B' } });
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });

module.exports = db;