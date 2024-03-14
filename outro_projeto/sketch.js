// Bake-off #2 -- Seleção em Interfaces Densas
// IPM 2023-24, Período 3
// Entrega: até às 23h59, dois dias úteis antes do sexto lab (via Fenix)
// Bake-off: durante os laboratórios da semana de 18 de Março

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER        = 0;      // Add your group number here as an integer (e.g., 2, 3)
const RECORD_TO_FIREBASE  = false;  // Set to 'true' to record user results to Firebase

// Pixel density and setup variables (DO NOT CHANGE!)
let PPI, PPCM;
const NUM_OF_TRIALS       = 12;     // The numbers of trials (i.e., target selections) to be completed
let continue_button;
let legendas;                       // The item list from the "legendas" CSV

// Metrics (DO NOT CHANGE!)
let testStartTime, testEndTime;     // time between the start and end of one attempt (8 trials)
let hits 			      = 0;      // number of successful selections
let misses 			      = 0;      // number of missed selections (used to calculate accuracy)
let database;                       // Firebase DB  

// Study control parameters (DO NOT CHANGE!)
let draw_targets          = false;  // used to control what to show in draw()
let trials;                         // contains the order of targets that activate in the test
let current_trial         = 0;      // the current trial number (indexes into trials array above)
let attempt               = 0;      // users complete each test twice to account for practice (attemps 0 and 1)

// Target list and layout variables
const TEXT_FACTOR_1       = 300;
const TEXT_FACTOR_2       = 0;

// Make your decisions in 'cm', so that targets have the same size for all participants
// Below we find out out white space we can have between 2 cm targets
let screen_width; // screen width
let screen_height; // screen height
let target_size = 2.3; // sets the target size (will be converted to cm when passed to createTargets)
let target_text_size;

let COLOR_WHITE;
let COLOR_BLACK;
let COLOR_DEFAULT_BUTTON;
let DEFAULT_TARGET_FONT;
let DEFAULT_MENU_FONT;
let DEBUG;

// Ensures important data is loaded before the program starts
function preload()
{
  // id,name,...
  legendas = loadTable('legendas.csv', 'csv', 'header');
}

// Runs once at the start
function setup()
{
  colorMode(HSB, 360, 100, 100); // Use HSB color
  COLOR_WHITE = color(0, 0, 100);
  COLOR_BLACK = color(0, 0, 0);
  COLOR_DEFAULT_BUTTON = color(0, 0, 30);
  DEFAULT_TARGET_FONT = "Serif";
  DEFAULT_MENU_FONT = "Serif";
  DEBUG = false;

  createCanvas(700, 500);        // window size in px before we go into fullScreen()
  frameRate(60);                 // frame rate (DO NOT CHANGE!)
  randomizeTrials();             // randomize the trial order at the start of execution
  drawUserIDScreen();            // draws the user start-up screen (student ID and display size)
  
}

// Runs every frame and redraws the screen
function draw()
{
  if (draw_targets && attempt < 2)
  {
    // The user is interacting with the 6x3 target grid
    background(COLOR_BLACK);        // sets background to black
    
    // Print trial count at the top left-corner of the canvas
    textFont("Arial", 16);
    fill(COLOR_WHITE);
    textAlign(LEFT);
    text("Trial " + (current_trial + 1) + " of " + trials.length, 50, 20);
    
    drawCurrentFrame();
    
    // Draws the target label to be selected in the current trial. We include 
    // a black rectangle behind the trial label for optimal contrast in case 
    // you change the background colour of the sketch (DO NOT CHANGE THESE!)
    fill(COLOR_BLACK);
    rect(0, height - 40, width, 40);
 
    textFont("Arial", 20);
    fill(COLOR_WHITE);
    textAlign(CENTER);
    text(legendas.getString(trials[current_trial],1), width/2, height - 20);
  }
}

// Print and save results at the end of 54 trials
function printAndSavePerformance()
{
  // DO NOT CHANGE THESE! 
  let accuracy			= parseFloat(hits * 100) / parseFloat(hits + misses);
  let test_time         = (testEndTime - testStartTime) / 1000;
  let time_per_target   = nf((test_time) / parseFloat(hits + misses), 0, 3);
  let penalty           = constrain((((parseFloat(95) - (parseFloat(hits * 100) / parseFloat(hits + misses))) * 0.2)), 0, 100);
  let target_w_penalty	= nf(((test_time) / parseFloat(hits + misses) + penalty), 0, 3);
  let timestamp         = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  textFont("Arial", 18);
  background(COLOR_BLACK);   // clears screen
  fill(COLOR_WHITE);   // set text fill color to white
  textAlign(LEFT);
  text(timestamp, 10, 20);    // display time on screen (top-left corner)
  
  textAlign(CENTER);
  text("Attempt " + (attempt + 1) + " out of 2 completed!", width/2, 60); 
  text("Hits: " + hits, width/2, 100);
  text("Misses: " + misses, width/2, 120);
  text("Accuracy: " + accuracy + "%", width/2, 140);
  text("Total time taken: " + test_time + "s", width/2, 160);
  text("Average time per target: " + time_per_target + "s", width/2, 180);
  text("Average time for each target (+ penalty): " + target_w_penalty + "s", width/2, 220);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = 
  {
        project_from:       GROUP_NUMBER,
        assessed_by:        student_ID,
        test_completed_by:  timestamp,
        attempt:            attempt,
        hits:               hits,
        misses:             misses,
        accuracy:           accuracy,
        attempt_duration:   test_time,
        time_per_target:    time_per_target,
        target_w_penalty:   target_w_penalty,          
  }
  
  // Sends data to DB (DO NOT CHANGE!)
  if (RECORD_TO_FIREBASE)
  {
    // Access the Firebase DB
    if (attempt === 0)
    {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }
    
    // Adds user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER + 'V' + PROJECT_CODENAME);
    db_ref.push(attempt_data);
  }
}

// Mouse button was pressed - lets test to see if hit was in the correct target
function mousePressed() 
{
  // Only look for mouse releases during the actual test
  // (i.e., during target selections)
  if (draw_targets)
  {
    detectClick(mouseX, mouseY);
    
    // Check if the user has completed all trials
    if (current_trial === NUM_OF_TRIALS)
    {
      testEndTime = millis();
      draw_targets = false;          // Stop showing targets and the user performance results
      printAndSavePerformance();     // Print the user's results on-screen and send these to the DB
      attempt++;                      
      
      // If there's an attempt to go create a button to start this
      if (attempt < 2)
      {
        continue_button = createButton('START 2ND ATTEMPT');
        continue_button.mouseReleased(continueTest);
        continue_button.position(width/2 - continue_button.size().width/2, height/2 - continue_button.size().height/2);
      }
    }
    // Check if this was the first selection in an attempt
    else if (current_trial === 1) testStartTime = millis(); 
  }
}

// Evoked after the user starts its second (and last) attempt
function continueTest()
{
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

// Creates and positions the UI targets
function createTargets(target_size, horizontal_gap, vertical_gap)
{
  setupFrames(horizontal_gap, vertical_gap);
  let menus = new Targets(target_size, screen_height - 3 * target_size, 0.75, 0.75, screen_width - 2 * target_size, 4 * target_size);
  //let outliers = new Targets(target_size, screen_height - target_size * 1.5, 1, 1, screen_width - 2 * target_size, 4 * target_size);
  let outliers = new NamedTargets(target_size, screen_height - target_size, 0.75, 0.75, screen_width - 2 * target_size, 4 * target_size, DEFAULT_MENU_FONT, target_text_size, COLOR_WHITE);
  let cities = legendas.getColumn(1);
  let prefs = new Set();
  cities.sort();
  let outlier_cities = legendas.matchRows("^By|^Bn|^Bl", 1);

  for (let i = 0; i < outlier_cities.length; i++) {
    outliers.with(new Target(200, 200, target_size, outlier_cities[i].getString(1), outlier_cities[i].getNum(0), true, COLOR_DEFAULT_BUTTON, DEFAULT_TARGET_FONT, COLOR_WHITE, target_text_size));
    prefs.add(outlier_cities[i].getString(1).substring(0, 2));
  }

  for (let i = 0; i < cities.length; i++) {
    let prefix = cities[i].substring(0, 2);
    if (prefs.has(prefix))
      continue;
    if (prefix.localeCompare("Be") === 0) {
      prefix += "|Bé";
      prefs.add("Bé");
    }

    let menu = new Menu(0, 0, target_size * 1.2, prefix.substring(0, 2).toUpperCase(), COLOR_DEFAULT_BUTTON, DEFAULT_MENU_FONT, COLOR_WHITE, 72, base_frame, 10, 10);
    let targets = new Targets(target_size, screen_height - 4 * target_size, 0.5, 1, screen_width - target_size, 4 * target_size);
    loadMenu(menu, targets, prefix, legendas);
    menus.with(menu);
    prefs.add(prefix.substring(0, 2));
  }
  base_frame.with(menus);
  base_frame.with(outliers);
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized() 
{
  if (fullscreen())
  {
    resizeCanvas(windowWidth, windowHeight);
    
    // DO NOT CHANGE THE NEXT THREE LINES!
    let display        = new Display({ diagonal: display_size }, window.screen);
    PPI                = display.ppi;                      // calculates pixels per inch
    PPCM               = PPI / 2.54;                       // calculates pixels per cm
  
    // Make your decisions in 'cm', so that targets have the same size for all participants
    // Below we find out out white space we can have between 2 cm targets
    screen_width   = display.width * 2.54;             // screen width
    screen_height  = display.height * 2.54;            // screen height

    let horizontal_gap = 2;
    
    let vertical_gap = 2;

    target_text_size = Math.floor((TEXT_FACTOR_1 / display.diagonal) + TEXT_FACTOR_2);
    console.log("Calculated text size:" + target_text_size);
    
    createTargets(target_size, horizontal_gap, vertical_gap);

    // Starts drawing targets immediately after we go fullscreen
    draw_targets = true;
  }
}
