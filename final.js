let finalButton = { x: 0, y: 0, w: 200, h: 50 };

function setupFinalScene() {
    textAlign(CENTER, CENTER);
    cursor(ARROW);
    // Position button
    finalButton.x = width / 2 - finalButton.w / 2;
    finalButton.y = height - finalButton.h - 40;
}

function drawFinalScene() {
    if (p5.instance && p5.instance._renderer.isP3D) {
        camera(); 
        ortho(); 
        translate(-width / 2, -height / 2, 0); 
        textFont(font);
    }

    // Draw gif
    if (finalImg && finalImg.width > 0) {
        let gifW = 150;
        let gifH = 300;
        let gifX = width / 2 - gifW / 2;
        let gifY = height / 2 - gifH / 2;
        
        push();
        imageMode(CORNER);
        image(finalImg, gifX, gifY, gifW, gifH);
        pop();

        push();
        fill(255); // White text
        textFont(font);
        textSize(12);
        text("it won't be like this forever.", width / 2, gifY + gifH + 40);
        pop();

    } else {
        push();
        fill(255);
        textFont(font);
        textSize(24);
        text("it won't be like this forever.", width / 2, height / 2 + 40);
        pop();
    }

    // button
    push();
    fill(200, 200, 200, 150);
    stroke(255);
    rect(finalButton.x, finalButton.y, finalButton.w, finalButton.h, 10);
    
    fill(0);
    textFont(font);
    textSize(24);
    text("return", finalButton.x + finalButton.w / 2, finalButton.y + finalButton.h / 2);
    pop();
}

function mouseClickedFinalScene() {
    if (mouseX > finalButton.x &&
        mouseX < finalButton.x + finalButton.w &&
        mouseY > finalButton.y &&
        mouseY < finalButton.y + finalButton.h) {
        
        triggerFade('start', 500, 0, true); // Fade out
    }
}