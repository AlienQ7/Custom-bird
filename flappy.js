// Window Setup
let board;
let board_w = 400;
let board_h = 600;
let context;

// Sounds
let slap_sfx = new Audio('slap.wav');
let woosh_sfx = new Audio('woosh.wav');
let score_sfx = new Audio('score.wav');

// Player
let player_w = 200;
let player_h = 100;
let player_x = 80;
let player_y = 150;
let velocity = 0;
let player_img = new Image();

// Pipes
let pipe_w = 79;
let pipe_h = 360;
let pipe_x = 600;
let pipe_y = getRandomInt(30, 280);
let gap = 220;
let p_velocity = -1.2;
let pipe_scored = false;
let pipe_up_img = new Image();
let pipe_down_img = new Image();

// Variable Setup
let score = 0;
let gameStarted = false;

let bg_x_pos = 0;
let ground_x_pos = 0;
let bg_scroll_spd = 0.5;
let ground_scroll_spd = 1;
let bg_width = 400;
let bg_img = new Image();
let ground_img = new Image();

let has_moved = false;

let player = { x: player_x, y: player_y, width: player_w, height: player_h };

window.onload = function() {
    board = document.getElementById("board");
    board.height = board_h;
    board.width = board_w;
    context = board.getContext("2d");

    const fileInput = document.getElementById('fileInput');
    const startButton = document.getElementById('startButton');

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                player_img.src = e.target?.result ?? '';
                player_img.onload = function() {
                    startButton.style.display = 'block';
                    initialDraw();
                };
                player_img.onerror = function() {
                    alert("Error loading the selected image. Using default bird.");
                    loadDefaultImages(true);
                    startButton.style.display = 'block';
                };
            };
            reader.readAsDataURL(file);
        } else {
            loadDefaultImages(true);
            startButton.style.display = 'block';
        }
    });

    startButton.addEventListener('click', function() {
        startButton.style.display = 'none';
        fileInput.style.display = 'none'; // Hide the choose file input
        board.style.display = 'block';
        startGame();
        addGameEventListeners();
    });

    loadDefaultImages(false);
    initialDraw();
};

function loadDefaultImages(shouldStart) {
    player_img.src = "me.jpg"; // Default image
    player_img.onload = function() {
        bg_img.src = "space1.jpg";
        ground_img.src = "floor.jpg";
        pipe_up_img = new Image();
        pipe_up_img.src = "pipe_up.png";
        pipe_down_img = new Image();
        pipe_down_img.src = "pipe_down.png";
        if (shouldStart) {
            const startButton = document.getElementById('startButton');
            startButton.style.display = 'block';
            initialDraw();
        }
    };
    player_img.onerror = function() { alert("Error loading default player image."); };
    bg_img.onerror = function() { alert("Error loading background image."); };
    ground_img.onerror = function() { alert("Error loading ground image."); };
}

function initialDraw() {
    if (context && bg_img.complete && ground_img.complete && player_img.complete) {
        context.drawImage(bg_img, 0, 0, board.width, board.height);
        context.fillStyle = "White";
        context.font = "30px Reg";
        context.textAlign = "center";
        context.fillText("Click 'Start Game'", board.width / 2, board.height / 2);
        context.drawImage(player_img, player.x, player.y, player.width, player.height);
        context.drawImage(ground_img, 0, 536, 400, 64);
        context.drawImage(ground_img, 399, 536, 400, 64);
    } else {
        // Initial message before image loads
        context.fillStyle = "White";
        context.font = "30px Reg";
        context.textAlign = "center";
        context.fillText("Choose an Image Above", board.width / 2, board.height / 3);
    }
}

function addGameEventListeners() {
    document.addEventListener("mousedown", jump);
    document.addEventListener("touchstart", jump);
}

function startGame() {
    if (!gameStarted) {
        has_moved = true;
        requestAnimationFrame(update);
        gameStarted = true;
    }
}

function update() {
    requestAnimationFrame(update);

    bg_x_pos -= bg_scroll_spd;
    ground_x_pos -= ground_scroll_spd;

    if (bg_x_pos <= -bg_width) bg_x_pos = 0;
    if (ground_x_pos <= -bg_width) ground_x_pos = 0;

    if (has_moved) {
        velocity += 0.25;
        player.y += velocity;
        pipe_x += p_velocity;
    }

    if (pipe_x < -pipe_w) pipe_respawn();

    if (
        checkCollision(player.x + 3, player.y + 3, 52, 52, pipe_x, pipe_y - 360, 79, 360) ||
        checkCollision(player.x + 3, player.y + 3, 52, 52, pipe_x, pipe_y + gap, 79, 360)
    ) {
        game_over();
    }

    if (!pipe_scored && player.x > pipe_x) {
        score++;
        pipe_scored = true;
        score_sfx.play();
    }

    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(bg_img, bg_x_pos, 0, 400, 600);
    context.drawImage(bg_img, bg_x_pos + 399, 0, 400, 600);
    context.drawImage(ground_img, ground_x_pos, 536, 400, 64);
    context.drawImage(ground_img, ground_x_pos + 399, 536, 400, 64);
    context.drawImage(player_img, player.x, player.y, player.width, player.height);
    context.drawImage(pipe_down_img, pipe_x, -pipe_h + pipe_y, pipe_w, pipe_h);
    context.drawImage(pipe_up_img, pipe_x, pipe_y + gap, pipe_w, pipe_h);

    if (player.y < -64 || player.y > 536) game_over();

    context.fillStyle = "White";
    context.font = "60px Reg";
    context.fillText(score, 181, 80);
}

function jump() {
    if (has_moved == false) {
        has_moved = true;
    }
    velocity = -6;
    woosh_sfx.currentTime = 0;
    woosh_sfx.play();
}

function game_over() {
    player.x = 172;
    player.y = 300;
    score = 0;
    has_moved = false;
    pipe_reset();
    slap_sfx.play();
}

function pipe_respawn() {
    pipe_x = 400;
    pipe_y = getRandomInt(30, 280);
    pipe_scored = false;
}

function pipe_reset() {
    pipe_x = 600;
    pipe_y = getRandomInt(30, 280);
    pipe_scored = false;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x2 < x1 + w1 && y1 < y2 + h2 && y2 < y1 + h1;
}
