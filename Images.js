import {SvgPlus, Vector} from './SvgPlus.js'
class ImageCanvas extends SvgPlus{
  constructor(background, path){
    super('div');
    this.class = "canvas";
    this.rel = this.createChild('div', {
      styles: {
        position: "relative"
      }
    })

    this._background =this.rel.createChild('img');
    this._path = path;

    this.background.props = {
      src: this.getPath(background),
      class: 'background'
    }
  }

  get path(){
    return this._path;
  }

  get background(){
    return this._background;
  }

  getPath(name){
    return this.path + '/' + name;
  }

  addImage(name, location, size){
    let image = new ImageIcon(this.getPath(name), location, size);
    this.rel.appendChild(image)
  }
}



class ImageIcon extends SvgPlus{
  constructor(path, location, size){
    super('img');
    this.props = {
      src: path,
      draggable: false
    }
    this.size = size;
    this.pos = location;
    this._s
  }

  onmousedown(){
    this._s = true;
  }
  onmouseleave(){
    this._s = false;
  }
  onmouseup(){
    this._s = false;
  }
  onmousemove(e){
    if (this._s) {
      let move = new Vector(e.movementX, e.movementY);
      move = move.div(this.parentNode.clientWidth).mul(100)
      this.pos = this.pos.add(move)
      console.log(`${this.pos.round(2)}`);
    }
  }

  set size(size){
    this._size = size;
    this.styles = {
      width: size + '%',
    }
  }

  get pos(){
    return this._pos;
  }

  set pos(location){
    if (!(location instanceof Vector)) return;
    this._pos = location
    this.styles = {
      position: 'absolute',
      top: location.y + '%',
      left: location.x + '%',
      transform: 'translate(-50%, -50%)'
    }
  }
}
export {ImageCanvas}
