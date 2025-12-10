const words = [
  'estrella',
  'luna',
  'montana',
  'oceano', 
  'cometa',
  'puente',
  'biblioteca',
  'bosque',
  'castillo',
  'ciudad',
  'desierto',
  'jardin'
]; 

let room = {
  admin: null,
  state: 'esperando',
  countdown: null,
  remainingSeconds: 0,
  players: [],
  word: null,
  impostorId: null
};

const $roomState = $('#room-state');
const $roomControls = $('#room-controls');
const $startButton = $('#start-game');
const $endButton = $('#end-game');
const $countdown = $('#countdown');
const $assignedWord = $('#assigned-word');
const $playerList = $('#player-list');
const $roleGrid = $('#role-grid');

function updatePlayerList() {
  $playerList.empty();
  room.players.forEach((player) => {
    const badgeClass = player.role === 'impostor' ? 'bg-danger' : 'bg-success';
    const $item = $(
      `<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-light">
        <span>${player.name}</span>
        <span class="badge ${badgeClass} rounded-pill">${player.role || 'jugador'}</span>
      </li>`
    );
    $playerList.append($item);
  });
}

function refreshRoleGrid() {
  $roleGrid.empty();
  room.players.forEach((player) => {
    const label = player.displayWord || '—';
    const card = $(
      `<div class="col-md-4">
        <div class="card p-3 border border-white border-opacity-25">
          <h5 class="mb-1">${player.name}</h5>
          <p class="mb-0 text-truncate">${label}</p>
        </div>
      </div>`
    );
    $roleGrid.append(card);
  });
}

function addPlayer(name) {
  if (room.players.length >= 8) {
    alert('Máximo 8 jugadores en este prototipo.');
    return;
  }
  if (room.players.some((p) => p.name === name)) {
    alert('Ya existe un jugador con ese nombre.');
    return;
  }
  room.players.push({ id: crypto.randomUUID(), name, role: null, displayWord: null });
  updatePlayerList();
  refreshRoleGrid();
  $startButton.prop('disabled', room.players.length < 3);
}

function setRoomState(state) {
  room.state = state;
  $roomState.text(state.replace('-', ' '));
}

function assignRoles() {
  if (!room.players.length) return;
  room.word = words[Math.floor(Math.random() * words.length)];
  room.impostorId = room.players[Math.floor(Math.random() * room.players.length)].id;
  room.players.forEach((player) => {
    if (player.id === room.impostorId) {
      player.role = 'impostor';
      player.displayWord = 'IMPOSTOR';
    } else {
      player.role = 'player';
      player.displayWord = room.word;
    }
  });
  $assignedWord.text(room.word);
  refreshRoleGrid();
  updatePlayerList();
}

function startCountdown(seconds = 8) {
  if (room.countdown) clearInterval(room.countdown);
  room.remainingSeconds = seconds;
  $countdown.text(room.remainingSeconds + ' s');
  setRoomState('cuenta regresiva');
  room.countdown = setInterval(() => {
    room.remainingSeconds -= 1;
    $countdown.text(room.remainingSeconds + ' s');
    if (room.remainingSeconds <= 0) {
      clearInterval(room.countdown);
      room.countdown = null;
      setRoomState('en juego');
      assignRoles();
    }
  }, 1000);
}

function resetRoom() {
  if (room.countdown) {
    clearInterval(room.countdown);
    room.countdown = null;
  }
  room.players.forEach((player) => {
    player.role = null;
    player.displayWord = null;
  });
  room.word = null;
  room.impostorId = null;
  room.remainingSeconds = 0;
  $countdown.text('—');
  $assignedWord.text('—');
  refreshRoleGrid();
  updatePlayerList();
  setRoomState('esperando jugadores');
  $startButton.prop('disabled', room.players.length < 3);
}

$('#admin-form').on('submit', function (event) {
  event.preventDefault();
  const adminName = $('#admin-name').val().trim();
  if (!adminName) return;
  room.admin = adminName;
  $roomControls.removeClass('d-none');
  setRoomState('esperando jugadores');
  $('#admin-form').find('button').text('Sala creada').prop('disabled', true);
});

$('#player-form').on('submit', function (event) {
  event.preventDefault();
  const playerName = $('#player-name').val().trim();
  if (!playerName) return;
  addPlayer(playerName);
  $('#player-name').val('');
});

$startButton.on('click', function () {
  if (room.players.length < 3) {
    alert('Se necesitan al menos 3 jugadores para iniciar.');
    return;
  }
  assignRoles();
  startCountdown(8);
});

$endButton.on('click', function () {
  resetRoom();
});

// Auto-populate dos jugadores de ejemplo
addPlayer('Ana');
addPlayer('Luis');
addPlayer('María');
setRoomState('esperando jugadores');
