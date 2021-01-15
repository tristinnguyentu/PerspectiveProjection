var xyCoords = [];
var xyzCoords = [];
var lineTracker, lineTrackerLabel, shapeSelect;
var downloadButton, loadButton, clearButton, hideCoordsButton;
var lineCount = 0;
var sideLength;
var lineInput;
var scaleFactor = 1;
var translateInput = [];
var objectSelect;
var axisSelect;
var scaleCenterInput;
var rotCenterInput;
var lineFileData = [];
var center = []; //center of object
var hideCoords;

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('display', 'block');
    background('black');

    textSize(40);
    textAlign(CENTER);
    fill('white');

    lineTrackerLabel = createElement('p',);
    lineTracker = createElement('p');

    shapeSelect = createSelect();
    shapeSelect.option('house');
    shapeSelect.option('rectangular prism');
    shapeSelect.option('pyramid');
    shapeSelect.selected('house');

    shapeSelect.style('height', '1.4rem');

    loadButton = createButton('Load');
    loadButton.mousePressed(loadShape);

    clearScreen();
    loadShape();

    downloadButton = createButton('Download Input');
    downloadButton.mousePressed(downloadInput);

    hideCoordsButton = createButton('Hide Coordinates');
    hideCoordsButton.mousePressed(toggleCoords);

    clearButton = createButton('Clear');
    clearButton.mousePressed(clearScreen);

    lineInput = createInput().attribute('placeholder', 'x1, y1, z1, x2, y2, z2/');
    drawButton = createButton('Draw');
    drawButton.mousePressed(drawInput);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    projectToScreen();
}
function draw() { 
    projectToScreen();
    handleInput();
    textSize(40);
    textAlign(CENTER);
    fill('white');
    stroke('black');
    text("Perspective Projection", width/2, .075 * height);
    lineTrackerLabel.position(width*.75, 100);
    lineTracker.position(lineTrackerLabel.position().x, lineTrackerLabel.position().y + 20); 
    lineTracker.style('max-width', '30em');

    textSize(16);
    textAlign(LEFT);
    text("Perspective projection refers to a popular visualization technique that allows us to take " +
    "an object defined in the third dimension and map it onto a 2D screen by taking advantage of the fact " + 
    "that objects farther away appear to be smaller than those closer to the viewer (https://en.wikipedia.org/wiki/3D_projection). Using matrices, any " +  
    "transformations applied to the object in 3D space can also be seen and used to change the viewer's " + 
    "perspective (shorturl.at/jyDF0). Although perspective projection provides a relatively realistic view of the object, you " + 
    "cannot accurately judge distances and angles.\n\nNOTE: The origin (0, 0, 0) is located at the top-left " +
    "corner of the screen, and the center of rotation and scale is set to be the center of the screen. " + 
    "Line drawing was implemented using Bresenham's algorithmn, and for best results, stay within the positive z axis! \n\n\n" + 

    "Controls/3D Transformations: \n\n" +
    "Click (Hold) = See 2D Coordinates \n" +
    "Left Arrow = Move Left (Translate Object Right on X-Axis) \n" + 
    "Right Arrow = Move Right (Translate Object Right on X-Axis) \n" +
    "Down Arrow = Move Down (Translate Object Down on Y-Axis) \n" + 
    "Up Arrow = Move Up (Translate Object Up on Y-Axis) \n" + 
    "W = Move Closer (Translate Object Backwards in Z axis) \n" + 
    "S = Move Away (Translate Object Forward in Z axis) \n" + 
    "SHIFT + W = Zoom In (Scale Object Up in X and Y axes) \n" + 
    "SHIFT + S = Zoom Out (Scale Object Down in X and Y axes) \n" + 
    "D = Rotate Right (Z Axis) \n" +
    "A = Rotate Left (Z Axis)",  width/90, .1 * height, 500, 800);

    downloadButton.position(lineTrackerLabel.x + 205, lineTrackerLabel.position().y-2);
    hideCoordsButton.position(downloadButton.x + 115, downloadButton.position().y);
    text("Objects:", width/90, .75 * height);
    shapeSelect.position(width/90, .75 * height + 10);
    loadButton.position(shapeSelect.position().x + 130, shapeSelect.position().y);
    clearButton.position(loadButton.position().x + loadButton.width, loadButton.position().y);
    text("Line Input: ", width/90, .85 * height);
    lineInput.position(width/90, .85 * height + 10);
    text("*Make sure z = 0 in order to draw in 2 dimensions!", width/90, .85 * height + 55);
    drawButton.position(lineInput.position().x + lineInput.width + 5, lineInput.position().y);
    
    if(mouseIsPressed) {
        show2DCoords(mouseX, mouseY);
    }
}
function handleInput() {
    let increment = 4;
    if (keyIsDown(UP_ARROW)) {
        translateInput[1] = increment;
        applyTransformation();
    }
    else if (keyIsDown(DOWN_ARROW)) {
        translateInput[1] = -increment;
        applyTransformation();
    }
    else {
        translateInput[1] = 0;
    }
    if (keyIsDown(LEFT_ARROW)) {
        translateInput[0] = increment;
        applyTransformation();
    }
    else if (keyIsDown(RIGHT_ARROW)) {
        translateInput[0] = -increment;
        applyTransformation();
    }
    else {
        translateInput[0] = 0;
    }
    if (keyIsDown(SHIFT)) {
        if (keyIsDown(87)) {
            scaleFactor = 1.1;
            applyTransformation();
        }
        else if (keyIsDown(83)) {
            scaleFactor = .9;
            applyTransformation();
        }
    }   
    else {
        scaleFactor = 1;
        if (keyIsDown(87)) {
            translateInput[2] = -increment;
            applyTransformation();
        }
        else if (keyIsDown(83)) {
            translateInput[2] = increment;
            applyTransformation();
        }
        else {
            translateInput[2] = 0;
        }
    }
    if (keyIsDown(65)) {
        angle = increment * -1.25;
        axis = 'z';
        applyTransformation();
    }     
    else if (keyIsDown(68)) {
        angle = increment * 1.25;
        axis = 'z';
        applyTransformation();
    }
    else {
        angle = 0;
    }
}
function loadShape() {
    let shape = shapeSelect.value();

    if(shape == 'house') {
        //Front Face
        xyzCoords.push([center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10]); //bottom left to bottom right
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10]); //bottom right to top right
        xyzCoords.push([center[0] + sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10]); //top right to top left
        xyzCoords.push([center[0] - sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10]); //top left to bottom left

        //Back Face
        xyzCoords.push([center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10, center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]); //bottom left to bottom right
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10, center[0] + sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]); //bottom right to top right
        xyzCoords.push([center[0] + sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10, center[0] - sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]); //top right to top left
        xyzCoords.push([center[0] - sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]); //top left to bottom left

        //Connecting the Faces
        xyzCoords.push([center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]);
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]);
        xyzCoords.push([center[0] + sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]);
        xyzCoords.push([center[0] - sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]);

        //Roof
        xyzCoords.push([center[0], center[1] - sideLength, center[2], center[0] - sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10]); 
        xyzCoords.push([center[0], center[1] - sideLength, center[2], center[0] + sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10]); 
        xyzCoords.push([center[0], center[1] - sideLength, center[2], center[0] + sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]); 
        xyzCoords.push([center[0], center[1] - sideLength, center[2], center[0] - sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]); 

        lineCount += 16; 
    }
    else if(shape == 'rectangular prism') {
        //Front Face
        xyzCoords.push([center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10]); //bottom left to bottom right
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10]); //bottom right to top right
        xyzCoords.push([center[0] + sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10]); //top right to top left
        xyzCoords.push([center[0] - sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10]); //top left to bottom left

        //Back Face
        xyzCoords.push([center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10, center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]); //bottom left to bottom right
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10, center[0] + sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]); //bottom right to top right
        xyzCoords.push([center[0] + sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10, center[0] - sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]); //top right to top left
        xyzCoords.push([center[0] - sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]); //top left to bottom left

        //Connecting the Faces
        xyzCoords.push([center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]);
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]);
        xyzCoords.push([center[0] + sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]);
        xyzCoords.push([center[0] - sideLength/2, center[1] - sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] - sideLength/2, center[2] + sideLength/10]);

        lineCount += 12; 
    }
    else if(shape == 'pyramid') {
        //Roof
        xyzCoords.push([center[0], center[1] - sideLength/2, center[2], center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10]); 
        xyzCoords.push([center[0], center[1] - sideLength/2, center[2], center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10]); 
        xyzCoords.push([center[0], center[1] - sideLength/2, center[2], center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]); 
        xyzCoords.push([center[0], center[1] - sideLength/2, center[2], center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]);
        
        //Base
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]);
        xyzCoords.push([center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]);
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] - sideLength/10]); 
        xyzCoords.push([center[0] + sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10, center[0] - sideLength/2, center[1] + sideLength/2, center[2] + sideLength/10]); 

        lineCount += 8;
    }
    projectToScreen();
}
function clearScreen() { //Initialize, Clear Inputs
    background('black');
    lineTracker.html('');
    updateLineCounter(0);
    lineCount = 0;  
    sideLength = 600;
    lineFileData = [];
    xyCoords = [];
    xyzCoords = [];
    
    translateInput = [0, 0, 0];
    center = [width/2, height/2, 175];
    rotCenterInput = center; //could be used to change the center of rotation
    scaleCenterInput = center; //could be used to change the center of scale
    
    axis = 'z'; //could be used to change more axes, although x and y have issues with the clipping plane
    angle = 0;
}
function show2DCoords(x, y) { //draw coordinates for mouse
    if(!(x <= width/5 && y >= loadButton.position().y) && !(x >= .85 * width && y <= .15 * height))
    {
        fill('yellow');
        textSize(16);
        textAlign(CENTER);
        text("(" + floor(x) + ", " + floor(y) + ")", x, y);
    }
}
function show3DCoords(x, y, z, posX, posY) { //draw coordinates for object
    fill('yellow');
    textSize(16);
    textAlign(CENTER);
    text("(" + floor(x) + ", " + floor(y) + ", " + floor(z) + ")", posX, posY);
}
function toggleCoords() {
    hideCoords = !hideCoords;
    if(!hideCoords) {
        hideCoordsButton.html('Hide Coordinates');
    }
    else {
        hideCoordsButton.html('Show Coordinates');
    }
}
function projectToScreen() { //Convert 3D -> 2D
    xyCoords = [];
    lineFileData = [];
    var s = 100; //1/2 screen side
    var d = 20; //distance from the viewpoint to the center of the screen
    
    //Viewport centered at (Vcx, Vcy) that is 2Vsx units wide and 2Vsy units high
    var Vsx = width/5; 
    var Vsy = height/4;
    var Vcx = width/5;
    var Vcy = height/4;

    background('black');
    for(var i = 0; i < lineCount; i++) {
        //Coordinates in the Eye(Camera)-Coordinate System (3D)
        var x0 = parseFloat(xyzCoords[i][0]);
        var y0 = parseFloat(xyzCoords[i][1]);
        var z0 = parseFloat(xyzCoords[i][2])
        var x1 = parseFloat(xyzCoords[i][3]);
        var y1 = parseFloat(xyzCoords[i][4]);
        var z1 = parseFloat(xyzCoords[i][5]);

        lineFileData.push(x0 + ',' + y0 + ',' + z0 + ',' + x1 + ',' + y1 + ',' + z1 + '/');
        
        //Screen coordinates (2D)
        var x_s0 = x0;
        var y_s0 = y0;
        var x_s1 = x1;
        var y_s1 = y1;
        
        if(z0 != 0) {
            x_s0 = ((d * x0)/(s * z0)) * Vsx + Vcx;
            y_s0 = ((d * y0)/(s * z0)) * Vsy + Vcy;
        }
        if(z1 != 0) {
            x_s1 = ((d * x1)/(s * z1)) * Vsx + Vcx;
            y_s1 = ((d * y1)/(s * z1)) * Vsy + Vcy;
        }
        xyCoords.push([round(x_s0), round(y_s0), round(x_s1), round(y_s1)]);

        if(!hideCoords) {
            show3DCoords(x0, y0, z0, round(x_s0), round(y_s0));
            show3DCoords(x1, y1, z1, round(x_s1), round(y_s1));
        }
    }  
    draw2DLines();
}
function applyTransformation() {
    lineFileData = [];
    background('black');
    for(var i = 0; i < lineCount; i++) {
        var x0 = parseFloat(xyzCoords[i][0]);
        var y0 = parseFloat(xyzCoords[i][1]);
        var z0 = parseFloat(xyzCoords[i][2])
        var x1 = parseFloat(xyzCoords[i][3]);
        var y1 = parseFloat(xyzCoords[i][4]);
        var z1 = parseFloat(xyzCoords[i][5]);
        
        var beg_preMatrix = [x0, y0, z0, 1]; 
        var end_preMatrix = [x1, y1, z1, 1]; 
    
        //Transform lines in 3D space
        var beg_postMatrix = mult1x4(beg_preMatrix, getTransformationMatrix());
        var end_postMatrix = mult1x4(end_preMatrix, getTransformationMatrix());
        
        xyzCoords[i][0] = beg_postMatrix[0];
        xyzCoords[i][1] = beg_postMatrix[1];
        xyzCoords[i][2] = beg_postMatrix[2];
        xyzCoords[i][3] = end_postMatrix[0];
        xyzCoords[i][4] = end_postMatrix[1];
        xyzCoords[i][5] = end_postMatrix[2];
    }
    projectToScreen();
}
function downloadInput() {
    saveStrings(lineFileData, 'lines.txt');
}
function getTransformationMatrix() {
    var finalMatrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];

    var t_matrix = basicTranslate(translateInput[0], translateInput[1], translateInput[2]);
    
    var s_matrix = genScale(scaleFactor, scaleFactor, 1, scaleCenterInput[0], scaleCenterInput[1], scaleCenterInput[2]);
    
    var r_matrix = genRotate(axis, angle, rotCenterInput[0], rotCenterInput[1], rotCenterInput[2]);
    
    finalMatrix = mult4x4(r_matrix, mult4x4(t_matrix, s_matrix));
    
    return finalMatrix;
}
//Matrix multiplication helper function (1x4)
function mult1x4(arr1, arr2) { 
    var result = [0, 0, 0, 1];
    var sum = 0;
    for(var i = 0; i < 4; i++) {
        sum = 0;   
        for(var j = 0; j < 4; j++) {    
            sum += arr1[0+j] * arr2[j][i];
        }
        result[i] = sum;
    }
    return result;
}
//Matrix multiplication helper function (4x4)
function mult4x4(arr1, arr2) {
    var result = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            var sum = 0;
            for(var k = 0; k < 4; k++) {
                sum += arr1[i][k] * arr2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}
function basicTranslate(Tx, Ty, Tz) {
    var t_matrix = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [Tx, Ty, Tz, 1],
    ];
    return t_matrix; 
}
function basicScale(Sx, Sy, Sz) {
    var s_matrix = [
        [Sx, 0, 0, 0],
        [0, Sy, 0, 0],
        [0, 0, Sz, 0],
        [0, 0, 0, 1],
    ];
    return s_matrix; 
}
function basicRotate(axis, angle) {
    angleMode(DEGREES);
    var r_matrix = [];
    if (axis == 'z') {
        r_matrix = [
            [cos(angle), sin(angle), 0, 0],
            [-sin(angle), cos(angle), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ];
    }
    else if (axis == 'y') {
        r_matrix = [
            [cos(angle), 0, -sin(angle), 0],
            [0, 1, 0, 0],
            [sin(angle), 0, cos(angle), 0],
            [0, 0, 0, 1],
        ];
    }
    else {
       r_matrix = [
            [1, 0, 0, 0],
            [0, cos(angle), sin(angle), 0],
            [0, -sin(angle), cos(angle), 0],
            [0, 0, 0, 1],
        ]; 
    }
    return r_matrix; 
}
//Generalized scaling based on center of scale
function genScale(Sx, Sy, Sz, Cx, Cy, Cz) {
    var result = mult4x4(basicTranslate(-Cx, -Cy, -Cz), basicScale(Sx, Sy, Sz));
    result = mult4x4(result, basicTranslate(Cx, Cy, Cz));

    return result;
}
//Generalized rotation based on center of rotation
function genRotate(axis, angle, Cx, Cy, Cz) {
    var result = mult4x4(basicTranslate(-Cx, -Cy, -Cz), basicRotate(axis, angle));
    result = mult4x4(result, basicTranslate(Cx, Cy, Cz));

    return result;
}
function updateLineCounter(lineCount) {
    lineTrackerLabel.html('Lines Drawn: ' + lineCount + ' (3D -> 2D) <br>');
}
function printOutput() {
    //Clear old output
    lineTrackerLabel.html(''); 
    lineTracker.html('');

    lineTrackerLabel.html('Lines Drawn: ' + lineCount + ' (3D -> 2D) <br>');
    for(var i = 0; i < lineCount; i++) {
        //Print 3D Coordinates
        lineTracker.html((i + 1) + '. ' + '(' + parseFloat(xyzCoords[i][0].toFixed(2)) + ', ' 
            + parseFloat(xyzCoords[i][1].toFixed(2)) + ', ' + parseFloat(xyzCoords[i][2].toFixed(2)) 
            + ') to (' + parseFloat(xyzCoords[i][3].toFixed(2)) + ', '+ parseFloat(xyzCoords[i][4].toFixed(2)) 
            + ', ' + parseFloat(xyzCoords[i][5].toFixed(2)) + ')' + ' -> ', true);

        //Print 2D Coordinates
        lineTracker.html('(' + parseFloat(xyCoords[i][0].toFixed(2)) + ', ' + parseFloat(xyCoords[i][1].toFixed(2)) + 
            ') to (' + parseFloat(xyCoords[i][2].toFixed(2)) + ', ' + parseFloat(xyCoords[i][3].toFixed(2)) + ')' + '<br>', true);
    }
}
function drawInput() {
    var lines = trim(splitTokens(lineInput.value(), '/'));
    for(var i = 0; i < lines.length; i++){
        var line = splitTokens(lines[i], ',');
        var x0 = parseFloat(line[0]);
        var y0 = parseFloat(line[1]);
        var z0 = parseFloat(line[2]);
        var x1 = parseFloat(line[3]);
        var y1 = parseFloat(line[4]);
        var z1 = parseFloat(line[5]);
        xyzCoords.push([x0, y0, z0, x1, y1, z1]);
        lineCount++;
    }
    projectToScreen();
}
function draw2DLines() { //Draws the 2D lines representing the object
    for(var i = 0; i < lineCount; i++) {
        var x0 = xyCoords[i][0];
        var y0 = xyCoords[i][1];
        var x1 = xyCoords[i][2];
        var y1 = xyCoords[i][3];
        
        stroke('white');
        drawLine(x0,y0,x1,y1);
    }
    printOutput();
}
function drawLine(x0, y0, x1, y1) { //Draws a line using Bresenham's algorithm
    var slope = (y1-y0)/(x1-x0);
    if(abs(slope) <= 1) {  //shallow line
        if(x0 > x1) { //drawn right to left
            brzShallow(x1, y1, x0, y0);          
        }
        else { //drawn left to right
            brzShallow(x0, y0, x1, y1);
        }
    }
    else { //slope greater than 1
        if(y0 > y1) {     
            brzSteep(x1, y1, x0, y0);   
        }
        else { 
            brzSteep(x0, y0, x1, y1); 
        }
    }
}
function brzShallow(x0, y0, x1, y1) {
    var dy = y1-y0;
    var dx = x1-x0;
    
    var slope = dy/dx;
    var E = (2*abs(dy))-abs(dx);
    var inc1 = 2*abs(dy);
    var inc2 = 2*(abs(dy)-abs(dx));
    var y = y0;
    var x = x0;
    
    while(x < abs(x1)) {
        point(x,y);
        if(E < 0) {
            E = E+inc1;
        }   
        else {
            if(slope >= 0) {
                y++;
            }
            else {
                y--;
            }
            E = E+inc2;
        }
        x++;
    }
}
function brzSteep(x0, y0, x1, y1) { 
    var dy = y1-y0;
    var dx = x1-x0;
    
    var E = (2*abs(dx))-abs(dy);
    var inc1 = 2*abs(dx);
    var inc2 = 2*(abs(dx)-abs(dy));
    var y = y0;
    var x = x0;
    var slope = dy/dx; 
    
    while(y < abs(y1)) {
        point(x,y);
        if(E < 0) {
            E = E+inc1;
        }   
        else {
            if(slope >= 0) {
                x++;
            }   
            else {
                x--;
            }
            E = E+inc2;
        }
        y++;
    }
}