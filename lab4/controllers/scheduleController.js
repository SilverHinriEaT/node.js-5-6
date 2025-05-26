const scheduleService = require('../services/scheduleService');
const dateUtils = require('../services/dateUtils');

function isValidDate(dateString) {
  const year = dateString.split('-')[0];
  if (year.length > 4) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

exports.getSchedule = async (req, res) => {
  const data = await scheduleService.getSchedule(req.query.team);
  res.render('schedule', {
    schedule: data,
    role: req.session.role,
    formatDate: dateUtils.formatDate
  });
};

exports.createGame = async (req, res) => {
  const { date, teams, result } = req.body;

  // Validate date format and year length
  if (!date || !isValidDate(date)) {
    return res.json({ error: 'Невірний формат дати або рік має більше 4 цифр' });
  }

  const splitTeams = teams.split(',').map(t => t.trim());
  if (splitTeams.length !== 2) {
    return res.json({ error: 'Формат команд має бути "Команда1, Команда2"' });
  }

  await scheduleService.createGame({
    date,
    team1: splitTeams[0],
    team2: splitTeams[1],
    result: result || 'Н/Д'
  });
  res.redirect('/schedule');
};

exports.updateGame = async (req, res) => {
  if (!req.body.date || !isValidDate(req.body.date)) {
    return res.json({ error: 'Невірний формат дати або рік має більше 4 цифр' });
  }

  await scheduleService.updateGame(req.params.id, {
    date: req.body.date,
    team1: req.body.team1,
    team2: req.body.team2,
    result: req.body.result
  });
  res.json({ success: true });
};

exports.deleteGame = async (req, res) => {
  await scheduleService.deleteGame(req.params.id);
  res.redirect('/schedule');
};
