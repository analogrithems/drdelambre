/**------------------------------------------------------------------------**\

	THE NAMESPACE!
	This is a collection of modules that i've crafted over the years
	for making large frontend engineering projects a lot easier.
	You can extend it by checking out the mixin function.

	By default, it comes with:
		$dd.type: unified type checking
		$dd.clone: pass by reference is too hard for junior devs 
		$dd.extend: smash objects together
		$dd.mixin: extend the namespace
		$dd.init: delay functionality until the dom is ready

	Checkout the modules folder for the fun stuff!
\**------------------------------------------------------------------------**/
;(function(global,factory){
	if(typeof define === 'function' && define.amd) {
		define([], function(){ return factory(global); });
	} else if (typeof exports === 'object') {
		module.exports = factory(global);
    } else {
		factory(global);
	}
})(typeof window !== "undefined" ? window : this, function(global){
	if(global.hasOwnProperty('$dd')){
		return global.$dd;
	}

	var self = {};

	// $dd.type:
	//		lets shrink some code. Calling without the type variable
	//		just returns the type, calling it with returns a boolean
	//		you can pass a comma seperated list of types to match against
	self.type = function(variable,type){
		var t = typeof variable,
			trap = false,
			more;

		if(t === 'object'){
			more = Object.prototype.toString.call(variable);
			if(more === '[object Array]'){
				t = 'array';
			} else if(more === '[object Null]'){
				t = 'null';
			} else if(more === '[object Date]'){
				t = 'date';
			} else if(more === '[object DOMWindow]' ||
					more === '[object Window]' ||
					more === '[object global]'){
				t = 'node';
			} else if(variable.nodeType){
				if(variable.nodeType === 1){
					t = 'node';
				} else {
					t = 'textnode';
				}
			}
		}

		if(!type){
			return t;
		}
		type = type.split(',');
		for(more = 0; more < type.length; more++){
			trap = trap || (type[more] === t);
		}
		return trap;
	};

	// $dd.mixin:
	//		This is how we extend the namespace to handle new functionality
	//		it'll overwrite crap, so be carefull
	self.mixin = function(obj){
		if(!self.type(obj,'object')){
			throw new Error('$dd.mixin called with incorrect parameters');
		}
		for(var ni in obj){
			if(/(mixin)/.test(ni)){
				throw new Error('mixin isn\'t allowed for $dd.mixin');
			}
			self[ni] = obj[ni];
		}
	};

	// $dd.init:
	//		Stores up function calls until the document.ready
	//		then blasts them all out
	if(typeof window !== "undefined" && typeof window.document !== "undefined"){
		self.init = (function(){
			var c = [],
				loaded = false,
				onload, ni;

			if(document.addEventListener){
				onload = function() {
					document.removeEventListener( "DOMContentLoaded", onload, false );
					loaded = true;

					for(ni = 0; ni < c.length; ni++){
						c[ni]();
					}
				};

			} else if(document.attachEvent){
				onload = function() {
					if(document.readyState === "complete"){
						document.detachEvent("onreadystatechange", onload);
						loaded = true;
						for(ni = 0; ni < c.length; ni++){
							c[ni]();
						}
					}
				};
			}

			if ( document.addEventListener ) {
				document.addEventListener( "DOMContentLoaded", onload, false );
			} else if ( document.attachEvent ) {
				document.attachEvent("onreadystatechange", onload);
			}

			return function(_f){
				if(loaded){
					_f();
				} else {
					c.push(_f);
				}
			};
		})();
	}

	// $dd.extend:
	//		throw a bunch of objects in and it smashes
	//		them together from right to left
	//		returns a new object
	self.extend = function(){
		if(!arguments.length){
			throw new Error('$dd.extend called with too few parameters');
		}

		var out = {},
			ni,no;

		for(ni = 0; ni < arguments.length; ni++){
			if(!self.type(arguments[ni],'object')){
				continue;
			}
			for(no in arguments[ni]){
				out[no] = arguments[ni][no];
			}
		}

		return out;
	};

	// $dd.clone:
	//		lets keep our data clean and seperated
	//		to prevent breakage and other functions from not being able to 
	//		refence the original array objects deep_clone is defaulted to false.
	self.clone = function(obj, deep_clone){
		var type = self.type(obj);
		if(!/^(object||array||date)$/.test(type)){
			return obj;
		}
		if(type === 'date'){
			return (new Date()).setTime(obj.getTime());
		}
		var copy,
			ni;
		if(type === 'array'){
			if(!deep_clone){
				return obj.slice(0);
			}
			copy = obj.slice(0);
			for(ni = 0; len = obj.length, ni < len; ni++){
				copy[ni] = clone(obj[ni], true);
			}
			return copy;
		}
		copy = {};
		for(ni in obj) {
			if(obj.hasOwnProperty(ni)){
				copy[ni] = self.clone(obj[ni]);
			}
		}

		return copy;
	};

	// $dd.expose:
	//		poluting global has some uses
	self.expose = function(obj,as){
		if(global.hasOwnProperty(as)){
			console.log('$dd.expose: Overwritting global variable [' + as + ']');
		}
		global[as] = obj;

		return self;
	};

	self.expose(self,'$dd');

	return self;
});
