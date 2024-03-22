// Support variables & functions (DO NOT CHANGE!)

let student_ID_form, display_size_form, start_button;                  // Initial input variables
let student_ID, display_size;                                          // User input parameters

// Prints the initial UI that prompts that ask for student ID and screen size
function drawUserIDScreen()
{ 
  background(color(0,0,0));                                          // sets background to black
  
  // Text prompt
  main_text = createDiv("Insert your student number and display size");
  main_text.id('main_text');
  main_text.position(10, 10);
  
  // Input forms:
  // 1. Student ID
  let student_ID_pos_y_offset = main_text.size().height + 40;         // y offset from previous item
  
  student_ID_form = createInput('');                                 // create input field
  student_ID_form.position(200, student_ID_pos_y_offset);
  
  student_ID_label = createDiv("Student number (int)");              // create label
  student_ID_label.id('input');
  student_ID_label.position(10, student_ID_pos_y_offset);
  
  // 2. Display size
  let display_size_pos_y_offset = student_ID_pos_y_offset + student_ID_form.size().height + 20;
  
  display_size_form = createInput('');                              // create input field
  display_size_form.position(200, display_size_pos_y_offset);
  
  display_size_label = createDiv("Display size in inches");         // create label
  display_size_label.id('input');
  display_size_label.position(10, display_size_pos_y_offset);
  
  // 3. Rules
  let rules_size_pos_y_offset = display_size_pos_y_offset + display_size_form.size().height + 40;

  rules_size_label = createDiv("Rules (always on display):");
  rules_size_label.id('main_text');
  rules_size_label.position(10, rules_size_pos_y_offset);

  // 4. Rule 1
  let rule1_size_pos_y_offset = rules_size_pos_y_offset + rules_size_label.size().height + 10;

  rule1_size_label = createDiv("1. The inicial screen shows a circular prefix menu with two letters that when");
  rule1_size_label.id('main_text');
  rule1_size_label.position(20, rule1_size_pos_y_offset);

  // Rule 1.1
  let rule11_size_pos_y_offset = rule1_size_pos_y_offset + rule1_size_label.size().height;

  rule11_size_label = createDiv("clicked shows a submenu of the desired prefix.");
  rule11_size_label.id('main_text');
  rule11_size_label.position(40, rule11_size_pos_y_offset);

  // Rule 2
  let rule2_size_pos_y_offset = rule11_size_pos_y_offset + rule11_size_label.size().height + 10;

  rule2_size_label = createDiv("2. The words bellow are the city names.");
  rule2_size_label.id('main_text');
  rule2_size_label.position(20, rule2_size_pos_y_offset);

  // Rule 3
  let rule3_size_pos_y_offset = rule2_size_pos_y_offset + rule2_size_label.size().height + 10;

  rule3_size_label = createDiv("3. If you click anywhere but a target, you go back to the inicial screen.");
  rule3_size_label.id('main_text');
  rule3_size_label.position(20, rule3_size_pos_y_offset);

  // Rule 4
  let rule4_size_pos_y_offset = rule3_size_pos_y_offset + rule3_size_label.size().height + 10;

  rule4_size_label = createDiv("4. The words are ordered alphabetically and clockwise.");
  rule4_size_label.id('main_text');
  rule4_size_label.position(20, rule4_size_pos_y_offset);

  // Rule 5
  let rule5_size_pos_y_offset = rule4_size_pos_y_offset + rule4_size_label.size().height + 10;

  rule5_size_label = createDiv("5. You can navigate as you want through the menus,");
  rule5_size_label.id('main_text');
  rule5_size_label.position(20, rule5_size_pos_y_offset);

  // Rule 6
  let rule6_size_pos_y_offset = rule5_size_pos_y_offset + rule5_size_label.size().height;

  rule6_size_label = createDiv("the time only starts after you click on the first city");
  rule6_size_label.id('main_text');
  rule6_size_label.position(40, rule6_size_pos_y_offset);

  // 4. Start button
  start_button = createButton('START');
  start_button.mouseReleased(startTest);
  start_button.position(width/2 - start_button.size().width/2, height/1.3 - start_button.size().height/2);
}

// Verifies if the student ID is a number, and within an acceptable range
function validID()
{
  if(parseInt(student_ID_form.value()) < 200000 && parseInt(student_ID_form.value()) > 1000) return true
  else 
  {
    alert("Please insert a valid student number (integer between 1000 and 200000)");
	return false;
  }
}

// Verifies if the display size is a number, and within an acceptable range (>13")
function validSize()
{
  if (parseInt(display_size_form.value()) < 50 && parseInt(display_size_form.value()) >= 13) return true
  else
  {
    alert("Please insert a valid display size (between 13 and 50)");
    return false;
  }
}

// Starts the test (i.e., target selection task)
function startTest()
{
  if (validID() && validSize())
  {
    // Saves student and display information
    student_ID = parseInt(student_ID_form.value());
    display_size = parseInt(display_size_form.value());

    // Deletes UI elements
    main_text.remove();
    student_ID_form.remove();
    student_ID_label.remove();
    display_size_form.remove();
    display_size_label.remove();
    start_button.remove();  
    rules_size_label.remove();
    rule1_size_label.remove();
    rule11_size_label.remove();
    rule2_size_label.remove();
    rule3_size_label.remove();
    rule4_size_label.remove();
    rule5_size_label.remove();
    rule6_size_label.remove();
    
    // Goes fullscreen and starts test
    fullscreen(!fullscreen());
  }
}

// Randomize the order in the targets to be selected
function randomizeTrials()
{
  trials = [];      // Empties the array
    
  // Creates an array with random items from the "legendas" CSV
  for (var i = 0; i < NUM_OF_TRIALS; i++) trials.push(floor(random(legendas.getRowCount())));

  print("trial order: " + trials);   // prints trial order - for debug purposes
}