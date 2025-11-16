
let mirrorObject = {};
let sceneObjects = [];

let nearbyObject = null; // Stores the object the player is near

let centerScreenX, centerScreenY;
let promptColor, promptTextY;

//zoom
let zoomStage = 0; // 0=idle, 1=delay, 2=moving, 3=zooming
let zoomStartTime = 0;
let playerMoveStartTime = 0;
let playerStartX = 0;
let playerStartY = 0;
let currentZoom = 1.0;
let targetZoom = 3.0; // Zoom in 3x
const ZOOM_MOVE_DURATION = 4000; // 2 seconds to move player

let fadeDelayTimer = 0;

// --- Interactable Object Class ---
class sceneObject {
    constructor(x, y, imgBefore, imgAfter, label, promptTextLine1, promptTextLine2, speechImage, isMirror, isClicked) {
        this.x = x;
        this.y = y;
        this.imgBefore = imgBefore;
        this.imgAfter = imgAfter;
        this.label = label;
        this.promptTextLine1 = promptTextLine1;
        this.promptTextLine2 = promptTextLine2;
        this.speechImage = speechImage;
        this.isMirror = isMirror; // To handle different drawing styles
        this.isClicked = false;

        if (this.isMirror) {
            // Use hardcoded size for the mirror
            this.w = 150;
            this.h = 300;
        } else if (this.imgBefore) {
            // Use image size for clothes
            this.w = this.imgBefore.width;
            this.h = this.imgBefore.height;
        } else {
            // Fallback
            this.w = 150;
            this.h = 100;
        }
    }

    // Draws the object
    draw() {
        push();
        if (this.isMirror) {
            imageMode(CENTER);

            if (zoomStage >= 3) { // After moving, during zoom/fade
                image(this.imgAfter, this.x, this.y, this.w, this.h);
            } else { // Before and during move
                image(this.imgBefore, this.x, this.y, this.w, this.h);
                
                push();
                tint(255, 35);
                image(shadowImg, this.x, this.y + this.h / 2, 200, 100);
                pop();
            }
        } else {
            imageMode(CENTER);

            if (this.isClicked && !this.isMirror) {
                push();
                tint(255, 50);
                image(shadowImg, this.x, this.y + this.h / 2 - 15, 200, 100);
                pop();
                image(this.imgAfter, this.x, this.y);
            } else {
                push();
                tint(255, 50);
                image(shadowImg, this.x, this.y + this.h / 2 - 20, 200, 100);
                pop();
                image(this.imgBefore, this.x, this.y);
            }        
        }
        pop();
    }

    // Checks if the player is near this object
    isNear(player) {
        return (
            player.x < this.x + this.w / 2 &&
            player.x + player.w > this.x - this.w / 2 &&
            player.y < this.y + this.h / 2 &&
            player.y + player.h > this.y - this.h / 2
        );
    }
}

function setupMirrorScene() {
    playerAnimate.frame = 0;
    playerAnimate.dir = 3;
    textAlign(CENTER, CENTER);
    fill(0);

    centerScreenX = width / 2;
    centerScreenY = height / 2;

    player.x = centerScreenX - 200;
    player.y = centerScreenY - 250;
    playerSpeed = 7;
    
    // Reset state
    sceneObjects = [];
    nearbyObject = null;

   //create objects
    sceneObjects.push(new sceneObject(centerScreenX - 500, centerScreenY - 150, clothes1Img, clothes1_noImg, 'Clothes 1', 'Click to try on.', '\nno, They wouldn\'t like this one.', speechBubbleHeartbreak, false));
    sceneObjects.push(new sceneObject(centerScreenX - 700, centerScreenY + 50, clothes2Img, clothes2_noImg, 'Clothes 2', 'Click to try on.\nMaybe you\'ll like this one.', '\nno, no definitely not this one.', speechBubbleThumbsDown, false));
    sceneObjects.push(new sceneObject(centerScreenX - 300, centerScreenY + 300, clothes3Img, clothes3_noImg, 'Clothes 3', 'Click to try on.\nCan\'t you find one good pair.', '\nno. this is still bad.', speechBubbleMad, false));
    sceneObjects.push(new sceneObject(centerScreenX + 600, centerScreenY + 200, clothes4Img, clothes4_noImg, 'Clothes 4', 'Click to try on.\nAnything will do at this point.', '\nNO. it\'s All bad.', speechBubbleMad, false));
    sceneObjects.push(new sceneObject(centerScreenX + 400, centerScreenY - 175, clothes5Img, clothes5_noImg, 'Clothes 5', 'Click to put on.\nJust put this one on.', '... ...', speechBubbleHeartbreak, false));

    //mirror object
    sceneObjects.push(new sceneObject(centerScreenX, 100, mirrorImg, mirror_reflectImg, 'Mirror', null, null, null, true));

    zoomStage = 0;
    currentZoom = 1.0;
}

function drawMirrorScene() {
    if (p5.instance && p5.instance._renderer.isP3D) {
        camera(); 
        ortho();  
        translate(-width / 2, -height / 2, 0); 
    }

    if (mirrorBkgdImg) {
        push();
        imageMode(CORNER);
        bkgdImg = image(mirrorBkgdImg, 0, 0, width, height);
        pop();
    } else {
        background(200, 200, 220);
    }
    
    let now = millis();
    if (zoomStage > 0) {
    
        //3 second delay
        if (zoomStage === 1) {
            //handleMovementMirror();
           if (now - zoomStartTime > 2000) {
                zoomStage = 2;
                playerMoveStartTime = now;
                playerStartX = player.x;
                playerStartY = player.y;

                playerAnimate.isMoving = true;
                playerAnimate.dir = 2; // left
            }
        }
    
        //move player to center
        if (zoomStage === 2) {
            let moveElapsed = now - playerMoveStartTime;
            let moveProgress = constrain(moveElapsed / ZOOM_MOVE_DURATION, 0, 1);
            let targetX = centerScreenX - player.w / 2;
            let targetY = centerScreenY - player.h / 2 - 200;
            
            player.x = lerp(playerStartX, targetX, moveProgress);
            player.y = lerp(playerStartY, targetY, moveProgress);

            if (frameCount % PLAYER_ANIM_SPEED === 0) {
                //console.log(playerAnimate.frame);
                playerAnimate.frame = (playerAnimate.frame + 1) % 4;
            }
            
            if (moveProgress >= 1.0) {
                zoomStage = 3;
                zoomStartTime = now; 
                playerAnimate.isMoving = false;
            }
        }
        
        //zoom in
        if (zoomStage === 3) {
            let zoomElapsed = now - zoomStartTime;
            let zoomProgress = constrain(zoomElapsed / ZOOM_DURATION, 0, 1);
            currentZoom = lerp(1.0, targetZoom, zoomProgress);
            
            playerAnimate.frame = 0; 
            playerAnimate.isMoving = false;
            playerAnimate.dir = 3; 
            

            if (zoomProgress >= 1.0) {
                zoomStage = 4; 
                mirrorLevelComplete = true;
                triggerFade('start', FADE_DURATION, 0, true);
            }
        }

        if (zoomStage === 3 || zoomStage === 4) {
                // Translate to center, scale, translate back
                let zoomCenterX = centerScreenX;
                let zoomCenterY = 100;
                translate(zoomCenterX, zoomCenterY);
                scale(currentZoom);
                translate(-zoomCenterX, -zoomCenterY);
        }
    } else {
        handleMovementMirror();
    }

    for (let obj of sceneObjects) {
        push();
        rectMode(CENTER);
        obj.draw();
        pop();
    }
    
    drawPlayer();

    textFont(font);
    fill(0);

    nearbyObject = null;
    
    if (zoomStage === 0) {
        for (let obj of sceneObjects) {
            if (obj.isNear(player)) {
                nearbyObject = obj; //found nearby object
                //console.log(nearbyObject.label);
                break;
            }
        }

        if (nearbyObject && nearbyObject.label != 'Mirror') {
            let promptDisplayed = "";

            if (nearbyObject.isClicked && nearbyObject.speechImage != null) {
                image(nearbyObject.speechImage, player.x - 50, player.y - 60, 75, 75);
                promptDisplayed = nearbyObject.promptTextLine2;
                promptColor = 'red';
                promptTextY = height - 115;
            } else {
                
                promptDisplayed = nearbyObject.promptTextLine1;
                promptColor = 'black';
                promptTextY = height - 105;

                if (nearbyObject.label == 'Clothes 5' && !checkForClicks()) {
                    promptDisplayed = "You should try the other ones first."
                    promptColor = 'black';
                    promptTextY = height - 105;
                }
            } 
        
            push();
            fill(255, 255, 255, 75);
            rectMode(CENTER);
            rect(width / 2, height - 100, 500, 100, 5);
            fill(promptColor);
            textSize(24);

            text(promptDisplayed, width / 2, promptTextY);
            pop();
        }
    }

    //pop();
  
    // Draw main scene text
    // textSize(32); 
    // text("You are in the Mirror Room.", width / 2, 30);
    // textSize(20);
    // text("Press 'E' to exit to the Main Hub.", width / 2, 60);
}

function checkForClicks() {
    // Check objects at index 0, 1, 2, 3
    for (let i = 0; i < 4; i++) {
        if (!sceneObjects[i].isClicked) {
            return false; // one is NOT active
        }
    }
    return true; // All active
}

function handleMovementMirror() {
    handlePlayerAnimation(playerSpeed); 
}

function mouseClickedMirrorScene() {
    if (nearbyObject != null && zoomStage === 0) {
        if (nearbyObject.label == 'Clothes 5') {
            if (checkForClicks()) {
                nearbyObject.isClicked = true;

                zoomStage = 1;
                zoomStartTime = millis();
            }
        } else {
        nearbyObject.isClicked = true;
        }
    }
}



