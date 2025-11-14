const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 2, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const MAZE_W = maze[0].length;
const MAZE_H = maze.length;

const WALL_SIZE = 20;
const PLAYER_PADDING = 5;
const MOUSE_SENSITIVITY = 0.005;

// Effects
const EFFECT_DURATION = 35000; //35 seconds 
const INITIAL_WALL_HEIGHT = 15;
const FINAL_WALL_HEIGHT = 100;
const INITIAL_PLAYER_SPEED = 0.75;
const FINAL_PLAYER_SPEED = 0.25;
const INITIAL_PLAYER_HEIGHT = 12;
const FINAL_PLAYER_HEIGHT = 5;

// Camera and Player
let startTime;

let camX, camY, camZ;
let camPan, camTilt;

let mazePlayerSpeed = INITIAL_PLAYER_SPEED;
let wallHeight = INITIAL_WALL_HEIGHT;
let playerHeight = INITIAL_PLAYER_HEIGHT;

let isTopDown = false;

function setupMazeScene() {
    //initial pos => start at maze[1][1]
    mazeLevelComplete = false;
    camX = (1 - MAZE_W / 2 + 0.5) * WALL_SIZE;
    camZ = (1 - MAZE_H / 2 + 0.5) * WALL_SIZE;
    camY = (wallHeight / 2) - playerHeight;

    camPan = PI/ 2; //horizontal
    camTilt = 0; //vertical
  
    startTime = millis();
}

function drawMaze() {
    background(0, 0, 0);
  
  //progress
    let elapsedTime = millis() - startTime;
    let effectProgress = constrain(elapsedTime / EFFECT_DURATION, 0, 1);
    
    //speed
    mazePlayerSpeed = lerp(INITIAL_PLAYER_SPEED, FINAL_PLAYER_SPEED, effectProgress);
    //wall height
    wallHeight = lerp(INITIAL_WALL_HEIGHT, FINAL_WALL_HEIGHT, effectProgress)
    //player height
    playerHeight = lerp(INITIAL_PLAYER_HEIGHT, FINAL_PLAYER_HEIGHT, effectProgress);
    //camY
    camY = (wallHeight / 2) - playerHeight;

    if (isTopDown) {
        //top down
        let camDist = 300;
        camera(0, camDist, 0, // eye
               0, 0, 0,      // center
               0, 0, -1);    // up
        ortho(-width / 2, width / 2, -height / 2, height / 2, 0, camDist * 2);
    } else {
      //first person
        perspective(PI / 3.0, width / height, 0.1, 1000);
        
        if (isLocked) {
            handleMouseLook();
            handleMovement();
            noCursor();
        } else {
            cursor(ARROW);
        }

        let lookX = cos(camPan) * cos(camTilt);
        let lookY = sin(camTilt);
        let lookZ = sin(camPan) * cos(camTilt);

        camera(camX, camY, camZ,       // eye
               camX + lookX, camY + lookY, camZ + lookZ, // center
               0, 1, 0);             // up
    }

    //lighting
    ambientLight(100);
    directionalLight(255, 255, 255, -1, -1, -0.5);

    //maze
    drawFloor();
    drawWalls();
    
    if (isTopDown) {
        push();
        translate(camX, -wallHeight / 2 + 1, camZ); // On the floor
        fill(255, 0, 0);
        noStroke();
        sphere(8);
        pop();
    }
}

function drawFloor() {
    push();
    translate(0, wallHeight / 2, 0);
    rotateX(PI / 2);
    noStroke();

    for (let i = 0; i < MAZE_H; i++) {
        for (let j = 0; j < MAZE_W; j++) {
            let tileType = maze[i][j];
            
            //no floor under walls
            if (tileType !== 1) {
                push();

                let x = (j - MAZE_W / 2 + 0.5) * WALL_SIZE;
                let z = (i - MAZE_H / 2 + 0.5) * WALL_SIZE;
                translate(x, z, 0);
                
                //color logic
                if (mazeLevelComplete && tileType == 2) {
                    fill(200, 0, 0); //end tile
                } else {
                    //texture(floorTexture); //default
                    fill(0, 0, 0)
                }
                
                plane(WALL_SIZE, WALL_SIZE);
                pop();
            }
        }
    }
    
    pop();
}

function drawWalls() {
    noStroke();
    texture(wallTexture);

    for (let i = 0; i < MAZE_H; i++) {
        for (let j = 0; j < MAZE_W; j++) {
            if (maze[i][j] === 1) {
            push();
            let x = (j - MAZE_W / 2 + 0.5) * WALL_SIZE;
                let z = (i - MAZE_H / 2 + 0.5) * WALL_SIZE;
            translate(x, 0, z);
                // box(WALL_SIZE, wallHeight, WALL_SIZE);
                    
            // draw4 planes for correct texture mapping
            // Front face
            push();
            translate(0, 0, WALL_SIZE / 2); // Move to front
            plane(WALL_SIZE, wallHeight);
            pop();

            // Back face
            push();
            translate(0, 0, -WALL_SIZE / 2); // Move to back
            rotateY(PI); // Rotate 180
            plane(WALL_SIZE, wallHeight);
            pop();

            // Right face
            push();
            translate(WALL_SIZE / 2, 0, 0); // Move to right
            rotateY(PI / 2); // Rotate 90
            plane(WALL_SIZE, wallHeight);
            pop();

            // Left face
            push();
            translate(-WALL_SIZE / 2, 0, 0); // Move to left
            rotateY(-PI / 2); // Rotate -90
            plane(WALL_SIZE, wallHeight);
            pop();
                        
            pop();
            }
        }
    }
}

//handlers
function handleMouseLook() {
    camPan += movedX * MOUSE_SENSITIVITY;
    camTilt += movedY * MOUSE_SENSITIVITY;
    
    // Constrain vertical look
    camTilt = constrain(camTilt, -PI / 2.1, PI / 2.1);
}

function handleMovement() {
    let fwd = 0;
    let strafe = 0;

    if (keyIsDown(87)) fwd = 1;   // W
    if (keyIsDown(83)) fwd = -1;  // S
    if (keyIsDown(65)) strafe = 1; // A
    if (keyIsDown(68)) strafe = -1;  // D

    // Get camera's forward (look) and right (strafe) vectors on XZ plane
    let lookDirX = cos(camPan);
    let lookDirZ = sin(camPan);
    
    // Calculate total movement vector
    let moveX = (lookDirX * fwd + lookDirZ * strafe) * mazePlayerSpeed;
    let moveZ = (lookDirZ * fwd - lookDirX * strafe) * mazePlayerSpeed;

    //Collision Detection (Slide-on-Wall)
    
    //Try moving in X direction
    let newX = camX + moveX;
    if (!isWall(newX, camZ)) {
        camX = newX; // Move is valid
    }

    //Try moving in Z direction
    let newZ = camZ + moveZ;
    if (!isWall(camX, newZ)) {
        camZ = newZ; // Move is valid
    }

    if (!mazeLevelComplete) {
      checkEndCondition();
    }
}

//collisions
function isWall(worldX, worldZ) {
    //check 4 corners of player padding
    if (checkPoint(worldX - PLAYER_PADDING, worldZ - PLAYER_PADDING)) return true;
    if (checkPoint(worldX + PLAYER_PADDING, worldZ - PLAYER_PADDING)) return true;
    if (checkPoint(worldX - PLAYER_PADDING, worldZ + PLAYER_PADDING)) return true;
    if (checkPoint(worldX + PLAYER_PADDING, worldZ + PLAYER_PADDING)) return true;
    return false;
}

//check maze array
function checkPoint(worldX, worldZ) {
    //coordinates to grid
    let gridX = floor((worldX + (MAZE_W / 2) * WALL_SIZE) / WALL_SIZE);
    let gridZ = floor((worldZ + (MAZE_H / 2) * WALL_SIZE) / WALL_SIZE);

    //check grid bounds
    if (gridX < 0 || gridX >= MAZE_W || gridZ < 0 || gridZ >= MAZE_H) {
        return true;
    }
    //maze
    return maze[gridZ][gridX] === 1;
}

function checkEndCondition () {
    let gridX = floor((camX + (MAZE_W / 2) * WALL_SIZE) / WALL_SIZE);
    let gridZ = floor((camZ + (MAZE_H / 2) * WALL_SIZE) / WALL_SIZE);

    //check bounds
    if (gridX < 0 || gridX >= MAZE_W || gridZ < 0 || gridZ >= MAZE_H) {
        return; // Not in bounds
    }
    
    //end tile
    if (maze[gridZ][gridX] === 2) {
        mazeLevelComplete = true;
        triggerFade('final', 1000, 0, true);
    }
}

function keyPressedMaze(code) {
    //m
    if (code === 77) {
        background(255, 255, 255);
        isTopDown = !isTopDown;
        if (isTopDown) {
            exitPointerLock();
            isLocked = false;
        } else {
            background(0);
            lockPointer();
        }
    //0
    } else if (code === 48) {
        switchToScene('final');
    }
}