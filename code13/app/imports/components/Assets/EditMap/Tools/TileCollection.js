"use strict";
import TileSelection from "./TileSelection.js";
// TODO: add some sort of index - to quickly access tile by coords;

// for some reason babel don't want to extend Array.....
export default class TileCollection {
  constructor(...args){
    Array.call(this, ...args);
  }
};

TileCollection.prototype = Object.create(Array.prototype);

TileCollection.prototype.pushUnique = function(id){
  if(this.indexOf(id) === -1){
    this.push(id);
  }
};
TileCollection.prototype.remove = function(tileSelection){
  const index = this.indexOf(tileSelection);
  if(index > -1){
    this.splice(index, 1);
  }
};
TileCollection.prototype.pushOrRemove = function(tileSelection){
  const index = this.indexOf(tileSelection);
  if(index === -1){
    this.push(tileSelection);
  }
  else{
    this.remove(tileSelection);
  }
};

TileCollection.prototype.clear = function(){
  this.length = 0;
};

TileCollection.prototype.random = function(){
  return this[Math.floor(Math.random() * this.length)];
};

TileCollection.prototype.indexOf = function(another){
  return this.indexOfGid(another.gid);
};

TileCollection.prototype.indexOfGid = function(gid){
  let index = -1;
  for(let i=0; i<this.length; i++){
    if(this[i].gid == gid){
      index = i;
      break;
    }
  }
  return index;
};
TileCollection.prototype.debug = function(){
  console.log(this.x, this.y, this.gid);
};
