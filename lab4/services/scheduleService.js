const db = require('../db/index');

async function withTransaction(callback) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    console.log('Transaction committed');
    return result;
  } catch (err) {
    await connection.rollback();
    console.error('Transaction rolled back due to error:', err.message);
    throw err;
  } finally {
    connection.release();
  }
}

exports.getSchedule = async (team) => {
  let sql = 'SELECT * FROM schedule';
  const params = [];

  if (team) {
    sql += ' WHERE team1 = ? OR team2 = ?';
    params.push(team, team);
  }

  sql += ' ORDER BY date';
  const [rows] = await db.execute(sql, params);
  return rows;
};

exports.createGame = async (game) => {
  return withTransaction(async (connection) => {
    const sql = 'INSERT INTO schedule (date, team1, team2, result) VALUES (?, ?, ?, ?)';
    const params = [game.date, game.team1, game.team2, game.result || ''];
    await connection.execute(sql, params);
  });
};

exports.updateGame = async (id, updatedGame) => {
  return withTransaction(async (connection) => {
    const sql = 'UPDATE schedule SET date = ?, team1 = ?, team2 = ?, result = ? WHERE id = ?';
    const params = [updatedGame.date, updatedGame.team1, updatedGame.team2, updatedGame.result, id];
    await connection.execute(sql, params);
  });
};

exports.deleteGame = async (id) => {
  return withTransaction(async (connection) => {
    const sql = 'DELETE FROM schedule WHERE id = ?';
    await connection.execute(sql, [id]);
  });
};