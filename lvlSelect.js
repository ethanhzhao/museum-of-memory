let doors = [];
const doorWidth = 120;
const doorHeight = 180;
const doorPadding = 50;

let doorAnimate = {
    frame: 0,
    speed: 30, //frames to wait before switching
    numFrames: 2
};

const DOOR_FRAME_WIDTH = 80;
const DOOR_FRAME_HEIGHT = 120;

let titleAnimate = {
    frame: 0,
    speed: 10, // Speed of the animation
    state: 'idle', // 'idle', 'playing'
    idleWaitTime: 150,
    idleTimer: 0
};
const TITLE_NUM_FRAMES = 3;
let TITLE_FRAME_WIDTH = 0;
let TITLE_FRAME_HEIGHT = 0;

function setupLevelSelectScene() {
    textFont(font);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    cursor(ARROW);

    centerScreenX = width / 2;
    centerScreenY = height / 2;

    player.x = centerScreenX - player.w / 2;
    player.y = height - player.h - 40;
    playerSpeed = 7;

    playerAnimate.dir = 3;
    playerAnimate.frame = 0;
    
    doors = [];
    
    doors.push({ 
        x: doorPadding, 
        y: centerScreenY - doorWidth / 2, 
        w: doorWidth, 
        h: doorHeight,
        target: 'mirror',
        label: 'Mirror',
        row: 2
    });

    doors.push({ 
        x: centerScreenX - doorWidth / 2, 
        y: doorPadding, 
        w: doorWidth, 
        h: doorHeight,
        target: 'bathroom',
        label: 'Bathroom',
        row: 1
    });
    
    doors.push({ 
        x: width - doorWidth - doorPadding, 
        y: centerScreenY - doorWidth / 2, 
        w: doorWidth, 
        h: doorHeight,
        target: 'maze',
        label: 'Maze',
        row:0
    });

    doorAnimate.frame = 0;

    titleAnimate.frame = 0;
    titleAnimate.state = 'idle';
    titleAnimate.idleTimer = 0;
    if (titleImg && titleImg.width > 0) {
        TITLE_FRAME_WIDTH = titleImg.width / TITLE_NUM_FRAMES;
        TITLE_FRAME_HEIGHT = titleImg.height;
    }
}

function drawStartScene() {
    if (p5.instance && p5.instance._renderer.isP3D) {
        //console.log('start in 3d');
        camera();
        ortho();
        translate(-width / 2, -height / 2, 0);
        textFont(font);
    } else {
        //console.log('start in 2d')
    }

    background(255);
    if (brainImg && brainImg.width > 0) {
        const tileWidth = 1000;
        // Calculate height based on aspect ratio to avoid stretching
        const tileHeight = brainImg.height * (tileWidth / brainImg.width);

        for (let x = 0; x < width; x += tileWidth) {
            for (let y = 0; y < height; y += tileWidth) {
                push();
                tint(255, 50); //white tint with less opacity
                image(brainImg, x, y, tileWidth, tileHeight);
                pop();
            }
        }
    } else {
        background(255);
    }

    if (frameCount % doorAnimate.speed === 0) {
        doorAnimate.frame = (doorAnimate.frame + 1) % doorAnimate.numFrames;
    }

    if (titleAnimate.state === 'idle') {
        titleAnimate.frame = 0;
        titleAnimate.idleTimer++;
        
        // Every 2 seconds, 20% chance to play
        if (titleAnimate.idleTimer > titleAnimate.idleWaitTime) {
            if (random() > 0.80) { // 20% chance
                titleAnimate.state = 'playing';
                titleAnimate.frame = 0;
            }
            titleAnimate.idleTimer = 0;
        }

    } else if (titleAnimate.state === 'playing') {
        // This will play frame 0 -> 1 -> 2
        if (frameCount % titleAnimate.speed === 0) {
            titleAnimate.frame++;
            if (titleAnimate.frame >= TITLE_NUM_FRAMES) {
                // Animation finished
                titleAnimate.frame = 0;
                titleAnimate.state = 'idle';
                titleAnimate.idleTimer = 0;
            }
        }
    }
    handleMovementLvlSelect();
    checkCollisions();

    if (titleImg && titleImg.width > 0) {
        let sx = titleAnimate.frame * TITLE_FRAME_WIDTH;
        let sy = 0; // Only one row
        
        let destW = TITLE_FRAME_WIDTH * 1.25; 
        let destH = TITLE_FRAME_HEIGHT * 1.25;
        let destX = width / 2 - destW / 2;
        let destY = height / 2 - 250; // Positioned above center
        
        image(titleImg, destX, destY, destW, destH, sx, sy, TITLE_FRAME_WIDTH, TITLE_FRAME_HEIGHT);
    } else {
        push();
        translate(width / 2, height / 2 - 50)
        fill(0);
        textSize(32);
        text("Museum of memory", 0, 0);
        pop();
    }

    //console.log('before: ', doors);

    // Draw Doors
    for (let door of doors) {
        //console.log('after: ',doors);
        let sx = doorAnimate.frame * DOOR_FRAME_WIDTH;
        let sy = door.row * DOOR_FRAME_HEIGHT;

        push();
        // image(doorImg, door.x, door.y, door.w, door.h); // <-- OLD

        image(doorImg, door.x, door.y, door.w, door.h, sx, sy, DOOR_FRAME_WIDTH, DOOR_FRAME_HEIGHT);
        pop();
    }

    drawPlayer();
}

function handleMovementLvlSelect() {
    handlePlayerAnimation(playerSpeed);
}

function checkCollisions() {
    // Simple AABB collision check
    for (let door of doors) {
        if (player.x < door.x + door.w &&
            player.x + player.w > door.x &&
            player.y < door.y + door.h &&
            player.y + player.h > door.y) {
            
            // Collision detected!
            switchToScene(door.target);
            break;
        }
    }
}