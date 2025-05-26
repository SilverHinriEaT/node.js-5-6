const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '../data/schedule.json');

async function loadSchedule() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveSchedule(data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

exports.getSchedule = async (team) => {
  const schedule = await loadSchedule();
  if (team) {
    return schedule.filter(game => game.teams.includes(team));
  }
  return schedule;
};

exports.createGame = async (game) => {
  const schedule = await loadSchedule();
  game.id = Date.now().toString();
  schedule.push(game);
  await saveSchedule(schedule);
};

exports.updateGame = async (id, updatedGame) => {
  let schedule = await loadSchedule();
  schedule = schedule.map(game => game.id === id ? { ...game, ...updatedGame } : game);
  await saveSchedule(schedule);
};

exports.deleteGame = async (id) => {
  let schedule = await loadSchedule();
  schedule = schedule.filter(game => game.id !== id);
  await saveSchedule(schedule);
};