// Bake-off #2 -- Seleção em Interfaces Densas
// IPM 2023-24, Período 3
// Entrega: até às 23h59, dois dias úteis antes do sexto lab (via Fenix)
// Bake-off: durante os laboratórios da semana de 18 de Março

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER = 59;      // Add your group number here as an integer (e.g., 2, 3)
const RECORD_TO_FIREBASE = true;  // Set to 'true' to record user results to Firebase

// Pixel density and setup variables (DO NOT CHANGE!)
let PPI, PPCM;
const NUM_OF_TRIALS = 12;     // The numbers of trials (i.e., target selections) to be completed
let continue_button;
let legendas;                       // The item list from the "legendas" CSV

// Metrics (DO NOT CHANGE!)
let testStartTime, testEndTime;     // time between the start and end of one attempt (8 trials)
let hits = 0;      // number of successful selections
let misses = 0;      // number of missed selections (used to calculate accuracy)
let database;                       // Firebase DB  

// Study control parameters (DO NOT CHANGE!)
let draw_targets = false;  // used to control what to show in draw()
let trials;                         // contains the order of targets that activate in the test
let current_trial = 0;      // the current trial number (indexes into trials array above)
let attempt = 0;      // users complete each test twice to account for practice (attemps 0 and 1)

let click_sound;                    // the sound of a click
let image1;
// Target list and layout variables
let targets = [];
const GRID_ROWS = 5;      // We divide our 80 targets in a 8x10 grid
const GRID_COLUMNS = 3;     // We divide our 80 targets in a 8x10 grid
const GRID_A_COLUMNS = 4; // We divide our 80 targets in a 8x10 grid
const SLICE_ID = -1;    // The ID of the target that is not the final target

var screen_width;
var screen_height;
var target_size;
var horizontal_gap;
var vertical_gap;
let CX;
let CY;

var GAP_SIZE = 10;
var MAXRAD = Math.PI * 2; // 360 º



// Função para criar uma cópia classificada da matriz com base na coluna "city"
function sortByCity(matrix) {
  // Copia a matriz original
  let sortedMatrix = matrix.slice();

  // Classifica a matriz com base na coluna "city"
  sortedMatrix.sort((a, b) => {
    let cityA = a[1].toLowerCase(); // Assumindo que a coluna "city" está na posição 1
    let cityB = b[1].toLowerCase();
    if (cityA < cityB) return -1;
    if (cityA > cityB) return 1;
    return 0;
  });

  return sortedMatrix;
}

// Ensures important data is loaded before the program starts
function preload() {
  // id,name,...
  legendas = loadTable('legendas.csv', 'csv', 'header');
  click_sound = loadSound('click_sound.wav');
  
  //image1 = loadImage('screenshot1.png');
}

// Runs once at the start
function setup() {
  createCanvas(900, 500);    // window size in px before we go into fullScreen()
  frameRate(60);             // frame rate (DO NOT CHANGE!)
  // Extrai os dados da tabela legendas para uma matriz JavaScript
  click_sound.setVolume(0.05);
  let legendasArray = [];
  for (let i = 0; i < legendas.getRowCount(); i++) {
    let rowData = [];
    for (let j = 0; j < legendas.getColumnCount(); j++) {
      rowData.push(legendas.getString(i, j));
    }
    legendasArray.push(rowData);
  }

  // Ordena a matriz com base na coluna "city"
  let sortedLegendasArray = sortByCity(legendasArray);

  // Atualiza os dados da tabela legendas com os dados ordenados
  for (let i = 0; i < sortedLegendasArray.length; i++) {
    for (let j = 0; j < sortedLegendasArray[i].length; j++) {
      legendas.set(i, j, sortedLegendasArray[i][j]);
    }
  }

  randomizeTrials();         // randomize the trial order at the start of execution
  drawUserIDScreen(/*image1*/);        // draws the user start-up screen (student ID and display size)
}

function normalizeString(str) {
  // Normalizar caracteres acentuados para caracteres não acentuados
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getSufix(str, size) {
  let normalized = normalizeString(str);
  return normalized.substring(normalized.length - size, normalized.length);
}


// pega nas legendas e subdivide em arrays orgnaizados por sufixos
function orderMenus(size) {
  let unordered_index_array = {};
  for (let i = 0; i < legendas.getRowCount(); i++) {
    let temp = legendas.getString(i, 1);
    let sufix = getSufix(temp, size);
    
    //print("Sufixo: ",sufix);
      if (!unordered_index_array[sufix]) {
        unordered_index_array[sufix] = [];
      }
      unordered_index_array[sufix].push(i);
  }

  let sortedKeys = Object.keys(unordered_index_array).sort();
  // Criar indexed_array ordenado
  let indexed_array = {};
  for (let i = 0; i < sortedKeys.length; i++) {
    let key = sortedKeys[i];
    indexed_array[key] = unordered_index_array[key];
  }
  
  return indexed_array;
}



function drawPIE() {
  for (let i = 0; i < targets.length; i++) {
    targets[i].draw();

  }
}

function PIEremove() {
  for (let i = 0; i < targets.length; i++) {
    targets[i].setDrawn(false);
  }
}

// Runs every frame and redraws the screen
function draw() {
  if (draw_targets && attempt < 2) {
    // The user is interacting with the 6x3 target grid
    background(color(0, 0, 0));        // sets background to black

    // Print trial count at the top left-corner of the canvas
    textFont("Arial", 16);
    fill(color(255, 255, 255));
    textAlign(LEFT);
    text("Trial " + (current_trial + 1) + " of " + trials.length, 50, 20);

    drawPIE();


    // Draws the target label to be selected in the current trial. We include 
    // a black rectangle behind the trial label for optimal contrast in case 
    // you change the background colour of the sketch (DO NOT CHANGE THESE!)
    fill(color(0, 0, 0));
    rect(0, height - 40, width, 40);

    textFont("Arial", 20);
    fill(color(255, 255, 255));
    textAlign(CENTER);
    text(legendas.getString(trials[current_trial], 1), width / 2, height - 20);
  }
}

// Print and save results at the end of 54 trials
function printAndSavePerformance() {
  // DO NOT CHANGE THESE! 
  let accuracy = parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time = (testEndTime - testStartTime) / 1000;
  let time_per_target = nf((test_time) / parseFloat(hits + misses), 0, 3);
  let penalty = constrain((((parseFloat(95) - (parseFloat(hits * 100) / parseFloat(hits + misses))) * 0.2)), 0, 100);
  let target_w_penalty = nf(((test_time) / parseFloat(hits + misses) + penalty), 0, 3);
  let timestamp = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();

  textFont("Arial", 18);
  background(color(0, 0, 0));   // clears screen
  fill(color(255, 255, 255));   // set text fill color to white
  textAlign(LEFT);
  text(timestamp, 10, 20);    // display time on screen (top-left corner)

  textAlign(CENTER);
  text("Attempt " + (attempt + 1) + " out of 2 completed!", width / 2, 60);
  text("Hits: " + hits, width / 2, 100);
  text("Misses: " + misses, width / 2, 120);
  text("Accuracy: " + accuracy + "%", width / 2, 140);
  text("Total time taken: " + test_time + "s", width / 2, 160);
  text("Average time per target: " + time_per_target + "s", width / 2, 180);
  text("Average time for each target (+ penalty): " + target_w_penalty + "s", width / 2, 220);

  // Saves results (DO NOT CHANGE!)
  let attempt_data =
  {
    project_from: GROUP_NUMBER,
    assessed_by: student_ID,
    test_completed_by: timestamp,
    attempt: attempt,
    hits: hits,
    misses: misses,
    accuracy: accuracy,
    attempt_duration: test_time,
    time_per_target: time_per_target,
    target_w_penalty: target_w_penalty,
  }

  // Sends data to DB (DO NOT CHANGE!)
  if (RECORD_TO_FIREBASE) {
    // Access the Firebase DB
    if (attempt === 0) {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }

    // Adds user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() {
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)
  if (draw_targets) {
    let aux = []; //vai guardar a lista de targets do menu atual(screen1 ou outro menu)

      aux.push(targets);

    if (drawing!=="pie") { //caso outro menu/submenu
      aux.push(drawing.targets);
    }

    for (let i = 0; i < aux.length; i++) {
      for(let j = 0; j < aux[i].length; j++){
        let target = aux[i][j];
        // Check if the user clicked over one of the targets
        if (target.clicked(mouseX, mouseY)) {

          if (target.getID() === SLICE_ID) {
            target.addDistance();
            if (drawing !== "pie") {
              drawing.delDistance();
              drawing.delete();
            }

            drawing = target; // se clicar num target, já apagou (hitboxes) os que estavam no ecrã e agora vai indicar ao draw que pode desenhar o menu clicado
          }
          else {
            // Checks if it was the correct target
            //print("Target id" + targets[i].id + "trial" + (legendas.getNum(trials[current_trial], 0)));
            //print(target.label);
            target.setWasClicked();
            
            if (target.id === legendas.getNum(trials[current_trial], 0)) hits++;
            else misses++;

            current_trial++;              // Move on to the next trial/target
          }
          break;
        }
      }
    }

    // Check if the user has completed all trials
    if (current_trial === NUM_OF_TRIALS) {
      testEndTime = millis();
      draw_targets = false;          // Stop showing targets and the user performance results
      printAndSavePerformance();     // Print the user's results on-screen and send these to the DB
      attempt++;

      // If there's an attempt to go create a button to start this
      if (attempt < 2) {
        continue_button = createButton('START 2ND ATTEMPT');
        continue_button.mouseReleased(continueTest);
        continue_button.position(width / 2 - continue_button.size().width / 2, height / 2 - continue_button.size().height / 2);
      }
    }
    // Check if this was the first selection in an attempt
    else if (current_trial === 1) testStartTime = millis();
  }
}

// Evoked after the user starts its second (and last) attempt
function continueTest() {
  // Re-randomize the trial order
  randomizeTrials();

  // Resets performance variables
  hits = 0;
  misses = 0;

  current_trial = 0;
  continue_button.remove();

  // Shows the targets again
  draw_targets = true;
}

// Apos subdividir as legendas em arrays organizados por prefixo, itera pelo array de prefixos e cria os targets
// se o prefixo tiver mais que um elemento, cria um target(menu) com o prefixo e passa para este o array das cidades com o prefixo
// para depois serem criados os submenus no createSubMenusOrTargets do target.js, tudo isto é feito apenas uma vez e de uma vez  
// (todos os submenus sao logo criados) quando o Target é criado, mas nao sao desenhados, apenas quando clicamos no target(menu) é que sao desenhados
// se tiver apenas um elemento, cria um target com o nome da cidade


function createTargets(target_size, horizontal_gap, vertical_gap, windowWidth, windowHeight) {
  let indexed_array = orderMenus(1); // Chama a função orderMenus
  console.log(indexed_array);

  RADIUS = windowWidth / 3.15;
  LABEL_POS = windowWidth / 7.5;
  h_margin = horizontal_gap / (GRID_COLUMNS - 1);
  v_margin = vertical_gap / (GRID_ROWS - 1);

  let menus = Object.keys(indexed_array).length;
  let words = 0;

  //print("words: ", words, " menus: ", menus);


  var loopCounter = 0;

  //print("menus: ", menus);
  
  for (key in indexed_array) {
    let cx;
    let cy;
    let sliceSize = MAXRAD / menus;
    let fromRadians = MAXRAD * (loopCounter / (menus+words)) - HALF_PI;
    let toRadians = fromRadians + sliceSize;
    let halfRadians = fromRadians + (sliceSize / 2);

    cx = GAP_SIZE * Math.cos(halfRadians) + CX; // x da ponta da fatia
    cy = GAP_SIZE * Math.sin(halfRadians) + CY;// y da ponta da fatia

    //print("Key:", key, "Value:", indexed_array[key]);

      let targetMenu = new Target(cx, cy, fromRadians, halfRadians, toRadians, RADIUS, key, SLICE_ID, indexed_array[key]);
      targets.push(targetMenu);
    
    loopCounter++;
    //print("windowWidth: ", windowWidth, " windowHeight: ", windowHeight);
    //print("screen_width: ", screen_width, " screen_height: ", screen_height); 

  }
}


// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() {
  if (fullscreen()) {
    resizeCanvas(windowWidth, windowHeight);

    //FIXME voltar a colocar aqui as variaveis que estam comentadas e estao no target.js

    // DO NOT CHANGE THE NEXT THREE LINES!
     let display        = new Display({ diagonal: display_size }, window.screen);
     PPI                = display.ppi;                      // calculates pixels per inch
     PPCM               = PPI / 2.54;                       // calculates pixels per cm
    
    // Make your decisions in 'cm', so that targets have the same size for all participants
    // Below we find out out white space we can have between 2 cm targets
    screen_width   = display.width * 2.54;             // screen width
    screen_height  = display.height * 2.54;            // screen height
    target_size    = windowWidth/475;                                // sets the target size (will be converted to cm when passed to createTargets)
    horizontal_gap = screen_width - target_size * GRID_COLUMNS;// empty space in cm across the x-axis (based on 10 targets per row)
    vertical_gap   = screen_height - target_size * GRID_ROWS;  // empty space in cm across the y-axis (based on 8 targets per column)
    CX = windowWidth/2; //FIXME corrigir centro do ecrã x
    CY = windowHeight/2 - 40; //centro do ecrã y
    // Creates and positions the UI targets according to the white space defined above (in cm!)
    // 80 represent some margins around the display (e.g., for text)
    if (!draw_targets) {
      createTargets(target_size * windowHeight / 28, horizontal_gap * PPCM - 80, vertical_gap * PPCM - 80, windowWidth, windowHeight);
    }
    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;
  }
}