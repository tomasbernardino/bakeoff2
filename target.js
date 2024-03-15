//FIXME: estas variaveis nao podem estar aqui!!!! TEM QUE ESTAR NO WINDOWRESIZED do sketch 
// Arranjar maneira de as passar para aqui ou simplementar algo parecido
// Target class (position and width)
let display        = new Display({ diagonal: display_size }, window.screen);
PPI                = display.ppi;                      // calculates pixels per inch
PPCM               = PPI / 2.54;                       // calculates pixels per cm
let screen_width   = display.width * 2.54;             // screen width
let screen_height  = display.height * 2.54;            // screen height
let target_size    = 2;                                // sets the target size (will be converted to cm when passed to createTargets)
let horizontal_gap = screen_width - target_size * GRID_COLUMNS;// empty space in cm across the x-axis (based on 10 targets per row)
let vertical_gap   = screen_height - target_size * GRID_ROWS;  // empty space in cm across the y-axis (based on 8 targets per column)

var drawing = "screen1"; // variável que vai ter o valor "screen1" se tiver a desenhar o primeiro menu, senão irá ser um objecto do tipo Targete
function drawCurrentScreen(){
  drawing.draw();
}

// Os targets tanto podem ser menus e abrir ecras com mais targets como podem ser targets normais que "voltam" para o ecra inicial ao clicar
// (no fundo sao todos menus na medida que todos abrem um novo ecra, mas so os targets finais é que contam para os hits/misses)
class Target
{
  constructor(x, y, w, l, id, array) 
  {
    this.x      = x;
    this.y      = y;
    this.width  = w;
    this.label  = l;
    this.id     = id;
    this.drawn  = false;
    this.array  = array;
    this.indexed_array = [];
    this.targets = [];
    if (id == MENU_ID && (this.label.length === 2 || this.label.length === 3))
    {
        this.createSubMenusOrTargets(this.array, 3, this.indexed_array);
    }
  }
  
  //Esta é a funcao quye pega no array das cidades e cria os submenus de acordo com os prefixos
  // Depois cria os targets ---- é aqui que se tem de mudar aspetos ao nivel do tamanho e posicionamento dos targets em cada submenu
  createSubMenusOrTargets(array, size, indexed_array){
    var r = 0;
    var c = 0;
    let t_size = target_size * PPCM;
    let h_gap = horizontal_gap * PPCM - 80;
    let v_gap = vertical_gap * PPCM - 80;
    let h_margin = h_gap / (GRID_COLUMNS -1);
    let v_margin = v_gap / (GRID_ROWS - 1);
    
    if(this.label.length === 2){                  //Quando ainda nao esta no ultimo menu cria os submenus de prefixos de 3                     
      for (let i = 0; i < array.length; i++) {
        let prefix = legendas.getString(array[i], 1).substring(0, size);
      
        if (!indexed_array[prefix]) {
            indexed_array[prefix] = [];
        }
        indexed_array[prefix].push(array[i]);
      }
      console.log("Prefix Array:", indexed_array);
    }
    else{                                           //Quando ja esta no ultimo menu so copia o nome das cidades
      for (let i = 0; i< array.length; i++){
        let city = legendas.getString(array[i], 1);
        if (!indexed_array[city]) {
          indexed_array[city] = [];
        }
        indexed_array[city].push(array[i]);
      }
      console.log("Indexed Array:", indexed_array);
    }

    for (key in indexed_array){                               //Cria os targets, se no arrayindexado aquela key so tiver uma cidade entao cria um target normal, 
      //console.log("Key:",key, "Value:", indexed_array[key]);//se tiver mais que uma cidade cria um submenu com o prefixo
      let target_x = 40 + (h_margin + 2) * c + t_size/2;        // give it some margin from the left border
      let target_y = (v_margin + 2) * r + t_size/2;
      
      if (indexed_array[key].length > 1){
        let targetMenu = new Target(target_x, target_y+ 40, t_size, key, MENU_ID, indexed_array[key]);
        this.targets.push(targetMenu);
      }
      else{
        let legendas_index = indexed_array[key][0];
        let target = new Target(target_x, target_y + 40 , t_size,legendas.getString(legendas_index,1), legendas.getNum(legendas_index,0), null);
        this.targets.push(target);
      }
      if (c < GRID_COLUMNS -1) c++; //Serve para iterar pela grid como estava no layout inicial
      else{c = 0; r++;}
      if (r > GRID_ROWS) break;
    }
  } 

  compareLabel(target){
    return this.label === target.label
  }

  // Sets the draw state of a target
  setDrawn(state)
  {
    this.drawn = state;
  }
  getID(){
    return this.id;
  }

  getDrawn()
  {
    return this.drawn;
  }

  getMenu()
  {
    return this.menu;
  }

  getLabel()
  {
    return this.label;
  }
  
  // Checks if a mouse click took place
  // within the target
  clicked(mouse_x, mouse_y)
  {
    console.log("Mouse_x:", mouse_x, "Mouse_y:", mouse_y, "X:", this.x, "Y:", this.y, "Width:", this.width);
    return dist(this.x, this.y, mouse_x, mouse_y) < this.width / 2;
  }
  
  // Draws the target (i.e., a circle)
  // and its label
  delete(){
    if(this.id === MENU_ID){
      for (let i = 0; i < this.targets.length; i++){
        this.targets[i].drawn = false;
      }
    }
    //else{
      this.drawn = false;
    //}
  }

  draw()
  {
    if(drawing !== this){
      this.drawn = true;
      // Draw label 
      fill(color(155,155,155));                
      circle(this.x, this.y, this.width);

      textFont("Arial", 12); //FIXME: mudar todas as letras para Serif
      fill(color(255,255,255));
      textAlign(CENTER);
      text(this.label, this.x, this.y);
    }

    else {
      
      //background(color(0,0,0));        // sets background to black
      
      if(this.id === MENU_ID){
        for (let i = 0; i < this.targets.length; i++){
          this.targets[i].draw();
          //console.log("Loop do id === MENU_ID");
        }
      }
      else{ 
        //console.log("Drawing para o screen 1");
        drawing = "screen1";
      }
    }
  }
}