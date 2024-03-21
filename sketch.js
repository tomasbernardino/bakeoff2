//IDEAS: para dar para voltar para tras entre menus a ideia seria cada target ter o seu parent e ao clicar para voltar 
//       para tras o drawing mudaria para o parent 
//       ou algo como guardar o ultimo menu em que esteve (duvidoso, se estivermos no terceiro ecra e quisermos voltar 2 para tras para o menu inicial)

// Bake-off #2 -- Seleção em Interfaces Densas
// IPM 2023-24, Período 3
// Entrega: até às 23h59, dois dias úteis antes do sexto lab (via Fenix)
// Bake-off: durante os laboratórios da semana de 18 de Março

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER = 59;      // Add your group number here as an integer (e.g., 2, 3)
const RECORD_TO_FIREBASE = false;  // Set to 'true' to record user results to Firebase

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

// Target list and layout variables
let targets = [];
const GRID_ROWS = 8;      // We divide our 80 targets in a 8x10 grid
const GRID_COLUMNS = 10;     // We divide our 80 targets in a 8x10 grid
const MENU_ID = -1;    // The ID of the target that is not the final target

//FIXME: estas variaveis nao podem estar aqui!!!! TEM QUE ESTAR NO WINDOWRESIZED do sketch 
// Arranjar maneira de as passar para aqui ou simplementar algo parecido
// Target class (position and width)

var screen_width;
var screen_height;
var target_size;
var horizontal_gap;
var vertical_gap;


var CX = 1933/2; //FIXME corrigir centro do ecrã x
var CY = 500; //centro do ecrã y
var GAP_SIZE = 2;
var MAX_DISTANCE = 0.15;
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
}

// Runs once at the start
function setup() {
  createCanvas(700, 500);    // window size in px before we go into fullScreen()
  frameRate(60);             // frame rate (DO NOT CHANGE!)
  // Extrai os dados da tabela legendas para uma matriz JavaScript
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
  drawUserIDScreen();        // draws the user start-up screen (student ID and display size)
}
//FIXME mudar nome da função
// pega nas legendas e subdivide em arrays orgnaizados por prefixo (2 letras)
function createMapSet(indexed_array, size) {

  for (let i = 0; i < legendas.getRowCount(); i++) {
    let temp = legendas.getString(i, 1);
    let sufix = temp.substring(temp.length - size, temp.length);
    print("Sufixo: ",sufix);
    //let prefix = legendas.getString(i, 1).substring(0, size);

//    if (sufix.localeCompare("Bé") === 0) {
//      if (!indexed_array["Be"]) {
//        indexed_array["Be"] = [];
//      }
//      indexed_array["Be"].push(i); // FIXME afinal vamos guardar o INDICE NA TABELA DE LEGENDAS
//      // para conseguirmos sempre sabê-lo em tempo constante, nao achamos outra maneira de arranjar o ID para o target 
//    }                              // ANTES: legendas.getString(i, 1) -> passavamos o nome da cidade e nao tinhamos o ID 
//    else {
      if (!indexed_array[sufix]) {
        indexed_array[sufix] = [];
      }
      indexed_array[sufix].push(i);
    //}
  }
  //indexed_array["Be"][0]
}



function drawScreen1() {
  for (let i = 0; i < targets.length; i++) {
    targets[i].draw();
    //print(targets[i].getLabel());
  }
}

function screen1remove() {
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

    // Draw all targets
    // desenha o ecra de acordo com o que esta no drawing (screen1 =  inicial), se for apos carregar num target(menu) drawing = target clicado
    if (drawing === "screen1") {
      drawScreen1(); /*
        for (let i = 0; i < targets.length; i++) {
          targets[i].draw();
        //print(targets[i].getLabel());
      }
    }
      */
    }
    else {
      drawCurrentScreen();
    }

    //for (var i = 0; i < legendas.getRowCount(); i++) targets[i].draw();

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
    let aux; //vai guardar a lista de targets do menu atual(screen1 ou outro menu)
    let flag = false;

    if (drawing === "screen1") {
      aux = targets;
    }
    else { //caso outro menu/submenu
      aux = drawing.targets;
    }

    for (let i = 0; i < aux.length; i++) {

      let target = aux[i];
      // Check if the user clicked over one of the targets
      if (target.clicked(mouseX, mouseY)) {
        flag = true;

        if (target.getID() === MENU_ID) {
          if (drawing === "screen1") screen1remove();
          else {
            drawing.delete();
          }
          drawing = target; // se clicar num target, já apagou (hitboxes) os que estavam no ecrã e agora vai indicar ao draw que pode desenhar o menu clicado
        }
        else {
          if (drawing === "screen1") {
            screen1remove();
          }
          else {
            drawing.delete();
          }
          drawing = "screen1"; //no caso de ter clicado num target final, irá voltar ao ecrã inicial

          // Checks if it was the correct target
          print("Target id" + targets[i].id + "trial" + (legendas.getNum(trials[current_trial], 0)));

          if (target.id === legendas.getNum(trials[current_trial], 0)) hits++;
          else misses++;

          current_trial++;              // Move on to the next trial/target
        }
        break;
      }


    }

    if (!flag && drawing !== "screen1") {
      drawing.delete();
      drawing = "screen1";
    }

    flag = false;

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

//!!!!!!!!!!!!!!!!!! aqui é que se pode mudar o layout/posicionamento e tamanho dos targets !!!!!!!!!!!!!!!!!!!!!!!!!
function createTargets(target_size, horizontal_gap, vertical_gap, windowWidth, windowHeight) {
  let indexed_array = {};
  createMapSet(indexed_array, 1); // Chama a função createMapSet
  console.log(indexed_array);
  var r = 0;
  var c = 0;

  h_margin = horizontal_gap / (GRID_COLUMNS - 1);
  v_margin = vertical_gap / (GRID_ROWS - 1);

  let menus = 0;
  let words = 0;

  for (key in indexed_array) {

    if (indexed_array[key].length > 1) {
      menus++;
    } else {
      words++;
    }
  }


  print("words: ", words, " menus: ", menus);

  var angleIncrement = (2 * Math.PI) / menus;
  var radius = windowWidth / 70;
  var loopCounter = 0;

  print("radius: ", radius, " angleIncrement: ", angleIncrement);
  print("menus: ", menus);
  for (key in indexed_array) {
    let sliceSize = MAXRAD / menus;
    let fromRadians = MAXRAD * (loopCounter / menus);
    let toRadians = fromRadians + sliceSize;
    let halfRadians = fromRadians + (sliceSize / 2);
    let cx = GAP_SIZE * Math.cos(halfRadians) + CX; // x da ponta da fatia
    let cy = GAP_SIZE * Math.cos(halfRadians) + CY;// y da ponta da fatia
      
    //var angle = angleIncrement * loopCounter;
    print("Key:", key, "Value:", indexed_array[key]);
    // let target_x = 40 + (h_margin + target_size) * c + target_size / 2;        // give it some margin from the left border
    // let target_y = (v_margin + target_size) * r + target_size / 2;

    //menu
    if (indexed_array[key].length > 1) {

      let targetMenu = new Target(cx, cy, fromRadians, halfRadians, toRadians,  RADIUS, key, MENU_ID, indexed_array[key]);
      targets.push(targetMenu);
      loopCounter++;
      
    } else{
    
      let target_x = target_size * c + windowWidth / 2.0 - words / 2.0 * target_size + target_size / 2;        // give it some margin from the left border
      let target_y = (v_margin + target_size) * r + target_size / 2 + windowHeight / 5 * 3.8;

      let legendas_index = indexed_array[key][0];
      let target = new Target(target_x, target_y + 40, fromRadians, halfRadians, toRadians, 100, legendas.getString(legendas_index, 1), legendas.getNum(legendas_index, 0), null);
      targets.push(target);

      if (c < GRID_COLUMNS - 1) c++; //Serve para iterar pela grid do layout original
      else { c = 0; r++; }
      if (r > GRID_ROWS) break;
    
    }
    print("windowWidth: ", windowWidth, " windowHeight: ", windowHeight);

  }

  //print(targets);
}
// Define the margins between targets by dividing the white space 
// for the number of targets minus one


// Set targets in a 8 x 10 grid
//  for (var r = 0; r < GRID_ROWS; r++)
//  {
//    for (var c = 0; c < GRID_COLUMNS; c++)
//    {
//      // Find the appropriate label and ID for this target
//      let legendas_index = c + GRID_COLUMNS * r;
//      let target_id = legendas.getNum(legendas_index, 0);  
//      let target_label = legendas.getString(legendas_index, 1);   
//      
//      let target = new Target(target_x, target_y + 40, target_size, target_label, target_id);
//      targets.push(target);
//    }  
//  }
//}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() {
  if (fullscreen()) {
    resizeCanvas(windowWidth, windowHeight);

    //FIXME voltar a colocar aqui as variaveis que estam comentadas e estao no target.js

    // DO NOT CHANGE THE NEXT THREE LINES!
    // let display        = new Display({ diagonal: display_size }, window.screen);
    // PPI                = display.ppi;                      // calculates pixels per inch
    // PPCM               = PPI / 2.54;                       // calculates pixels per cm
    //
    let display = new Display({ diagonal: display_size }, window.screen);
    PPI = display.ppi;                      // calculates pixels per inch
    PPCM = PPI / 2.54;                       // calculates pixels per cm
    //// Make your decisions in 'cm', so that targets have the same size for all participants
    //// Below we find out out white space we can have between 2 cm targets
    screen_width   = display.width * 2.54;             // screen width
    screen_height  = display.height * 2.54;            // screen height
    target_size    = 3;                                // sets the target size (will be converted to cm when passed to createTargets)
    horizontal_gap = screen_width - target_size * GRID_COLUMNS;// empty space in cm across the x-axis (based on 10 targets per row)
    vertical_gap   = screen_height - target_size * GRID_ROWS;  // empty space in cm across the y-axis (based on 8 targets per column)

    // Creates and positions the UI targets according to the white space defined above (in cm!)
    // 80 represent some margins around the display (e.g., for text)
    createTargets(target_size * windowHeight / 28, horizontal_gap * PPCM - 80, vertical_gap * PPCM - 80, windowWidth, windowHeight);

    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;
  }
}