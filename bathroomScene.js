let playerDist;

let bathroomPeople = [];
let targetSquare = { w: 200, h: 200, padding: 0 }; // Size and padding from corner
let targetSquareX, targetSquareY;
let bottomRightRect = { w: 100, h: 450, padding: 0 };
let middleLeftRect = { w: 200, h: 700, padding: 0 };

const baseWidth = 1080; 
let noiseTimer;

const BPEOPLE_FRAME_WIDTH = 100;
const BPEOPLE_FRAME_HEIGHT = 200;

class Person {
    constructor(xOffsetRatio, yOffset, w, h, speechImg, frameIndex) {
        // Position is relative to center
        this.xOffsetRatio = xOffsetRatio;
        this.w = w;
        this.h = h;
        this.yOffset = yOffset;
        //this.personImg = personImg;
        this.speechImg = speechImg;
        this.frameIndex = frameIndex;

        // Calculated positions
        this.x = 0;
        this.y = 0;

        this.isSpeechOn = false;
    }
    
    // Update position and draw the person
    draw(centerX, centerY, baseWidth) {
        this.x = centerX + (width * this.xOffsetRatio);
        this.y = centerY + this.yOffset;

        let sx = this.frameIndex * BPEOPLE_FRAME_WIDTH;
        let sy = 0; // Only one row

        push();
        image(bathroomPeopleImg, this.x, this.y, this.w, this.h, sx, sy, BPEOPLE_FRAME_WIDTH, BPEOPLE_FRAME_HEIGHT);
        pop();
        
        // push();
        // fill(200, 100, 100); // Red-ish color
        // noStroke();
        // rect(this.x, this.y, this.w, this.h);
        // pop();
    }
}

function setupBathroomScene() {
    textAlign(CENTER, CENTER);

    bathroomLevelComplete = false;

    centerScreenX = width / 2;
    centerScreenY = height / 2;

    playerAnimate.frame = 0;
    playerAnimate.dir = 3;
    
    player.x = width / 2 - player.w / 2;
    player.y = height - player.h - 40;
    playerSpeed = 5;
    
    bathroomPeople = [];
    fadeDelayTimer = 0;
    noiseTimer = 0;;

    bathroomPeople.push(new Person((1 / baseWidth), -100, 100, 200, speechBubble1, 0));
    bathroomPeople.push(new Person((-125 / baseWidth), -300, 100, 200, speechBubble2, 1));
    bathroomPeople.push(new Person((-225 / baseWidth), 50, 100, 200, speechBubble3, 2));
    bathroomPeople.push(new Person((200 / baseWidth), -275, 100, 200, speechBubble4, 3));
    bathroomPeople.push(new Person((225 / baseWidth), 0, 100, 200, speechBubble5, 4));
}

function drawBathroomScene() {
    if (p5.instance && p5.instance._renderer.isP3D) {
        camera(); 
        ortho();  
        translate(-width / 2, -height / 2, 0); 
    }
    
    background(220, 230, 220); 

    if (!bathroomLevelComplete) {
        handleBathroomMovement();
    }
    
    textFont(font);
    textSize(32); 

    // Draw ppl
    const maxDist = 600; // Farthest distance to start showing bubbles
    const minDist = 200; // Closest distance to show all bubbles
    let playerCenterX = player.x + player.w / 2;
    let playerCenterY = player.y + player.h / 2;

    //rect(centerScreenX + 200, centerScreenY - 200, 20, 20);
    
    playerDist = dist(playerCenterX, playerCenterY, centerScreenX + 200, centerScreenY - 200);
    let constrainDist = constrain(playerDist, minDist, maxDist);
    // Map distance to number of bubbles (0-5). 
    // Flipped map: smaller distance = more bubbles.
    let numToShow = map(constrainDist, maxDist, minDist, 0, 5);
    numToShow = floor(numToShow);
    //At maxDist (far), 30% chance to be visible (flickers a lot)
    //At minDist (close), 100% chance to be visible (static)
    let visibilityChance = map(playerDist, maxDist, minDist, 1.0, 0.3);
    visibilityChance = constrain(visibilityChance, 0.3, 1.0);
    // --- End New Logic ---
    for (let i = 0; i < bathroomPeople.length; i++) {
        let person = bathroomPeople[i];
        
        // Draw the person
        person.draw(centerScreenX, centerScreenY, baseWidth);
        
        // Draw speech bubble if game isn't won AND index is less than numToShow
        if (!bathroomLevelComplete && i < numToShow) {
            
            // Re-roll the flicker state only once every 5 frames
            if (frameCount % 75 === 0) {
                if (random() < visibilityChance) {
                    person.isSpeechOn = true;
                } else {
                    person.isSpeechOn = false;
                }
            }
            
            // Draw the bubble based on its stored flicker state
            if (person.isSpeechOn) {
                image(person.speechImg, person.x - person.w / 2 + 15, person.y - 55, 150, 50);
            }
        }
    }

    // push();
    // fill(200, 100, 100); // Red-ish color
    // noStroke();
    // for (let person of bathroomPeople) {
    //     rect(person.x, person.y, person.w, person.h);
    // }
    // pop();
    
    // Draw the top-right square
    // We calculate its position every frame to keep it in the corner
    push();
    fill(0, 100, 200); // Blue
    noStroke();
    targetSquareX = width - targetSquare.w - targetSquare.padding;
    targetSquareY = targetSquare.padding;
    //open toilet
    //rect(targetSquareX, targetSquareY, targetSquare.w, targetSquare.h);
    if (bathroomLevelComplete) {
        image(toiletClosedImg, targetSquareX - 125, targetSquareY);
    } else {
        image(toiletOpenImg, targetSquareX - 125, targetSquareY);
    }
    
    
    //closed toilet
    image(toiletClosedImg, targetSquareX - 125, targetSquareY + targetSquare.h + 20);
    //rect(targetSquareX, targetSquareY +  targetSquare.h + 20, targetSquare.w, targetSquare.h);
    pop();

    push();
    fill(200, 0, 100); // Pink
    noStroke();
    let bottomSqX = width - bottomRightRect.w - bottomRightRect.padding;
    let bottomSqY = height / 2;
    image(toiletsImg, bottomSqX, bottomSqY);
    //rect(bottomSqX, bottomSqY, bottomRightRect.w, bottomRightRect.h);
    pop();

    push();
    fill(200, 200, 100); // Pink
    noStroke();
    let sinkX = middleLeftRect.padding;
    let sinkY = height / 2 - middleLeftRect.h / 2;
    image(sinksImg, sinkX, sinkY);
    //rect(sinkX, sinkY, middleLeftRect.w, middleLeftRect.h);
    pop();

    drawPlayer();

    if (!bathroomLevelComplete) {
        bathroomLevelComplete = checkTargetSquare();
        fadeDelayTimer = millis();
    }

    if (bathroomLevelComplete) {
        playerAnimate.frame = 0; 
        playerAnimate.isMoving = false;
        playerAnimate.dir = 2; 

        if (fadeDelayTimer > 0 && millis() - fadeDelayTimer > FADE_DELAY_DURATION && !isFading) {
            triggerFade('start', 1000, 0, true);
        }
    }
}

function handleBathroomMovement() {
    let centerScreenX = width / 2;
    let centerScreenY = height / 2;
    let playerCenterX = player.x + player.w / 2;
    let playerCenterY = player.y + player.h / 2;
    
    // Calculate distance from center
    let playerDist = dist(playerCenterX, playerCenterY, centerScreenX, centerScreenY);
    
    // Define speed mapping
    const maxSpeedDist = 500; // At this distance (or more), speed is max
    const minSpeedDist = 300;   // At center, speed is min
    const minSpeed = 1;
    const maxSpeed = playerSpeed;
    
    // Map distance to speed
    let currentSpeed = map(playerDist, minSpeedDist, maxSpeedDist, minSpeed, maxSpeed);
    currentSpeed = constrain(currentSpeed, minSpeed, maxSpeed);

    //handleplayermovement
    playerAnimate.isMoving = false;
    let moveX = 0;
    let moveY = 0;

    if (keyIsDown(87)) { // W 
        moveY = -currentSpeed;
        playerAnimate.dir = 3; // Row 4
        playerAnimate.isMoving = true;
    }
    if (keyIsDown(83)) { // S
        moveY = currentSpeed;
        playerAnimate.dir = 0; // Row 1
        playerAnimate.isMoving = true;
    }
        if (keyIsDown(65)) { // A
        moveX = -currentSpeed;
        playerAnimate.dir = 2; // Row 3
         playerAnimate.isMoving = true;
    }
    if (keyIsDown(68)) { // D
        moveX = currentSpeed;
        playerAnimate.dir = 1; // Row 2
        playerAnimate.isMoving = true;
    }

    //check collision before moving
    let newX = player.x + moveX;
    if (!peopleCollisionCheck(newX, player.y)) {
        player.x = newX;
    }

    let newY = player.y + moveY;
    if (!peopleCollisionCheck(player.x, newY)) {
        player.y = newY;
    }

    player.x = constrain(player.x, 0, width - player.w);
    player.y = constrain(player.y, 0, height - player.h);

    if (playerAnimate.isMoving) {
        if (frameCount % PLAYER_ANIM_SPEED === 0) {
            playerAnimate.frame = (playerAnimate.frame + 1) % 4; // 4 frames per animation
        }
    } else {
        playerAnimate.frame = 0;
    }

    //handlePlayerAnimation(currentSpeed);
}

function checkTargetSquare() {
    let squareCenterX = targetSquareX + targetSquare.w / 2;
    let squareCenterY = targetSquareY + targetSquare.h / 2;

    let playerLeft = player.x;
    let playerRight = player.x + player.w;
    let playerTop = player.y;
    let playerBottom = player.y + player.h;

    return (
        squareCenterX > playerLeft &&
        squareCenterX < playerRight &&
        squareCenterY > playerTop &&
        squareCenterY < playerBottom
    );
}

function peopleCollisionCheck(x, y) {
    for (let person of bathroomPeople) {
        if (x < person.x + person.w &&
            x + player.w > person.x &&
            y < person.y + person.h &&
            y + player.h > person.y) {
            return true;
        }
    }
    return false;
}