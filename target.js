let RADIUS = 700; // raio do círculo imaginário que contém os targets
let LABEL_POS = 280;
var drawing = "screen1"; // variável que vai ter o valor "screen1" se tiver a desenhar o primeiro menu, senão irá ser um objecto do tipo Targete
function drawCurrentScreen() {
  drawing.draw();
}

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
    this.indexed_array = [];
    this.targets = [];
    if (id == MENU_ID && (this.label.length === 1 || this.label.length === 2)) {
      this.createSubMenusOrTargets(this.array, 2, this.indexed_array);
    }
  }

  //Esta é a funcao quye pega no array das cidades e cria os submenus de acordo com os prefixos
  // Depois cria os targets ---- é aqui que se tem de mudar aspetos ao nivel do tamanho e posicionamento dos targets em cada submenu
  createSubMenusOrTargets(array, size, indexed_array) {
    var r = 0;
    var c = 0;
    let t_size = target_size * windowHeight/28;
    let h_gap = horizontal_gap * PPCM - 80;
    let v_gap = vertical_gap * PPCM - 80;
//    //let h_margin = h_gap / (GRID_COLUMNS - 1);
//    //let v_margin = v_gap / (GRID_ROWS - 1);
//    print("about to check the label length", this.label.length);
//    if (this.label.length === ) {                  //Quando ainda nao esta no ultimo menu cria os submenus de prefixos de 3                     
//      for (let i = 0; i < array.length; i++) {
//        let temp = legendas.getString(array[i], 1);
//        let sufix = temp.substring(temp.length -size, temp.length);
//        //let prefix = legendas.getString(array[i], 1).substring(0, size);
//        print("Sufix target:", sufix);
//        if (!indexed_array[sufix]) {
//          indexed_array[sufix] = [];
//        }
//        indexed_array[sufix].push(array[i]);
//      }
//      console.log("Prefix Array:", indexed_array);
//    }
//    else {                                           //Quando ja esta no ultimo menu so copia o nome das cidades
      for (let i = 0; i < array.length; i++) {
        let city = legendas.getString(array[i], 1);
        if (!indexed_array[city]) {
          indexed_array[city] = [];
        }
        indexed_array[city].push(array[i]);
      }
      console.log("Indexed Array:", indexed_array);
   // }

    // for (key in indexed_array) {                               //Cria os targets, se no arrayindexado aquela key so tiver uma cidade entao cria um target normal, 
    //   //console.log("Key:",key, "Value:", indexed_array[key]);//se tiver mais que uma cidade cria um submenu com o prefixo
    //   let target_x = 40 + (h_margin + 2) * c + t_size / 2;        // give it some margin from the left border
    //   let target_y = (v_margin + 2) * r + t_size / 2;

    //   if (indexed_array[key].length > 1) {
    //     let targetMenu = new Target(target_x, target_y + 40, t_size, key, MENU_ID, indexed_array[key]);
    //     this.targets.push(targetMenu);
    //   }
    //   else {
    //     let legendas_index = indexed_array[key][0];
    //     let target = new Target(target_x, target_y + 40, t_size, legendas.getString(legendas_index, 1), legendas.getNum(legendas_index, 0), null);
    //     this.targets.push(target);
    //   }
    //   if (c < GRID_COLUMNS - 1) c++; //Serve para iterar pela grid como estava no layout inicial
    //   else { c = 0; r++; }
    //   if (r > GRID_ROWS) break;
    // }

    let menus = 0;
    let words = 0;

    for (key in indexed_array) {

      if (indexed_array[key].length > 1) {
        menus++;
      } else {
        words++;
      }
    }

    menus = menus + words;
    words = 0;

    print("words: ", words, " menus: ", menus);

    var angleIncrement = (2 * Math.PI) / menus;
    var radius = windowWidth/70;
    var loopCounter = 0;

    print("radius: ", radius, " angleIncrement: ", angleIncrement);

    for (key in indexed_array) {

      var angle = angleIncrement * loopCounter;
      print("Key:", key, "Value:", indexed_array[key]);
      // let target_x = 40 + (h_margin + target_size) * c + target_size / 2;        // give it some margin from the left border
      // let target_y = (v_margin + target_size) * r + target_size / 2;

      let menu_x = windowWidth / 2 + (radius * menus + 55 / menus) * Math.cos(angle - Math.PI / 2);
      let menu_y = windowHeight / 1.8 + (radius * menus + 55 / menus) * Math.sin(angle - Math.PI / 2);
      //menu
      if (indexed_array[key].length > 1) {

        let targetMenu = new Target(menu_x, menu_y, t_size, key, MENU_ID, indexed_array[key]);
        this.targets.push(targetMenu);

      } else if (indexed_array[key].length === 1){
        let legendas_index = indexed_array[key][0];
        let target = new Target(menu_x, menu_y, t_size, legendas.getString(legendas_index, 1), legendas.getNum(legendas_index, 0), null);
        this.targets.push(target);
      }

      
      loopCounter++;

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
    let angle = atan2(mouse_y - this.y, mouse_x - this.x);
  
    // Ajusta o ângulo para o intervalo [0, TWO_PI]
    if (angle < 0) {
      angle += TWO_PI;
    }
    // Verifica se o ângulo está dentro do intervalo da fatia
    if (angle >= this.startAngle && angle <= this.endAngle) {
      // Calcula a distância entre o ponto de clique e o centro da fatia
      let distance = dist(mouse_x, mouse_y, this.x, this.y);
  
      // Verifica se a distância está dentro do raio da fatia
      return distance <= this.width / 2;
    } else {
      return false;
    }
  }
  
  // Draws the target (i.e., a circle)
  // and its label
  delete() {
    if (this.id === MENU_ID) {
      for (let i = 0; i < this.targets.length; i++) {
        this.targets[i].drawn = false;
      }
    }
    //else{
    this.drawn = false;
    //}
  }

  draw() {
    let is_menu= false;
    if (drawing !== this) {
      this.drawn = true;
      // Draw label 

      if (this.id === MENU_ID) {
        fill(color(100, 100, 100));
        arc(this.x, this.y, RADIUS, RADIUS, this.startAngle, this.endAngle, PIE);
        textFont("Serif", 40); //FIXME: mudar todas as letras para Serif
        is_menu = true;
      } else {
        fill(color(50, 50, 50));
        circle(this.x, this.y, this.width);
        textFont("Serif", 24); //FIXME: mudar todas as letras para Serif

      }

//      let upperLabel = this.label.substring(0,1).toUpperCase();
//      let rest = this.label.substring(1)
//      let finalLabel = upperLabel + rest;

      fill(color(255, 255, 255));
      textAlign(CENTER);
      if(!is_menu){
        text(this.label, this.x, this.y);
      }
      else{
        text(this.label.toUpperCase(), LABEL_POS * Math.cos(this.halfAngle) + CX, LABEL_POS * Math.sin(this.halfAngle) + CY);
      }
      
    }
    else {
      //background(color(0,0,0));        // sets background to black

      if (this.id === MENU_ID) {
        for (let i = 0; i < this.targets.length; i++) {
          this.targets[i].draw();
          //console.log("Loop do id === MENU_ID");
        }
      }
      else {
        //console.log("Drawing para o screen 1");
        drawing = "screen1";
      }
    }
  }
}