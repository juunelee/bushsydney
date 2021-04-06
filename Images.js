import {SvgPlus, Vector} from './SvgPlus.js'

let draggable = false;
// let text = new SvgPlus('div')
// text.props =  {
//   position: 'fixed',
//   top: '0%',
//   left: '0%'
// }
// document.body.appendChild(text);

class ImageSite extends SvgPlus{
  constructor(data, splashscreen){
    super('div');
    this.class = "canvas";

    this._loading = 0;
    this.splashscreen = splashscreen;

    this.createSites(data);

    this.showPage('home');


    window.onpopstate = () => {
      this.navigate();
    }
    this.navigate();

    if (this.isMobile) {
      window.onresize = () => {
        this.resize();
      }
      this.resize();
    }
  }

  get isMobile(){
      const toMatch = [
          /Android/i,
          /webOS/i,
          /iPhone/i,
          /iPad/i,
          /iPod/i,
          /BlackBerry/i,
          /Windows Phone/i
      ];

      return toMatch.some((toMatchItem) => {
          return navigator.userAgent.match(toMatchItem);
      });
  }

  get isLandScape(){
    return window.innerWidth > window.innerHeight;
  }

  resize(){
    if (this.isLandScape){
      this.setAttribute('style', '');
    }else{

      this.styles = {
        'transform-origin': '0% 0%',
        transform: 'rotate(90deg) translate(0%, -100%)',
        position: 'fixed',
        top: '0',
        left: 0,
        'overflow-y': 'hidden',
        height: '100vw',
        width: window.innerHeight+'px'
      }
      // this.scrollTo(0, 0);
    }
  }

  navigate(){
    let location = window.location.hash.replace('#/', '').replace('%20', ' ');
    if (location.length == 0) {
      this.showPage('home');
    }
    this.showPage(location)
  }

  showPage(key){
    if (!(key in this._pages)) return;

    this.innerHTML = "";

    this.appendChild(this.getPage(key))
  }

  getPage(key){
    return this._pages[key];
  }

  async loadComplete(){
    // await splashscreen.completion();
    splashscreen.fade(500)
  }


  addPage(key, pageData){
    if (!this._pages) this._pages = {};
    this._loading++;

    let page = new ImageCanvas(pageData);
    page.onallload = () => {
      this._loading--;
      if (this._loading == 0) {
        this.loadComplete();
      }
    }
    this._pages[key] = page;
  }

  createSites(data){
    for (var key in data){
      this.addPage(key, data[key])
    }
  }
}

class ImageCanvas extends SvgPlus{
  constructor(data){
    super('div');
    this._loading = 0;
    this.styles = {
      position: "relative"
    }
    this._background =this.createChild('img');
    this._path = data.path;

    this.background.props = {
      src: this.getPath(data.background),
      class: 'background'
    }
    this.addIcons(data.icons)
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

  addIcons(icons){
    for (var icon of icons) {
      this.addImage(icon);
    }
  }

  addImage(icon){
    this._loading++;
    let image = new ImageIcon(this.getPath(icon.name), icon.location, icon.size, icon.link);
    image.onload = () => {
      this._loading--;
      if (this._loading == 0 && this.onallload instanceof Function) {
        this.onallload();
      }
    }
    this.appendChild(image)
  }
}
class ImageIcon extends SvgPlus{
  constructor(path, location, size, link){
    super('img');
    this.class = "image-icon"
    this.link = link;
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
    if (this._s && draggable) {
      let move = new Vector(e.movementX/this.parentNode.clientWidth, e.movementY/this.parentNode.clientHeight);
      move = move.mul(100)
      this.pos = this.pos.add(move)
      console.log(`${this.pos.round(2)}`);
    }
  }

  set link(link){
    this._link = link;
  }
  get link(){
    return this._link;
  }

  onclick(){
    if (typeof this.link === 'string') {
        let a = new SvgPlus('a');
        a.props = {href: this.link}
        a.click();
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
    if (!(location instanceof Vector)) {
      let split = location.replace(' ', '').split(',')
      location = new Vector(split[0], split[1]);
    }
    this._pos = location
    this.styles = {
      position: 'absolute',
      top: location.y + '%',
      left: location.x + '%',
      transform: 'translate(-50%, -50%)'
    }
  }
}
export {ImageSite}
