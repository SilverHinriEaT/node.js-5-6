const scheduleService = require('../services/scheduleService');
const { formatDate } = require('../services/dateUtils');

exports.getSchedule = async (req, res) => {
  const { team } = req.query;
  const role = req.session.role;
  try {
    const schedule = await scheduleService.getSchedule(team);
    // Format dates for display
    const formattedSchedule = schedule.map(game => ({
      ...game,
      date: formatDate(game.date)
    }));
    res.render('schedule', { schedule: formattedSchedule, role, team });
  } catch (error) {
    console.error('Помилка при отриманні розкладу:', error);
    res.status(500).send('Помилка сервера при отриманні розкладу.');
  }
};

exports.createGame = async (req, res) => {
  const { date, team1, team2, result } = req.body;
  if (!date || !team1 || !team2) {
    return res.status(400).json({ error: 'Будь ласка, заповніть усі обов\'язкові поля: Дата, Команда 1, Команда 2.' });
  }

  try {
    await scheduleService.createGame({ date, team1, team2, result });
    res.json({ success: true });
  } catch (error) {
    console.error('Помилка при створенні гри:', error);
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
    await scheduleService.updateGame(id, { date, team1, team2, result });
    res.json({ success: true });
  } catch (error) {
    console.error('Помилка при оновленні гри:', error);
    res.status(500).json({ error: error.message || 'Помилка при оновленні гри.' });
  }
};

exports.deleteGame = async (req, res) => {
  const { id } = req.params;
  try {
    await scheduleService.deleteGame(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Помилка при видаленні гри:', error);
    res.status(500).json({ error: error.message || 'Помилка при видаленні гри.' });
  }
};

// New business operation controller method
exports.recordGameResult = async (req, res) => {
  const { id } = req.params;
  const { result, winningTeamName } = req.body;
  if (!result) {
    return res.status(400).json({ error: 'Будь ласка, введіть результат.' });
  }

  try {
    const message = await scheduleService.recordGameResult(id, result, winningTeamName);
    res.json({ success: true, message: message.message });
  } catch (error) {
    console.error('Помилка при записі результату гри:', error);
    res.status(500).json({ error: error.message || 'Помилка при записі результату гри.' });
  }
};