"use strict";
this.Otito = function(obj, meta, cb = void(0), options = Otito.options, parent = void(0)) {
	this.object = obj || {};
	this.meta = meta || JSON.parse(JSON.stringify(obj || {}));
	this.parent = parent || this;
	this.callback = cb;

	this.record = {};
	this._meta = {};
	
	if(options && options != Otito.options){
		this.options = Object.create(Otito.options);
		for(var i in options){
			this.options[i] = options[i];
		}
	}
	
	this.html = document.createElement("div");
	this.html.className = this.options.mainClassName;

  if(this.meta){
    this._parse();
  }
};
this.Otito.FLAGS = {
	HEADLESS: 1 << 0,
	DYNAMIC: 1 << 1
};
this.Otito.options = {
	precision: 10000,
	arrayClassName: "array",
	
	mainClassName: "compact",
	
	headTagName: "div",
	headClassName: "title",
	
	folderTagName: "div",
	folderClassName: "ui accordion",
	folderOpenClassName: "active",
	
	labelTagName: "div",
	labelClassName: "column label",

	inputWrapperClassName: "ui input fluid",

	removeLinkClassName: "delete",
	
	headlessClassName: "headless"
};
this.Otito.type = {
	bool: "bool", boolean: "boolean",
	
	int: "int", uint: "uint",
	
	float: "float", number: "number",
	
	text: "text", string: "string",
	textarea: "textarea",
	
	color: "color",
	
	list: "list",
	array: "array",
	
	upload: "upload",
	hidden: "hidden",
	
	link: "link",
	folder: "folder"
};
this.Otito.prototype = {
	options: Otito.options,
	append: function(parent){
		if(this.html.parentNode && this.html.parentNode != parent) {
			parent.removeChild(this.html);
		}
		if(!this.html.parentNode){
			parent.appendChild(this.html);
		}
	},
	update: function(object, meta){
		if(object != void(0)){
			this.object = object;
		}
		
		if(meta !== void(0) && meta != this.meta) {
			this._meta = this.meta;
			this.meta = meta;
			this._cleanup();
		}
		
		this._parse();
	},
	
	_parse: function(){
		if(!this.meta){
			console.warn("Meta is empty - nothing to do!");
			return;
		}
		this._normalizeMeta(this, "meta");
		this._updateHTML();
		if(this._meta){
			this._cleanup();
		}
	},
	
	_basicToMeta: function(obj, meta){
		var val = obj[meta];
		obj[meta] = {
			_type: typeof obj[meta],
			value: val
		};
		return obj[meta];
	},
	_normalizeMeta: function(obj, meta){
		var type = typeof obj[meta];
		
		var make;
		if(type == "string"){
      obj[meta] = {
        _type: obj[meta]
      };
    }
		if(type == "function") {
			obj[meta]._make = obj[meta];
		}
		
		if(typeof obj[meta]._make === "function"){
			make = obj[meta]._make;
			obj[meta] = make(this, this.parent.object);
			
			if(!obj[meta]._make){
				obj[meta]._make = make;
			}
		}
		
		if( !(obj[meta] instanceof Object) ){
			obj[meta] = this._basicToMeta(obj, meta);
			return;
		}
		
		var keys = Object.keys(obj[meta]);
		var submeta, key;
		for(var i=0; i<keys.length; i++){
			key = keys[i];
			if(key == "_type" || key == "_make"){
				break;
			}
			if(key.substring(0, 2) == "__"){
				continue;
			}
			this._normalizeMeta(obj[meta], key);
			submeta = obj[meta][key];
			type = typeof submeta;
			// simple values
			if(type != "object") {
				if(key.substring(0, 2) == "__"){
					continue;
				}
				obj[meta][key] = {
					_type: type,
					value: submeta
				};
			}
		}
	},
	
	_updateHTML: function(){
		// final member
		var metatype = this.meta._type;
		if(metatype){
			if(metatype == Otito.type.array){
				this._buildArray();
				return;
			}
			if(metatype == Otito.type.hidden){
				return;
			}
		}

		var keys = Object.keys(this.meta);
		var meta, key, f, i;
		for(i=0; i<keys.length; i++){
			key = keys[i];
			
			// definition key
			if(key == "_type" || key == "_make"){
				continue;
			}
			// command keys
			if(key.substring(0, 2) == "__"){
				continue;
			}

			meta = this.meta[key];
			
			/* workaround for folders - as they don't get pass _type checks */
			if(! (meta instanceof Object) ){
				meta = this._basicToMeta(this.meta, key);
			}
			
			// maybe simple values
			if(meta._type){
				
				if(meta._type == "folder"){
					f = this._updateObjectRecord(meta.content, key, this.object);
					var cls = (this.options.folderClassName + " " + (meta.className ? meta.className : "") + " " + (meta.__className ?  meta.__className : "")).split(" ");
					cls.forEach((c) => {c && f.body.classList.add(c);});
					//f.body.className
					if(meta.contentClassName && f.input.html.className.indexOf(meta.contentClassName) == -1){
							f.input.html.className += " " + meta.contentClassName;
					}
					this._enableFolderToggle(f, meta);
					if(meta.open){
						f.body.classList.add(this.options.folderOpenClassName);
					}
					continue;
				}
				if(meta._type == "array"){
					this._addArray(meta, key);
					continue;
				}
				
				if(meta._type == "hidden"){
					this._updateInputRecord(meta, key);
					continue;
				}
				
				if(this.object[key] === void(0)){
					if(typeof this.object != "object"){
						this.object = {};
					}
					this.object[key] = meta.value;
				}
				this._updateInputRecord(meta, key);
				continue;
			}
			
			if(Array.isArray(meta)){
				console.log("ARRAY");
			}
			else {
				if (this.object[key] == void(0)) {
					this.object[key] = {};
				}
				f = this._updateObjectRecord(meta, key, this.object[key]);
				f.body.className = this.options.folderClassName + " " + meta.__className;
				this._enableFolderToggle(f, meta);
			}
		}
		
		var next = 0;
		for(i=0; i<keys.length; i++) {
			key = keys[i];
			f = this.record[key];
			if(!f){
				continue;
			}
			
			// definition key
			if(key == "_type" || key == "_make"){
				continue;
			}
			
			// command keys
			if(key.substring(0, 2) == "__"){
				continue;
			}
			
			var out = f.body;
			var index = Array.prototype.indexOf.call(out.parentNode.children, out);
			if(next != index){
				var par = out.parentNode;
				par.removeChild(out);
				var c = par.children[next];
				par.insertBefore(out, c);
			}
			next++;
		}

	},
	
	_enableFolderToggle: function(f, meta){
		var that = this;
		f.head.onclick = function(){
			meta.open = f.body.classList.toggle(that.options.folderOpenClassName);
      f.head.classList.toggle(that.options.folderOpenClassName);
      if(f.input.html){
        f.input.html.classList.toggle(that.options.folderOpenClassName);
      }
      //console.log(f);
		};
	},
	_buildArray: function(){
		var i, that = this, push, rec, del;
		this._normalizeMeta(this.meta, "array");
		for(i=0; i<this.object.length; i++){
			rec = this._updateObjectRecord(this.meta.array, i, this.object[i], Otito.FLAGS.DYNAMIC | Otito.FLAGS.HEADLESS);
		}
		var keys = Object.keys(this.record);
		for( ; i<keys.length; i++){
			rec = this.record[i];
			if(!rec){
				continue;
			}
			rec.body.parentNode.removeChild(rec.body);
			delete this.record[i];
		}
		
		push = this.record["push"];
		if(push){
			this.html.appendChild(push.body);
		}
		
		rec = this._updateObjectRecord({
			push: {
				_type: "link",
				headless: true,
				label: "Add More",
				action: function(){
					var newItem = that._objectFromMeta(that.meta.array);
					that.object.push(newItem);
					that.html.removeChild(rec.body);
					if(that.meta.onchange){
						that.meta.onchange(that, that.parent.object);
					}
					that.update();
					that.html.appendChild(rec.body);
				}
			}
		}, "push", null, Otito.FLAGS.HEADLESS);
		rec.body.className="add-more";
		rec.input.html.className = "";
		console.log(rec);
	},
	
	_addArray: function(meta, key){
		if(!this.object[key]){
			this.object[key] = [];
		}
		var rec = this._updateObjectRecord(meta, key, this.object[key]);
		this._addClass(rec.body, this.options.folderClassName + " " + this.options.arrayClassName);
		this._enableFolderToggle(rec, meta);
	},
	_addClass: function(el, cls){
		var cla = cls.split(" ");
		cla.forEach(function(v){
			el.classList.add(v.toString().trim());
		});
	},
	_updateObjectRecord: function(meta, key, object, flags){
		if(typeof object != "object"){
			return this._updateInputRecord(meta, key, flags);
		}
		var r;
		if(meta._type == "hidden"){
			r = this.record[key];
			if(r && r.body){
				r.body.style.setProperty("display", "none");
			}
			return;
		}
		else{
			r = this.record[key];
			if(r && r.body){
				r.body.style.removeProperty("display");
			}
		}
		
		r = this.record[key] || {};
		
		
		r.body = r.body || document.createElement("div");
		r.input = this._updateChild(meta, key, r.input, object);
		if(!(flags & Otito.FLAGS.HEADLESS) && !meta.headless){
			r.head = this._createHead(r.head, meta, key);
		}
		else{
			r.body.classList.add(this.options.headClassName);
		}
		if(flags & Otito.FLAGS.DYNAMIC){
			r.del = this._createDelete(r.del, meta, key);
		}
		
		if(!this.record[key]){
			if(!(flags & Otito.FLAGS.HEADLESS) && !meta.headless){
				r.body.appendChild(r.head);
			}
			r.body.appendChild(r.input.html);
			this.html.appendChild(r.body);
			if(flags & Otito.FLAGS.DYNAMIC){
				r.body.appendChild(r.del);
			}
		}
		
		this.record[key] = r;
		return r;
	},
	_createHead: function(oldHead, meta, key){
		var head;
		if(oldHead){
				head = oldHead;
		}
		else {
				head = document.createElement(this.options.headTagName);
				head.className = this.options.headClassName;
		}

		head.innerHTML = meta.head || key;
		head.setAttribute("title", key);
		return head;
	},
	_createDelete: function(oldDel, meta, key){
		var that = this;
		var del = oldDel || document.createElement("a");
		del.index = key;
		del.className = this.options.removeLinkClassName;
		del.onclick = function(){
			that.object.splice(key, 1);
			that.update();
		};
		return del;
	},
	_updateInputRecord: function(meta, key, flags){
		var r;
		if(meta._type == "hidden"){
			r = this.record[key];
			if(r && r.body){
				r.body.style.setProperty("display", "none");
			}
			return r;
		}
		else{
			r = this.record[key];
			if(r && r.body){
				r.body.style.removeProperty("display");
			}
		}
		
		r = this.record[key] || {};
		
		
		r.body = r.body || document.createElement(this.options.labelTagName);
		r.body.className = this.options.labelClassName;
		
		r.input = this._updateInput(meta, key, r.input);
		if(!meta.headless && !(flags & Otito.FLAGS.HEADLESS)){
			r.head = this._createHead(r.head, meta, key);
		}
		else{
			r.body.classList.add(this.options.headlessClassName);
		}
		
		if(flags & Otito.FLAGS.DYNAMIC){
			r.del = this._createDelete(r.del, meta, key);
		}
		
		if(!this.record[key]){
			if(!meta.headless  && !(flags & Otito.FLAGS.HEADLESS)){
				r.body.appendChild(r.head);
			}
			
			r.body.appendChild(r.input);
			this.html.appendChild(r.body);
			if(flags & Otito.FLAGS.DYNAMIC){
				r.body.appendChild(r.del);
			}
		}
		this.record[key] = r;
		return r;
	},
	_updateInput: function(meta, key, oldInput){
		var input = oldInput;
		
		if(input != void(0)){
			// changed type of simple input
			if(meta._type != input.meta._type){
				input = this._createInput(meta);
				var par = oldInput.html ? oldInput.html : oldInput;
				par.parentNode.insertBefore(input, par);
				par.parentNode.removeChild(par);
			}
			// changed otito to simple input
			else if(input.html){
				input = this._createInput(meta);
				if(this.object[key] instanceof Object){
					this.object[key] = meta.value;
				}
				oldInput.html.parentNode.insertBefore(input, oldInput.html);
				oldInput.html.parentNode.removeChild(oldInput.html);
			}
		}
		else{
			input = this._createInput(meta);
		}
		
		if(!input.input.setValue){
			input.input.setValue = this._setValue;
		}
		var that = this;
		input.input.setValue(that._normalizeInput(meta, this.object[key]));
		input.input.otito = this;
		input.input.onchange = input.input.oninput = function(e){
      e.preventDefault();
			if(this.type == "checkbox"){
				this.value = this.checked;
			}
			this.setValue(this.value, e);
			if(this.value == that._normalizeInput(meta, this.otito.object[key])){
				return;
			}
			input.oldValue = this.otito.object[key];
			this.otito.object[key] = this.otito._normalizeInput(meta, this.value);
			if(meta.onchange && meta.onchange(this, this.otito) === false){
				this.setValue(this.otito.object[key]);
			}
			if(this.otito.callback){
				this.otito.callback(this.otito, this.otito.object);
			}
		};
    if(meta._className && input.className.indexOf(meta._className) == -1){
      input.className += " " + meta._className;
    }
		return input;
	},
	_updateChild: function(meta, key, oldChild, objectIn){
		
		var object = objectIn || this.object[key];
		var otito = oldChild || new Otito(object, meta, this.callback, this.options, this.parent);
		if(otito == oldChild){
			// was input but now it's object
			if(!otito.update){
				if(!(this.object[key] instanceof Object)){
					this.object[key] = {};
				}
				otito = new Otito(object, meta,  this.callback, this.options, this.parent);
				otito.parent = this.parent;
				oldChild.parentNode.insertBefore(otito.html, oldChild);
				oldChild.parentNode.removeChild(oldChild);
				
			}
			else{
				otito.update(object, meta);
			}
		}
		return otito;
	},
	_setValue: function(val){
		this.value = val;
	},
	_getInputType: function(meta){
		switch(meta._type) {
			case Otito.type.textarea: {
				return "textarea";
			} break;
			case Otito.type.list: {
				return "select";
			} break;
		}
		return "input";
	},
	_createInput: function(meta){
		var input, i, k;
		var that = this;
		switch(meta._type) {
			case Otito.type.bool:
			case Otito.type.boolean:
			{
				input = document.createElement("input");
				input.type = "checkbox";
				input.setValue = function (val){
					this.checked = val;
					this.value = val;
				};
			}
				break;
			case Otito.type.float:
			case Otito.type.number:
			case Otito.type.int:
			case Otito.type.uint:
			{
				input = document.createElement("input");
				if(meta.min){ input.min = meta.min;}
				if(meta.max){ input.max = meta.max;}
				if(meta.step){ input.step = meta.step;}
				input.type = "number";
			} break;
			case Otito.type.text:
			case Otito.type.string:{
				input = document.createElement("input");
			} break;
			case Otito.type.textarea: {
				input = document.createElement("textarea");
			} break;
			case Otito.type.link: {
				input = document.createElement("a");
				input.onclick = function(e){
					meta.action(that, that.parent, e);
				};
				input.innerHTML = meta.label || JSON.stringify(meta);
			} break;
			
			case Otito.type.upload: {
				input = document.createElement("input");
				input.type = "file";
				if(meta.accept){
					input.setAttribute("accept", meta.accept);
				}
				input.onchange = function(e){
					meta.action(that, that.parent, e);
				};
				input.setValue = function(val, e){
					if(e){
						meta.action(that, that.parent, e);
					}
					else{
						this.value = "";
					}
				}
			} break;
			case Otito.type.color: {
				input = document.createElement("input");
				input.type = "color";
			} break;
			case Otito.type.list:{
				input = document.createElement("select");
				var opt, item;
				if(Array.isArray(meta.list)){
					for(i=0; i<meta.list.length; i++){
						opt = document.createElement("option");
						item = meta.list[i];
						if(typeof item != "object"){
							opt.innerHTML = item;
							opt.value = item;
						}
						else{
							if(item.value != void(0) && item.label != void(0)){
								opt.innerHTML = item.label;
								opt.value = item.value;
							}
							else{
								var keys = Object.keys(item);
								opt.value = item[keys[0]];
								opt.innerHTMl = keys[0];
							}
						}
						input.appendChild(opt);
					}
				}
				else{
					for(k in meta.list){
						opt = document.createElement("option");
						opt.innerHTML = meta.list[k];
						opt.value = k;
						input.appendChild(opt);
					}
				}
			} break;
			default: {
				input = input = document.createElement("input");
				input.type = meta._type;
			} break;
		}
		
		var inputType = this._getInputType("meta");
		
		var wrapper = document.createElement("div");
		wrapper.className = this.options.inputWrapperClassName;
		wrapper.input = input;
		
		wrapper.meta = {};
		for(var k in meta){
			wrapper.meta[k] = meta[k];
		}
		
		if(meta.className){
			input.className = meta.className;
		}
		
		wrapper.appendChild(input);
		return wrapper;
	},
	_normalizeInput: function(meta, value){
		var val;
		if(value == void(0)){
			val = meta.value;
		}
		else{
			val = value;
		}
		
		switch(meta._type){
			case Otito.type.bool:
			case Otito.type.boolean:
				if(val === "true"){
					return true;
				}
				if(val === "false"){
					return false;
				}
				
				return !!val;
			
			case Otito.type.int:
			case Otito.type.uint:
				return parseInt(val,10) || 0;
			
			case Otito.type.float:
			case Otito.type.number:
				return Math.round(parseFloat(val)*this.options.precision)/this.options.precision || 0;
			
			case Otito.type.text:
			case Otito.type.string:
			case Otito.type.textarea:
				if(val != void(0)){
					return val+"";
				}
				return meta.value || "";
			
			case Otito.type.color:
				return val || "#FFFFFF";
			
			case Otito.type.list:
				var tmp = parseInt(val)
				if(isNaN(val) || tmp+"" != val){
					return val;
				}
				else{
					return tmp;
				}
		}
		return val;
	},
	_objectFromMeta: function(meta){
		if(typeof meta != "object"){
			return meta;
		}
		if(meta._type){
			return meta.value;
		}
		var out = {}, type;;
		for(var i in meta){
			type = meta[i]._type;
			if(type == void(0)){
				out[i] = this._objectFromMeta(meta[i]);
			}
			if(type == Otito.type.folder){
				continue;
			}
			if(meta[i].value != void(0)){
				if(typeof meta[i].value == "object"){
					out[i] = this._objectFromMeta(meta[i]);
				}
				out[i] = meta[i].value;
			}
		}
		return out;
	},
	_cleanup: function(){
		var rec;
		for(var i in this._meta){
			if(this.meta[i] == void(0)){
				rec = this.record[i];
				if(rec && rec.body){
					rec.body.parentNode.removeChild(rec.body);
				}
				delete this.record[i];
			}
		}
	}
};

Otito.selfTest = () => {
  var test = {
    width: 20,
    height: 20,
    numbers: [1, 2, 3]
  };
  let nextVal = 3;
  var metatest = {
    width: {
      _type: Otito.type.int
    },
    numbers: {
      _type: "array",
      array: () => {return {
        _type: "number",
        value: nextVal++
      }}
    }
  };

  window.x = new Otito(test, metatest);
  window.x.append(document.body);
  x.html.className = "main";

  window.x.update();
};
