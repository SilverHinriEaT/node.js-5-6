const db = require('../db/index');
const { Game, Team } = db;
const { Op } = require('sequelize');

exports.getSchedule = async (teamName, page, limit) => {
  let whereClause = {};
  let offset = (page - 1) * limit;

  if (teamName) {
    const teams = await Team.findAll({
      where: {
        name: {
          [Op.like]: `%${teamName}%`
        }
      },
      attributes: ['id']
    });

    const teamIds = teams.map(team => team.id);

    if (teamIds.length > 0) {
      whereClause = {
        [Op.or]: [
          { team1Id: { [Op.in]: teamIds } },
          { team2Id: { [Op.in]: teamIds } }
        ]
      };
    } else {
      return { schedule: [], totalPages: 0, currentPage: page, totalGames: 0 };
    }
  }

  const { count, rows: games } = await Game.findAndCountAll({
    where: whereClause,
    order: [['date', 'ASC']],
    include: [
      { model: Team, as: 'team1', attributes: ['name'] },
      { model: Team, as: 'team2', attributes: ['name'] }
    ],
    limit: limit,
    offset: offset,
  });

  const totalPages = Math.ceil(count / limit);

  return {
    schedule: games.map(game => ({
      id: game.id,
      date: game.date,
      team1: game.team1.name,
      team2: game.team2.name,
      result: game.result,
    })),
    totalPages,
    currentPage: page,
    totalGames: count,
  };
};

exports.createGame = async (gameData) => {
  const t = await db.sequelize.transaction();
  try {
    const [team1] = await Team.findOrCreate({
      where: { name: gameData.team1 },
      transaction: t,
    });
    const [team2] = await Team.findOrCreate({
      where: { name: gameData.team2 },
      transaction: t,
    });

    if (team1.id === team2.id) {
      throw new Error('Команди не можуть бути однаковими.');
    }

    const newGame = await Game.create({
      date: gameData.date,
      team1Id: team1.id,
      team2Id: team2.id,
      result: gameData.result || null,
    }, { transaction: t });

    await t.commit();
    return {
      id: newGame.id,
      date: newGame.date,
      team1: team1.name,
      team2: team2.name,
      result: newGame.result
    };
  } catch (error) {
    await t.rollback();
    console.error('Помилка при створенні гри:', error.message);
    throw error;
  }
};

exports.updateGame = async (id, updatedGameData) => {
  const t = await db.sequelize.transaction();
  try {
    const game = await Game.findByPk(id, { transaction: t });
    if (!game) {
      throw new Error('Гру не знайдено.');
    }

    const [team1] = await Team.findOrCreate({
      where: { name: updatedGameData.team1 },
      transaction: t,
    });
    const [team2] = await Team.findOrCreate({
      where: { name: updatedGameData.team2 },
      transaction: t,
    });

    if (team1.id === team2.id) {
      throw new Error('Команди не можуть бути однаковими.');
    }

    await game.update({
      date: updatedGameData.date,
      team1Id: team1.id,
      team2Id: team2.id,
      result: updatedGameData.result,
    }, { transaction: t });

    await t.commit();
    return {
      id: game.id,
      date: game.date,
      team1: team1.name,
      team2: team2.name,
      result: game.result
    };
  } catch (error) {
    await t.rollback();
    console.error('Помилка при оновленні гри:', error.message);
    throw error;
  }
};

exports.deleteGame = async (id) => {
  const t = await db.sequelize.transaction();
  try {
    const deletedRows = await Game.destroy({
      where: { id },
      transaction: t,
    });
    if (deletedRows === 0) {
      throw new Error('Гру не знайдено.');
    }
    await t.commit();
    return { message: 'Гру успішно видалено.' };
  } catch (error) {
    await t.rollback();
    console.error('Помилка при видаленні гри:', error.message);
    throw error;
  }
};

exports.recordGameResult = async (gameId, result, winningTeamName = null) => {
  const t = await db.sequelize.transaction();
  try {
    const game = await Game.findByPk(gameId, {
      include: [
        { model: Team, as: 'team1' },
        { model: Team, as: 'team2' }
      ],
      transaction: t
    });

    if (!game) {
      throw new Error('Гру не знайдено.');
    }

    if (winningTeamName) {
      if (winningTeamName !== game.team1.name && winningTeamName !== game.team2.name) {
        throw new Error('Переможна команда не є учасником цієї гри.');
      }
    }

    await game.update({ result: result }, { transaction: t });

    await t.commit();
    return { message: `Результат гри ${gameId} оновлено: ${result}` };
  } catch (error) {
    await t.rollback();
    console.error('Транзакція відкочена при записі результату гри:', error.message);
    throw error;
  }
};

exports.getGameById = async (id) => {
  const game = await Game.findByPk(id, {
    include: [
      { model: Team, as: 'team1', attributes: ['name'] },
      { model: Team, as: 'team2', attributes: ['name'] }
    ]
  });

  if (!game) {
    return null;
  }

  return {
    id: game.id,
    date: game.date,
    team1: game.team1.name,
    team2: game.team2.name,
    result: game.result,
  };
};