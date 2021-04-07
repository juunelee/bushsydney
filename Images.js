import {SvgPlus, Vector} from './SvgPlus.js'

let draggable = false;

// edit

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
      this.scaleIconSize(1.2)

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
    let background = this.getPage('home').background
    if (this.isLandScape){
      this.getPage('home').setAttribute('style', '');
      background.setAttribute('style', '');
      this.setAttribute('style', '');
      this.currentPage.background.setAttribute('style', '');
    }else{

      this.styles = {
        'transform-origin': '0% 0%',
        height: window.innerWidth+ 'px',
        width: window.innerHeight+ 'px',
        transform: 'rotate(90deg) translate(0%, -100vw)',
      }

      this.currentPage.background.styles = {
        width: window.innerHeight+ 'px',
      }

      this.getPage('home').styles = {
        height: '100vw',
        width: `177vw`,
      }
      background.styles = {
        height: '100vw',
        width: 'auto'
      }
    }
  }

  scaleIconSize(size){
    let recur = (elem) => {
      for (var child of elem.children) {
        if (SvgPlus.is(child, ImageIcon) && child.iconData && child.iconData.scale !== 'noscale') {
          child.sizeScale = size;
        }else{
          recur(child);
        }
      }
    }
    recur(this.getPage('home'));
  }

  navigate(){
    let location = window.location.hash.replace('#/', '').replace('%20', ' ');
    if (location.length == 0) {
      this.showPage('home');
    }
    this.showPage(location);
    if (this.isMobile) {
      this.resize();
    }
  }

  showPage(key){

    if (!(key in this._pages)) return;
    // this.currentPage.background.setAttribute('style', '');

    this.currentPage = this.getPage(key);
    this.innerHTML = "";

    this.appendChild(this.currentPage);
  }

  getPage(key){
    return this._pages[key];
  }

  async loadComplete(){
    await splashscreen.completion();
    splashscreen.fade(500)
  }


  addPage(key, pageData){
    if (!this._pages) this._pages = {};
    this._loading++;

    let page = new ImageCanvas(pageData);
    page.onallload = () => {
      this._loading--;
      if (this._loading == 0) {
        // this.loadComplete();
      }
      if (key === 'home'){
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
    this.class = "canvas-relative"
    this._background = this.createChild('img');
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
    let image = new ImageIcon(this.getPath(icon.name), icon.location, icon.size, icon.link, icon);
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
  constructor(path, location, size, link, icon){
    super('img');
    this.class = "image-icon"
    this.iconData = icon;
    this._sizeScale = 1;
    this._preSizeScale = 1;
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

  async grow(value){
    await this.waveTransistion((p) => {
      this._preSizeScale = p*0.2 + 1
      this.size = this.size;
    }, 500, value);
  }

  async hover(){
    if (this.moving === true) return;
    this.moving = true;

    await this.grow(true);
    let res = null;
    if (this.mouseover === true){
      res = await this.waitForEvent('mouseleave');
    }

    if (res !== 'removed'){
      await this.grow(false);
    }else{
      this._preSizeScale = 1;
      this.size = this.size;
      this.mouseover = false;
    }

    this.moving = false;
    if (this.mouseover === true){
      this.hover();
    }
  }

  onmouseover(){
    this.mouseover = true;
    this.hover();
  }

  onmouseleave(){
    this.mouseover = false;
  }

  async waitForEvent(eventName){
    return new Promise((resolve, reject) => {
      let done = false;
      let checkRemoved = () => {
        if (!done && document.body.contains(this)){
          setTimeout(() => {
            checkRemoved();
          }, 50)
        }else {
          done = true;
          resolve('removed');
        }
      }

      this.addEventListener(eventName, (e) => {
        done = true;
        resolve(e)
      });


      checkRemoved();

    });
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

  set sizeScale(scale){
    if (typeof scale !== 'number' || Number.isNaN(scale)) return;
    this._sizeScale = scale;
    this.size = this.size;
  }

  get sizeScale(){
    return this._sizeScale;
  }

  get preSizeScale(){
    return this._preSizeScale;
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
      width: size*this._sizeScale*this._preSizeScale + '%',
    }
  }

  get size(){
    return this._size;
  }

  get pos(){
    return this._pos;
  }

  set pos(location){
    if (!(location instanceof Vector)) {
      let split = location.replace(' ', '').split(',')
      location = new Vector(split[0], split[1]);
    }
    this._pos = location;


    this.styles = {
      position: 'absolute',
      top: location.y + '%',
      left: location.x + '%',
      transform: 'translate(-50%, -50%)'
    }

  }
}
export {ImageSite}
