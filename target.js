// Target class (position and width)
var drawing = "screen1";
function drawCurrentScreen(){
  drawing.draw();
}

class Target
{
  constructor(x, y, w, l, id, array) // é preciso passar o isMenu? podemos assumir que se o id for MENU_ID entao é um menu?
  {
    this.x      = x;
    this.y      = y;
    this.width  = w;
    this.label  = l;
    this.id     = id;
    this.drawn  = false;
    this.array  = array;
    if (id == MENU_ID && this.label.length === 2)// FIXME se ainda só tem 2 letras(primeiro nivel de menu) pode fazer mais uma vez
    {
      let submenus_array = createMapSet(this.array, 3);
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
    if(dist(this.x, this.y, mouse_x, mouse_y) < this.width / 2)
    {
      if (drawing === "screen1") screen1remove();
      else{
        drawing.delete();
      }
      drawing = this;
      return true;
    }
    return false;
  }
  
  // Draws the target (i.e., a circle)
  // and its label
  delete(){
    for (let i = 0; i < /*a cada target dentro do menu"*/; i++){
      this.drawn = false;//FIXME nao é this tem que ser o indice para o target
    }
    
  }
  draw()
  {
    background(color(0,0,0));        // sets background to black

    this.drawn = true; //FIXME tem de ser loop para todos os targets
    // Draw target
    fill(color(155,155,155));                 
    circle(this.x, this.y, this.width);
    
    // Draw label
    textFont("Arial", 12);
    fill(color(255,255,255));
    textAlign(CENTER);
    text(this.label, this.x, this.y);
  }
}