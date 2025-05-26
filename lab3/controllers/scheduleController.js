const scheduleService = require('../services/scheduleService');

exports.getSchedule = async (req, res) => {
  const team = req.query.team;
  const data = await scheduleService.getSchedule(team);
  res.render('schedule', { schedule: data, role: req.session.role });
};

exports.createGame = async (req, res) => {
  const gameData = {
    ...req.body,
    teams: req.body.teams.split(',').map(t => t.trim())
  };
  await scheduleService.createGame(gameData);
  res.redirect('/schedule');
};

exports.updateGame = async (req, res) => {
  const id = req.params.id;
  const gameData = {
    ...req.body,
    teams: req.body.teams.split(',').map(t => t.trim())
  };
  await scheduleService.updateGame(id, gameData);
  res.redirect('/schedule');
};

exports.deleteGame = async (req, res) => {
  const id = req.params.id;
  await scheduleService.deleteGame(id);
  res.redirect('/schedule');
};