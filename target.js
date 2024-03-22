let RADIUS; // raio do círculo imaginário que contém os targets
let LABEL_POS;
var drawing = "pie"; // variável que vai ter o valor "pie" se só tiver desenhado o menu circular, senão irá ser um objecto do tipo Target
let alternate_color = false;

class Target {
  constructor(x, y,startAngle,halfAngle,endAngle, w, l, id, array) {
    this.x = x;
    this.y = y;
    this.startAngle = startAngle;
    this.halfAngle = halfAngle;
    this.endAngle = endAngle;
    this.width = w;
    this.label = l;
    this.id = id;
    this.drawn = false;
    this.array = array;
    this.targets = [];
    this.wasClicked = false;
    if (id == SLICE_ID) {
      this.createSubMenusOrTargets(this.array);
    }
  }

  //Esta é a funcao quye pega no array das cidades e cria os submenus de acordo com os prefixos
  // Depois cria os targets ---- é aqui que se tem de mudar aspetos ao nivel do tamanho e posicionamento dos targets em cada submenu
  createSubMenusOrTargets(array) {

    let t_size = target_size * windowHeight/28;
    //print("tamanho do target: ", t_size);
    let h_gap = t_size+10;
    //print("h_gap: ", h_gap);
    let v_gap = 3*t_size/4+10;
    //print("v_gap: ", v_gap);
    let start_x = 0;
    let start_y = 0;
    let end_x = 0;
    let end_y = 0;
    let quadrant = 0;

    let words = array.length;

    if (this.halfAngle < 0) {
        quadrant = 1;
        
        if (this.label === "h") {
          start_x = 2*windowWidth/3 + 3*t_size/4;
          start_y = windowHeight/2 - t_size/3;
        }
        else{
          start_x = 2*windowWidth/3 + t_size/2;
          start_y = windowHeight/3  - t_size/2;
        }
        if (this.label === "a") {
          start_x = 2*windowWidth/3 - 6*t_size/7;
          start_y = windowHeight/3 - 7*t_size/4;
          end_x = start_x + Math.min(words,GRID_A_COLUMNS)*h_gap;
          end_y = start_y + Math.min(words,GRID_ROWS)*v_gap;
        }
        else{
        end_x = start_x + Math.min(words,GRID_COLUMNS)*h_gap;
        end_y = start_y + Math.min(words,GRID_ROWS)*v_gap;
        }
    }
    else if (this.halfAngle < HALF_PI) {
        quadrant = 2;
        start_x = 2*windowWidth/3 + t_size/4;
        start_y = 2*windowHeight/3;
        end_y = start_y + Math.min(words,GRID_ROWS)*v_gap;
        end_x = start_x + Math.min(words,GRID_COLUMNS)*h_gap;
    } 
    else if (this.halfAngle < PI) {
        quadrant = 3;  
        end_x = windowWidth/3 + t_size/2;
        end_y = start_y + Math.min(words,GRID_ROWS)*v_gap ;
        start_y = 2*windowHeight/3 - t_size/2;
        start_x = end_x - Math.min(words,GRID_COLUMNS)*h_gap;
    }
    else {
        quadrant = 4;  
        if (this.label === "t") {
          start_y = windowHeight/2 - t_size/2;
          end_x = windowWidth/3 + t_size/5;
        }
        else{
          start_y = windowHeight/3 - t_size;
          end_x = windowWidth/3 + t_size; 
        }
        start_x = end_x - Math.min(words,GRID_COLUMNS)*h_gap;
        end_y = start_y + Math.min(words,GRID_ROWS)*v_gap;
    }
    //print("label:",this.label,"start_x: ", start_x, "start_y: ", start_y, "end_x: ", end_x, "end_y: ", end_y, "quadrant: ", quadrant, "target size: ", t_size, "words: ", words, "h_gap: ", h_gap, "v_gap: ", v_gap)

    // give it some margin from the left border 
    let target_x = start_x        // give it some margin from the left border
    let target_y = start_y        // give it some margin from the top border
    let row_count = 0;
    for (let i = 0; i<words; i++){
        let legendas_index = array[i];
        let target = new Target(target_x, target_y, 0, 0, 0, t_size, legendas.getString(legendas_index, 1), legendas.getNum(legendas_index, 0), null);
        this.targets.push(target);

        if((this.label!== "a" && (i+1)%GRID_COLUMNS==0)||(this.label === "a" && (i+1)%GRID_A_COLUMNS==0)){
            row_count++;
            if(quadrant == 1 && this.label !== "h"){
              if(this.label === "a"){
                start_x += (4-row_count)*h_gap/4;
                end_x += h_gap;
              }
              else{
                start_x += h_gap/2;
                end_x += h_gap/2;
              }
              target_x = start_x;
              target_y += v_gap;
            }
            else if(quadrant == 2){
                start_x -= h_gap/2;
                target_y += v_gap;

              target_x = start_x;
            }
            else if(quadrant == 3){
              end_x += 3*h_gap/7;
              target_x = end_x - Math.min(words-i-1,GRID_COLUMNS)*h_gap;
                target_y += v_gap;

            }
            else if(quadrant==4 && this.label !== "t"){
              end_x -= h_gap;
              target_x = end_x - Math.min(words-i-1,GRID_COLUMNS)*h_gap;
              target_y += v_gap;
            }
            else if(this.label === "t"){
              target_y += v_gap;
            }
            
        } 
        else{
            target_x += h_gap;
        }
    }  
  }

  compareLabel(target) {
    return this.label === target.label
  }

  // Sets the draw state of a target
  setDrawn(state) {
    this.drawn = state;
  }
  getID() {
    return this.id;
  }

  getDrawn() {
    return this.drawn;
  }

  getMenu() {
    return this.menu;
  }

  getLabel() {
    return this.label;
  }
  setWasClicked(){
    this.wasClicked = true;
  }

  addDistance() {
    this.x = GAP_SIZE * Math.cos(this.halfAngle)*3 + CX;
    this.y = GAP_SIZE * Math.sin(this.halfAngle)*3 + CY;
  }
  delDistance() {
    this.x = GAP_SIZE * Math.cos(this.halfAngle) + CX;
    this.y = GAP_SIZE * Math.sin(this.halfAngle) + CY;
  }

  // Checks if a mouse click took place
  // within the target

  clicked(mouse_x, mouse_y) {
    let distance = 0; 
    // Calcula o ângulo entre o centro da fatia e o ponto de clique
    if(this.id === SLICE_ID){
      let angle = atan2(mouse_y - this.y, mouse_x - this.x);
      let positive_startAngle = this.startAngle;
      let positive_endAngle = this.endAngle;
      if(this.startAngle < 0){
        positive_startAngle = this.startAngle + TWO_PI;
        positive_endAngle = this.endAngle + TWO_PI;
      }

      // Ajusta o ângulo para o intervalo [0, TWO_PI]
      if (angle < 0) {
        angle += TWO_PI;
      }
      else if (angle > this.startAngle && angle < this.endAngle && this.startAngle < 0 && this.endAngle > 0){ // no caso de ser o H, tem startAngle negativo e endAngle positivo
        angle += TWO_PI;
      }
;
      // Verifica se o ângulo está dentro do intervalo da fatia
      if (angle >= positive_startAngle && angle <= positive_endAngle) {
        // Calcula a distância entre o ponto de clique e o centro da fatia
        distance = dist(mouse_x, mouse_y, this.x, this.y);
        // Verifica se a distância está dentro do raio da fatia
        if(distance <= this.width / 2){
          if(this.id !== SLICE_ID)
            click_sound.play();
          return true;
        }
        return false;
      }
    }
    else{
      if(dist(mouse_x, mouse_y, this.x, this.y) <= this.width / 2){
        if(this.id !== SLICE_ID)
        click_sound.play();
        return true;
      }
      return false;
    }

  }
  
  // Draws the target (i.e., a circle)
  // and its label
  delete() {
    if (this.id === SLICE_ID) {
      for (let i = 0; i < this.targets.length; i++) {
        this.targets[i].drawn = false;
      }
    }
    //else{
    this.drawn = false;
    //}
  }

  draw() {
    let is_slice = false;
    
      this.drawn = true;
      // Draw label 

      if (this.id === SLICE_ID) {
        if(alternate_color){
          fill(color(25, 55, 62));
          alternate_color = false;
        }
        else{
          fill(color(32, 125, 145));
          alternate_color = true;
        }
        arc(this.x, this.y, RADIUS, RADIUS, this.startAngle, this.endAngle, PIE);
        textFont("Serif", 40); 
        is_slice = true;
      } else {
        fill(color(79,79,79));
        if(this.wasClicked){
          //print("was clicked\n");
          stroke('rgba(0, 255, 0, 0.25)');
          strokeWeight(8);
        }
        rect(this.x - this.width/2, this.y - this.width/4, this.width, 3*this.width/4, 30);
        //print("sem stroke\n");
        noStroke();
        textFont("Serif", 35); 
      }

      fill(color(255, 255, 255));
      textAlign(CENTER);
      if(!is_slice){
        text(this.label[1].toUpperCase(), this.x, this.y);
        textFont("Serif", 22);
        text(this.label, this.x, this.y + this.width/3);
      }
      else{
        text(this.label.toUpperCase(), LABEL_POS * Math.cos(this.halfAngle) + this.x, LABEL_POS * Math.sin(this.halfAngle) + this.y);
      }
      
    
    if (drawing === this) {
      if (this.id === SLICE_ID) {
        for (let i = 0; i < this.targets.length; i++) {
          this.targets[i].draw();
        }
      }
    }
  }
}