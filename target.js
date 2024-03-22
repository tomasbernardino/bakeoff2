let RADIUS; // raio do círculo imaginário que contém os targets
let LABEL_POS;
var drawing = "pie"; // variável que vai ter o valor "pie" se só tiver desenhado o menu circular, senão irá ser um objecto do tipo Target

// Os targets tanto podem ser menus e abrir ecras com mais targets como podem ser targets normais que "voltam" para o ecra inicial ao clicar
// (no fundo sao todos menus na medida que todos abrem um novo ecra, mas so os targets finais é que contam para os hits/misses)
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
    if (id == SLICE_ID) {
      this.createSubMenusOrTargets(this.array);
    }
  }

  //Esta é a funcao quye pega no array das cidades e cria os submenus de acordo com os prefixos
  // Depois cria os targets ---- é aqui que se tem de mudar aspetos ao nivel do tamanho e posicionamento dos targets em cada submenu
  createSubMenusOrTargets(array) {

    let t_size = target_size * windowHeight/28;
    let h_gap = t_size;//horizontal_gap * PPCM - 80;
    let v_gap = t_size+20;//vertical_gap * PPCM - 80;
    let start_x = 0;
    let start_y = 0;
    let end_x = 0;
    let end_y = 0;
    let quadrant = 0;

    let words = array.length;

    if (this.halfAngle < 0) {
        quadrant = 1;
        
        if (this.label === "h") {
          start_x = 2*windowWidth/3 + t_size/2;
          start_y = windowHeight/2 - t_size/3;
        }
        else{
          start_x = 2*windowWidth/3;
          start_y = windowHeight/3  - t_size/2;
        }
        if (this.label === "a") {
          start_x = 2*windowWidth/3 - 5*t_size/6;
          start_y = windowHeight/3 - 3*t_size/2;
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
        start_x = 2*windowWidth/3;
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
          end_x = windowWidth/3 + t_size/2;
        }
        else{
          start_y = windowHeight/3 - t_size;
          end_x = windowWidth/3 + t_size; 
        }
        start_x = end_x - Math.min(words,GRID_COLUMNS)*h_gap;
        end_y = start_y + Math.min(words,GRID_ROWS)*v_gap;
    }
    

    // give it some margin from the left border
    let target_x = start_x        // give it some margin from the left border
    let target_y = start_y       // give it some margin from the top border
    for (let i = 0; i<words; i++){
   
      let legendas_index = array[i];
      let target = new Target(target_x, target_y, 0, 0, 0, t_size, legendas.getString(legendas_index, 1), legendas.getNum(legendas_index, 0), null);
      this.targets.push(target);
      
      if(target_x + h_gap === end_x){
        if(quadrant == 1 && this.label !== "h"){
          start_x += h_gap;
          end_x += h_gap;
          target_x = start_x;
        }
        else if(quadrant == 2){
          start_x -= h_gap;
          target_x = start_x;
        }
        else if(quadrant == 3){
          end_x += h_gap;
          target_x = end_x - Math.min(words-i-1,GRID_COLUMNS)*h_gap;
        }
        else if(quadrant==4 && this.label !== "t"){
          end_x -= h_gap;
          target_x = end_x - Math.min(words-i-1,GRID_COLUMNS)*h_gap;
        }
        target_y += v_gap;
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

  // Checks if a mouse click took place
  // within the target

  clicked(mouse_x, mouse_y) {
    // Calcula o ângulo entre o centro da fatia e o ponto de clique
    if(this.id === SLICE_ID){
      let angle = atan2(mouse_y - this.y, mouse_x - this.x);
      print("angle: ", angle, "startAngle: ", this.startAngle, "endAngle: ", this.endAngle)
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

      print("angle: ", angle, "startAngle: ", positive_startAngle, "endAngle: ", positive_endAngle)
      print("o target",this.label,"id: ",this.id, "foi clicado");
      // Verifica se o ângulo está dentro do intervalo da fatia
      if (angle >= positive_startAngle && angle <= positive_endAngle) {
        // Calcula a distância entre o ponto de clique e o centro da fatia
        let distance = dist(mouse_x, mouse_y, this.x, this.y);
        print(", retornou:", distance <= this.width / 2)
        // Verifica se a distância está dentro do raio da fatia
        return distance <= this.width / 2;
      } else {
        return false;
      }
    }
    else{
      return dist(mouse_x, mouse_y, this.x, this.y) <= this.width / 2;
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
        fill(color(100, 100, 100));
        arc(this.x, this.y, RADIUS, RADIUS, this.startAngle, this.endAngle, PIE);
        textFont("Serif", 40); 
        is_slice = true;
      } else {
        fill(color(50, 50, 50));
        circle(this.x, this.y, this.width);
        textFont("Serif", 24); 
      }

//      let upperLabel = this.label.substring(0,1).toUpperCase();
//      let rest = this.label.substring(1)
//      let finalLabel = upperLabel + rest;

      fill(color(255, 255, 255));
      textAlign(CENTER);
      if(!is_slice){
        text(this.label, this.x, this.y);
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