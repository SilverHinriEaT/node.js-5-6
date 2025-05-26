const scheduleService = require('../services/scheduleService');
const { formatDate } = require('../services/dateUtils');

exports.getSchedule = async (req, res) => {
  const { team, page = 1, limit = 10 } = req.query;
  const role = req.session.role;
  try {
    const { schedule, totalPages, currentPage, totalGames } = await scheduleService.getSchedule(team, parseInt(page), parseInt(limit));
    const formattedSchedule = schedule.map(game => ({
      ...game,
      date: formatDate(game.date)
    }));
    if (req.accepts('html')) {
      res.render('schedule', { schedule: formattedSchedule, role, team, totalPages, currentPage, totalGames });
    } else {
      res.status(200).json({
        schedule: formattedSchedule,
        pagination: {
          totalPages,
          currentPage,
          totalGames,
          limit: parseInt(limit)
        }
      });
    }
  } catch (error) {
    console.error('Помилка при отриманні розкладу:', error);
    res.status(500).json({ error: 'Помилка сервера при отриманні розкладу.' });
  }
};

exports.createGame = async (req, res) => {
  const { date, team1, team2, result } = req.body;
  if (!date || !team1 || !team2) {
    return res.status(400).json({ error: 'Будь ласка, заповніть усі обов\'язкові поля: Дата, Команда 1, Команда 2.' });
  }

  try {
    const newGame = await scheduleService.createGame({ date, team1, team2, result });
    res.status(201).json({ success: true, game: newGame });
  } catch (error) {
    console.error('Помилка при створенні гри:', error);
    if (error.message === 'Команди не можуть бути однаковими.') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Помилка при створенні гри.' });
  }
};

exports.updateGame = async (req, res) => {
  const { id } = req.params;
  const { date, team1, team2, result } = req.body;
  if (!date || !team1 || !team2) {
    return res.status(400).json({ error: 'Будь ласка, заповніть усі обов\'язкові поля: Дата, Команда 1, Команда 2.' });
  }

  try {
    const updatedGame = await scheduleService.updateGame(id, { date, team1, team2, result });
    res.status(200).json({ success: true, game: updatedGame });
  } catch (error) {
    console.error('Помилка при оновленні гри:', error);
    if (error.message === 'Гру не знайдено.') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Команди не можуть бути однаковими.') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Помилка при оновленні гри.' });
  }
};

exports.deleteGame = async (req, res) => {
  const { id } = req.params;
  try {
    await scheduleService.deleteGame(id);
    res.redirect('/schedule');
  } catch (error) {
    console.error('Помилка при видаленні гри:', error);
    if (error.message === 'Гру не знайдено.') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Помилка при видаленні гри.' });
  }
};

exports.recordGameResult = async (req, res) => {
  const { id } = req.params;
  const { result, winningTeamName } = req.body;
  if (!result) {
    return res.status(400).json({ error: 'Будь ласка, введіть результат.' });
  }

  try {
    const message = await scheduleService.recordGameResult(id, result, winningTeamName);
    res.status(200).json({ success: true, message: message.message });
  } catch (error) {
    console.error('Помилка при записі результату гри:', error);
    if (error.message === 'Гру не знайдено.') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Переможна команда не є учасником цієї гри.') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Помилка при записі результату гри.' });
  }
};

exports.getGameForEdit = async (req, res) => {
  const { id } = req.params;
  const role = req.session.role;

  try {
    const game = await scheduleService.getGameById(id);
    if (!game) {
      return res.status(404).render('error', { message: 'Гру не знайдено.' });
    }

    game.date = formatDate(game.date);

    res.render('editGame', { game, role });
  } catch (error) {
    console.error('Помилка при отриманні гри для редагування:', error);
    res.status(500).render('error', { message: 'Помилка сервера при отриманні гри.' });
  }
};