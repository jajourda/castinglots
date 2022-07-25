/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*##########################################*/

//fragments

/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*##########################################*/


	// Helper vars and functions.
	function extend( a, b ) {
		for( var key in b ) {
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	// From https://davidwalsh.name/javascript-debounce-function.
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	// Check if clip-path is supported. From http://stackoverflow.com/a/30041538.
	function areClipPathShapesSupported() {
		var base = 'clipPath',
			prefixes = [ 'webkit', 'moz', 'ms', 'o' ],
			properties = [ base ],
			testElement = document.createElement( 'testelement' ),
			attribute = 'polygon(50% 0%, 0% 100%, 100% 100%)';

		// Push the prefixed properties into the array of properties.
		for ( var i = 0, l = prefixes.length; i < l; i++ ) {
			var prefixedProperty = prefixes[i] + base.charAt( 0 ).toUpperCase() + base.slice( 1 ); // remember to capitalize!
			properties.push( prefixedProperty );
		}

		// Iterate over the properties and see if they pass two tests.
		for ( var i = 0, l = properties.length; i < l; i++ ) {
			var property = properties[i];

			// First, they need to support clip-path (IE <= 11 does not)...
			if ( testElement.style[property] === '' ) {

				// Second, we need to see what happens when we try to create a CSS shape...
				testElement.style[property] = attribute;
				if ( testElement.style[property] !== '' ) {
					return true;
				}
			}
		}
		return false;
	};

	// From http://www.quirksmode.org/js/events_properties.html#position
	function getMousePos(e) {
		var posx = 0, posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return { x : posx, y : posy }
	}

	// Returns a random number between min and max (inclusive).
	function getRandom(min, max) {
		return Math.random() * (max - min + 1) + min;
	}

	// Check for clip-path support.
	const isClipPathSupported = areClipPathShapesSupported();

	/**
	 * FragmentsFx obj.
	 */
	function FragmentsFx(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		// Preload the element´s background image.
		var self = this;
		imagesLoaded(this.el, { background: true }, function() { self._init(); });
	}

	/**
	 * FragmentsFx default options.
	 */
	FragmentsFx.prototype.options = {
		// Number of fragments.
		fragments: 25,
		// The boundaries of the fragment translation (pixel values).
		boundaries: {x1: 100, x2: 100, y1: 50, y2: 50},
		// The area of the fragments in percentage values (clip-path).
		// We can also use random values by setting options.area to "random".
		area: 'random',
		/* example with 4 fragments (percentage values)
		 [{top: 80, left: 10, width: 3, height: 20},{top: 2, left: 2, width: 4, height: 40},{top: 30, left: 60, width: 3, height: 60},{top: 10, left: 20, width: 50, height: 6}]
		 */
		// If using area:"random", we can define the area´s minimum and maximum values for the clip-path. (percentage values)
		randomIntervals: {
			top: {min: 0,max: 90},
			left: {min: 0,max: 90},
			// Either the width or the height will be selected with a fixed value (+- 0.1) for the other dimension (percentage values).
			dimension: {
				width: {min: 10,max: 60, fixedHeight: 1.1},
				height: {min: 10,max: 60, fixedWidth: 1.1}
			}
		},
		parallax: false,
		// Range of movement for the parallax effect (pixel values).
		randomParallax: {min: 10, max: 150}
	};

	/**
	 * Init. Create the layout and initialize/bind events.
	 */
	FragmentsFx.prototype._init = function() {
		// The dimensions of the main element.
		this.dimensions = {width: this.el.offsetWidth, height: this.el.offsetHeight};
		// The source of the main image.
		this.imgsrc = this.el.style.backgroundImage.replace('url(','').replace(')','').replace(/\"/gi, "");;
		// Render all the fragments defined in the options.
		this._layout();
		// Init/Bind events
		this._initEvents();
	};

	/**
	 * Init/Bind events.
	 */
	FragmentsFx.prototype._initEvents = function() {
		const self = this;

		// Parallax movement.
		if( this.options.parallax ) {
			this.mousemoveFn = function(ev) {
				requestAnimationFrame(function() {
					// Mouse position relative to the document.
					const mousepos = getMousePos(ev),
						// Document scrolls.
						docScrolls = {left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop},
						bounds = self.el.getBoundingClientRect(),
						// Mouse position relative to the main element (this.el).
						relmousepos = { x : mousepos.x - bounds.left - docScrolls.left, y : mousepos.y - bounds.top - docScrolls.top };

					// Movement settings for the animatable elements.
					for(var i = 0, len = self.fragments.length; i <= len-1; ++i) {
						const fragment = self.fragments[i],
							t = fragment.getAttribute('data-parallax'),
							transX = t/(self.dimensions.width)*relmousepos.x - t/2,
							transY = t/(self.dimensions.height)*relmousepos.y - t/2;

						fragment.style.transform = fragment.style.WebkitTransform = 'translate3d(' + transX + 'px,' + transY + 'px,0)';
					}
				});
			};
			this.el.addEventListener('mousemove', this.mousemoveFn);

			this.mouseleaveFn = function(ev) {
				requestAnimationFrame(function() {
					// Movement settings for the animatable elements.
					for(var i = 0, len = self.fragments.length; i <= len-1; ++i) {
						const fragment = self.fragments[i];
						fragment.style.transform = fragment.style.WebkitTransform = 'translate3d(0,0,0)';
					}
				});
			};
			this.el.addEventListener('mouseleave', this.mouseleaveFn);
		}

		// Window resize - Recalculate clip values and translations.
		this.debounceResize = debounce(function(ev) {
			// total elements/configuration
			const areasTotal = self.options.area.length;
			// Recalculate dimensions.
			self.dimensions = {width: self.el.offsetWidth, height: self.el.offsetHeight};
			// recalculate the clip/clip-path and translations
			for(var i = 0, len = self.fragments.length; i <= len-1; ++i) {
				self._positionFragment(i, self.fragments[i].querySelector('.fragment__piece'));
			}
		}, 10);
		window.addEventListener('resize', this.debounceResize);
	};

	/**
	 * Renders all the fragments defined in the FragmentsFx.prototype.options
	 */
	FragmentsFx.prototype._layout = function() {
		// Create the fragments and add them to the DOM (append it to the main element).
		this.fragments = [];
		for (var i = 0, len = this.options.fragments; i < len; ++i) {
			const fragment = this._createFragment(i);
			this.fragments.push(fragment);
		}
	};

	/**
	 * Create a fragment.
	 */
	FragmentsFx.prototype._createFragment = function(pos) {
		var fragment = document.createElement('div');
		fragment.className = 'fragment';
		// Set up a random number for the translation of the fragment when using parallax (mousemove).
		if( this.options.parallax ) {
			fragment.setAttribute('data-parallax', getRandom(this.options.randomParallax.min,this.options.randomParallax.max));
		}
		// Create the fragment "piece" on which we define the clip-path configuration and the background image.
		var piece = document.createElement('div');
		piece.style.backgroundImage = 'url(' + this.imgsrc + ')';
		piece.className = 'fragment__piece';
		piece.style.backgroundImage = 'url(' + this.imgsrc + ')';
		this._positionFragment(pos, piece);
		fragment.appendChild(piece);
		this.el.appendChild(fragment);

		return fragment;
	};

	FragmentsFx.prototype._positionFragment = function(pos, piece) {
		const isRandom = this.options.area === 'random',
			data = this.options.area[pos],
			top = isRandom ? getRandom(this.options.randomIntervals.top.min,this.options.randomIntervals.top.max) : data.top,
			left = isRandom ? getRandom(this.options.randomIntervals.left.min,this.options.randomIntervals.left.max) : data.left;

		// Select either the width or the height with a fixed value for the other dimension.
		var width, height;

		if( isRandom ) {
			if(!!Math.round(getRandom(0,1))) {
				width = getRandom(this.options.randomIntervals.dimension.width.min,this.options.randomIntervals.dimension.width.max);
				height = getRandom(Math.max(this.options.randomIntervals.dimension.width.fixedHeight-0.1,0.1), this.options.randomIntervals.dimension.width.fixedHeight+0.1);
			}
			else {
				height = getRandom(this.options.randomIntervals.dimension.width.min,this.options.randomIntervals.dimension.width.max);
				width = getRandom(Math.max(this.options.randomIntervals.dimension.height.fixedWidth-0.1,0.1), this.options.randomIntervals.dimension.height.fixedWidth+0.1);
			}
		}
		else {
			width = data.width;
			height = data.height;
		}

		if( !isClipPathSupported ) {
			const clipTop = top/100 * this.dimensions.height,
				clipLeft = left/100 * this.dimensions.width,
				clipRight = width/100 * this.dimensions.width + clipLeft,
				clipBottom = height/100 * this.dimensions.height + clipTop;

			piece.style.clip = 'rect(' + clipTop + 'px,' + clipRight + 'px,' + clipBottom + 'px,' + clipLeft + 'px)';
		}
		else {
			piece.style.WebkitClipPath = piece.style.clipPath = 'polygon(' + left + '% ' + top + '%, ' + (left + width) + '% ' + top + '%, ' + (left + width) + '% ' + (top + height) + '%, ' + left + '% ' + (top + height) + '%)';
		}

		// Translate the piece.
		// The translation has to respect the boundaries defined in the options.
		const translation = {
			x: getRandom(-1 * left/100 * this.dimensions.width - this.options.boundaries.x1, this.dimensions.width - left/100 * this.dimensions.width + this.options.boundaries.x2 - width/100 * this.dimensions.width),
			y: getRandom(-1 * top/100 * this.dimensions.height - this.options.boundaries.y1, this.dimensions.height - top/100 * this.dimensions.height + this.options.boundaries.y2 - height/100 * this.dimensions.height)
		};

		piece.style.WebkitTransform = piece.style.transform = 'translate3d(' + translation.x + 'px,' + translation.y +'px,0)';
	};

	window.FragmentsFx = FragmentsFx;






	/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
	/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
	/*##########################################*/

	//mirror effect

	/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
	/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
	/*##########################################*/



	// Helper vars and functions.
	function extend( a, b ) {
		for( var key in b ) {
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	// from http://www.quirksmode.org/js/events_properties.html#position
	function getMousePos(e) {
		var posx = 0, posy = 0;
		if (!e) var e = window.event;
		if (e.pageX || e.pageY) 	{
			posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		return { x : posx, y : posy }
	}

	// equation of a line
	function lineEq(y2, y1, x2, x1, currentVal) {
		// y = mx + b
		var m = (y2 - y1) / (x2 - x1),
			b = y1 - m * x1;

		return m * currentVal + b;
	}

	function MirrorFx(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		console.log('*******')
		console.log(this.el);
		this.imgs = {
			side1: this.el.querySelector('.mirror__side--one > img.mirror__img'),
			side2: this.el.querySelector('.mirror__side--two > img.mirror__img')
		};
		// check possible data-attrs in the DOM element.
		if( this.el.getAttribute('data-visible-area') != undefined ) {
			this.options.visibleArea = this.el.getAttribute('data-visible-area');
		}
		if( this.el.getAttribute('data-layout') != undefined ) {
			this.options.layout = this.el.getAttribute('data-layout');
		}
		if( this.el.getAttribute('data-tilt') != undefined ) {
			this.options.tilt = true;
		}
	}

	MirrorFx.prototype.options = {
		// Animation duration for when showing and hiding the image(s).
		duration: {show: 1500, hide: 1000},
		// Animation easing for when showing and hiding the image(s).
		easing: {show: 'easeOutExpo', hide: 'easeOutQuint'},
		// horizontal||vertical layout.
		layout: 'horizontal',
		// This is the amount of the image that is shown. Value goes from 0 to 1. The higher the value the more the image gets revealed.
		visibleArea: 1,
		// Mousemove functionality.
		tilt: false,
		// Each image will move from visibleArea and visibleArea*tiltFactor
		tiltFactor: 0.6,
		// Rotation on the z-axis
		tiltRotation: 10
	};

	MirrorFx.prototype._initTilt = function() {
		var self = this;
		this.imgs.side1.style.WebkitTransition = this.imgs.side2.style.transition = 'transform 0.2s ease-out';

		this.mousemoveFn = function(ev) {
			requestAnimationFrame(function() {
				// Mouse position relative to the document.
				var mousepos = getMousePos(ev),
					// Document scrolls.
					docScrolls = {left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop},
					win = {width: window.innerWidth, height: window.innerHeight},
					// Mouse position relative to the main element (this.el).
					relmousepos = { x : mousepos.x - docScrolls.left, y : mousepos.y - docScrolls.top },

					d = self.options.layout === 'horizontal' ? win.width : win.height,
					m = self.options.layout === 'horizontal' ? relmousepos.x : relmousepos.y,
					tVal = m < d/2 ?
						lineEq(self.options.visibleArea, self.options.visibleArea*self.options.tiltFactor, d/2, 0, m) :
						lineEq(self.options.visibleArea*self.options.tiltFactor, self.options.visibleArea, d, d/2, m),

					rz = self.options.tiltRotation/win.height*relmousepos.y;

				self.imgs.side1.style.WebkitTransform = self.imgs.side1.style.transform = self.imgs.side2.style.WebkitTransform = self.imgs.side2.style.transform = 'translate' + (self.options.layout === 'horizontal' ? 'X' : 'Y') + '(' + (1-tVal)*100 + '%) rotateZ(' + rz + 'deg)';
			});
		};
		window.addEventListener('mousemove', this.mousemoveFn);
	};

	MirrorFx.prototype._removeTilt = function() {
		this.imgs.side1.style.WebkitTransition = this.imgs.side2.style.transition = 'none';
		window.removeEventListener('mousemove', this.mousemoveFn);
	};

	MirrorFx.prototype._animate = function(action, callback) {
		this._removeTilt();

		var opts = {
			targets: [this.imgs.side1, this.imgs.side2],
			duration: this.options.duration[action],
			easing: this.options.easing[action],
			opacity: {
				value: action === 'show' ? [0,1] : [1,0],
				duration: action === 'show' ? this.options.duration[action] : this.options.duration[action]*.5,
				easing: this.options.easing[action]
			},
			rotateZ: 0
		};

		if( this.options.layout === 'horizontal' ) {
			opts.translateX = action === 'show' ? ['100%', Math.ceil((1-this.options.visibleArea)*100) + '%'] : '100%';
		}
		else {
			opts.translateY = action === 'show' ? ['100%', Math.ceil((1-this.options.visibleArea)*100) + '%'] : '100%';
		}

		var self = this;

		opts.complete = typeof callback === 'function' ?
			function() {
				callback();
				if( self.options.tilt && action === 'show' ) {
					self._initTilt();
				}
			} :
			function() {
				if( self.options.tilt && action === 'show' ) {
					self._initTilt();
				}
			};

		anime.remove(this.imgs.side1);
		anime.remove(this.imgs.side2);
		anime(opts);
	};

	MirrorFx.prototype.show = function(callback) {
		this._animate('show', callback);
	};

	MirrorFx.prototype.hide = function(callback) {
		this._animate('hide', callback);
	};

	window.MirrorFx = MirrorFx;










	/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
	/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
	/*##########################################*/

	//smoke

	/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
	/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
	/*##########################################*/




	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/* smoke.js */

	var Smoke = function () {
		function Smoke(options) {
			_classCallCheck(this, Smoke);

			var defaults = {
				width: window.innerWidth,
				height: window.innerHeight
			};

			Object.assign(this, options, defaults);
			this.onResize = this.onResize.bind(this);

			this.addEventListeners();
			this.init();
		}

		_createClass(Smoke, [{
			key: 'init',
			value: function init() {
				var width = this.width,
					height = this.height;


				this.clock = new THREE.Clock();

				var renderer = this.renderer = new THREE.WebGLRenderer();

				renderer.setSize(width, height);

				this.scene = new THREE.Scene();

				var meshGeometry = new THREE.CubeGeometry(200, 200, 200);
				var meshMaterial = new THREE.MeshLambertMaterial({
					color: 0xaa6666,
					wireframe: false
				});
				this.mesh = new THREE.Mesh(meshGeometry, meshMaterial);

				this.cubeSineDriver = 0;

				this.addCamera();
				this.addLights();
				this.addParticles();
				this.addBackground();

				document.body.appendChild(renderer.domElement);
			}
		}, {
			key: 'evolveSmoke',
			value: function evolveSmoke(delta) {
				var smokeParticles = this.smokeParticles;


				var smokeParticlesLength = smokeParticles.length;

				while (smokeParticlesLength--) {
					smokeParticles[smokeParticlesLength].rotation.z += delta * 0.2;
				}
			}
		}, {
			key: 'addLights',
			value: function addLights() {
				var scene = this.scene;

				var light = new THREE.DirectionalLight(0xfff498, 0.70);
				// var light = new THREE.DirectionalLight(0xffffff, 0.75);

				light.position.set(-1, 0, 1);
				scene.add(light);
			}
		}, {
			key: 'addCamera',
			value: function addCamera() {
				var scene = this.scene;

				var camera = this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 1, 10000);

				camera.position.z = 1000;
				scene.add(camera);
			}
		}, {
			key: 'addParticles',
			value: function addParticles() {
				var scene = this.scene;

				var textureLoader = new THREE.TextureLoader();
				var smokeParticles = this.smokeParticles = [];

				textureLoader.load('images/clouds.png', function (texture) {
					var smokeMaterial = new THREE.MeshLambertMaterial({
						color: 0xffffff,
						map: texture,
						transparent: true
					});
					smokeMaterial.map.minFilter = THREE.LinearFilter;
					var smokeGeometry = new THREE.PlaneBufferGeometry(300, 300);

					var smokeMeshes = [];
					var limit = 150;

					while (limit--) {
						smokeMeshes[limit] = new THREE.Mesh(smokeGeometry, smokeMaterial);
						smokeMeshes[limit].position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
						smokeMeshes[limit].rotation.z = Math.random() * 360;
						smokeParticles.push(smokeMeshes[limit]);
						scene.add(smokeMeshes[limit]);
					}
				});
			}
		}, {
			key: 'addBackground',
			value: function addBackground() {
				var scene = this.scene;

				var textureLoader = new THREE.TextureLoader();
				var textGeometry = new THREE.PlaneBufferGeometry(600, 320);

				textureLoader.load('images/background.jpg', function (texture) {
					var textMaterial = new THREE.MeshLambertMaterial({
						blending: THREE.AdditiveBlending,
						color: 0xffffff,
						map: texture,
						opacity: 1,
						transparent: true
					});
					textMaterial.map.minFilter = THREE.LinearFilter;
					var text = new THREE.Mesh(textGeometry, textMaterial);

					text.position.z = 800;
					scene.add(text);
				});
			}
		}, {
			key: 'render',
			value: function render() {
				var mesh = this.mesh;
				var cubeSineDriver = this.cubeSineDriver;


				cubeSineDriver += 0.01;

				mesh.rotation.x += 0.005;
				mesh.rotation.y += 0.01;
				mesh.position.z = 100 + Math.sin(cubeSineDriver) * 500;

				this.renderer.render(this.scene, this.camera);
			}
		}, {
			key: 'update',
			value: function update() {
				this.evolveSmoke(this.clock.getDelta());
				this.render();

				requestAnimationFrame(this.update.bind(this));
			}
		}, {
			key: 'onResize',
			value: function onResize() {
				var camera = this.camera;


				var windowWidth = window.innerWidth;
				var windowHeight = window.innerHeight;

				camera.aspect = windowWidth / windowHeight;
				camera.updateProjectionMatrix();

				this.renderer.setSize(windowWidth, windowHeight);
			}
		}, {
			key: 'addEventListeners',
			value: function addEventListeners() {
				window.addEventListener('resize', this.onResize);
			}
		}]);

		return Smoke;
	}();

	/* app.js */

	var smoke = new Smoke();

	smoke.update();




	/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
	/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
	/*##########################################*/

	//zoom slider

	/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
	/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
	/*##########################################*/






	var bodyEl = document.body,
		docElem = window.document.documentElement,
		support = { transitions: Modernizr.csstransitions },
		// transition end event name
		transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		onEndTransition = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.transitions ) {
					if( ev.target != this ) return;
					this.removeEventListener( transEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(this); }
			};
			if( support.transitions ) {
				el.addEventListener( transEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
		// window sizes
		win = {width: window.innerWidth, height: window.innerHeight},
		// some helper vars to disallow scrolling
		lockScroll = false, xscroll, yscroll,
		scrollContainer = document.querySelector('.container'),
		// the main slider and its items
		sliderEl = document.querySelector('.slider'),
		items = [].slice.call(sliderEl.querySelectorAll('.slide-zoom-slide')),
		// total number of items
		itemsTotal = items.length,
		// navigation controls/arrows
		navRightCtrl = sliderEl.querySelector('.button--nav-next'),
		navLeftCtrl = sliderEl.querySelector('.button--nav-prev'),
		zoomCtrl = sliderEl.querySelector('.button--zoom'),
		// the main content element
		contentEl = document.querySelector('.content'),
		// close content control
		closeContentCtrl = contentEl.querySelector('button.button--close'),
		// index of current item
		current = 0,
		// check if an item is "open"
		isOpen = false,
		isFirefox = typeof InstallTrigger !== 'undefined',
		// scale body when zooming into the items, if not Firefox (the performance in Firefox is not very good)
		bodyScale = isFirefox ? false : 3;

	// some helper functions:
	function scrollX() { return window.pageXOffset || docElem.scrollLeft; }
	function scrollY() { return window.pageYOffset || docElem.scrollTop; }
	// from http://www.sberry.me/articles/javascript-event-throttling-debouncing
	function throttle(fn, delay) {
		var allowSample = true;

		return function(e) {
			if (allowSample) {
				allowSample = false;
				setTimeout(function() { allowSample = true; }, delay);
				fn(e);
			}
		};
	}

	function init() {
		initEvents();
	}

	// event binding
	function initEvents() {
		// open items
		zoomCtrl.addEventListener('click', function() {
			openItem(items[current]);
		});

		// close content
		closeContentCtrl.addEventListener('click', closeContent);

		// navigation
		//navRightCtrl.addEventListener('click', function() { navigate('right'); });
		//navLeftCtrl.addEventListener('click', function() { navigate('left'); });

		// window resize
		window.addEventListener('resize', throttle(function(ev) {
			// reset window sizes
			win = {width: window.innerWidth, height: window.innerHeight};

			// reset transforms for the items (slider items)
			items.forEach(function(item, pos) {
				if( pos === current ) return;
				var el = item.querySelector('.slide__mover');
				dynamics.css(el, { translateX: el.offsetWidth });
			});
		}, 10));

		// keyboard navigation events
		document.addEventListener( 'keydown', function( ev ) {
			if( isOpen ) return;
			var keyCode = ev.keyCode || ev.which;
			switch (keyCode) {
				case 37:
					navigate('left');
					break;
				case 39:
					navigate('right');
					break;
			}
		} );
	}

	// opens one item
	function openItem(item) {
		if( isOpen ) return;
		isOpen = true;

		// the element that will be transformed
		var zoomer = item.querySelector('.zoomer');
		// slide screen preview
		classie.add(zoomer, 'zoomer--active');
		// disallow scroll
		scrollContainer.addEventListener('scroll', noscroll);
		// apply transforms
		applyTransforms(zoomer);
		// also scale the body so it looks the camera moves to the item.
		if( bodyScale ) {
			dynamics.animate(bodyEl, { scale: bodyScale }, { type: dynamics.easeInOut, duration: 500 });
		}
		// after the transition is finished:
		onEndTransition(zoomer, function() {
			// reset body transform
			if( bodyScale ) {
				dynamics.stop(bodyEl);
				dynamics.css(bodyEl, { scale: 1 });

				// fix for safari (allowing fixed children to keep position)
				bodyEl.style.WebkitTransform = 'none';
				bodyEl.style.transform = 'none';
			}
			// no scrolling
			classie.add(bodyEl, 'noscroll');
			classie.add(contentEl, 'content--open');
			var contentItem = document.getElementById(item.getAttribute('data-content'))
			classie.add(contentItem, 'content__item--current');
			classie.add(contentItem, 'content__item--reset');


			// reset zoomer transform - back to its original position/transform without a transition
			classie.add(zoomer, 'zoomer--notrans');
			zoomer.style.WebkitTransform = 'translate3d(0,0,0) scale3d(1,1,1)';
			zoomer.style.transform = 'translate3d(0,0,0) scale3d(1,1,1)';
		});
	}

	// closes the item/content
	function closeContent() {
		var contentItem = contentEl.querySelector('.content__item--current'),
			zoomer = items[current].querySelector('.zoomer');

		classie.remove(contentEl, 'content--open');
		classie.remove(contentItem, 'content__item--current');
		classie.remove(bodyEl, 'noscroll');

		if( bodyScale ) {
			// reset fix for safari (allowing fixed children to keep position)
			bodyEl.style.WebkitTransform = '';
			bodyEl.style.transform = '';
		}

		/* fix for safari flickering */
		var nobodyscale = true;
		applyTransforms(zoomer, nobodyscale);
		/* fix for safari flickering */

		// wait for the inner content to finish the transition
		onEndTransition(contentItem, function(ev) {
			classie.remove(this, 'content__item--reset');

			// reset scrolling permission
			lockScroll = false;
			scrollContainer.removeEventListener('scroll', noscroll);

			/* fix for safari flickering */
			zoomer.style.WebkitTransform = 'translate3d(0,0,0) scale3d(1,1,1)';
			zoomer.style.transform = 'translate3d(0,0,0) scale3d(1,1,1)';
			/* fix for safari flickering */

			// scale up - behind the scenes - the item again (without transition)
			applyTransforms(zoomer);

			// animate/scale down the item
			setTimeout(function() {
				classie.remove(zoomer, 'zoomer--notrans');
				classie.remove(zoomer, 'zoomer--active');
				zoomer.style.WebkitTransform = 'translate3d(0,0,0) scale3d(1,1,1)';
				zoomer.style.transform = 'translate3d(0,0,0) scale3d(1,1,1)';
			}, 25);

			if( bodyScale ) {
				dynamics.css(bodyEl, { scale: bodyScale });
				dynamics.animate(bodyEl, { scale: 1 }, {
					type: dynamics.easeInOut,
					duration: 500
				});
			}

			isOpen = false;
		});
	}

	// applies the necessary transform value to scale the item up
	function applyTransforms(el, nobodyscale) {
		// zoomer area and scale value
		var zoomerArea = el.querySelector('.zoomer__area'),
			zoomerAreaSize = {width: zoomerArea.offsetWidth, height: zoomerArea.offsetHeight},
			zoomerOffset = zoomerArea.getBoundingClientRect(),
			scaleVal = zoomerAreaSize.width/zoomerAreaSize.height < win.width/win.height ? win.width/zoomerAreaSize.width : win.height/zoomerAreaSize.height;

		if( bodyScale && !nobodyscale ) {
			scaleVal /= bodyScale;
		}

		// apply transform
		el.style.WebkitTransform = 'translate3d(' + Number(win.width/2 - (zoomerOffset.left+zoomerAreaSize.width/2)) + 'px,' + Number(win.height/2 - (zoomerOffset.top+zoomerAreaSize.height/2)) + 'px,0) scale3d(' + scaleVal + ',' + scaleVal + ',1)';
		el.style.transform = 'translate3d(' + Number(win.width/2 - (zoomerOffset.left+zoomerAreaSize.width/2)) + 'px,' + Number(win.height/2 - (zoomerOffset.top+zoomerAreaSize.height/2)) + 'px,0) scale3d(' + scaleVal + ',' + scaleVal + ',1)';
	}

	// navigate the slider
	function navigate(dir) {
		var itemCurrent = items[current],
			currentEl = itemCurrent.querySelector('.slide__mover'),
			currentTitleEl = itemCurrent.querySelector('.slide__title');

		// update new current value
		if( dir === 'right' ) {
			current = current < itemsTotal-1 ? current + 1 : 0;
		}
		else {
			current = current > 0 ? current - 1 : itemsTotal-1;
		}

		var itemNext = items[current],
			nextEl = itemNext.querySelector('.slide__mover'),
			nextTitleEl = itemNext.querySelector('.slide__title');

		// animate the current element out
		dynamics.animate(currentEl, { opacity: 0, translateX: dir === 'right' ? -1*currentEl.offsetWidth/2 : currentEl.offsetWidth/2, rotateZ: dir === 'right' ? -10 : 10 }, {
			type: dynamics.spring,
			duration: 2000,
			friction: 600,
			complete: function() {
				dynamics.css(itemCurrent, { opacity: 0, visibility: 'hidden' });
			}
		});

		// animate the current title out
		dynamics.animate(currentTitleEl, { translateX: dir === 'right' ? -250 : 250, opacity: 0 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.2,"y":1}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 450
		});

		// set the right properties for the next element to come in
		dynamics.css(itemNext, { opacity: 1, visibility: 'visible' });
		dynamics.css(nextEl, { opacity: 0, translateX: dir === 'right' ? nextEl.offsetWidth/2 : -1*nextEl.offsetWidth/2, rotateZ: dir === 'right' ? 10 : -10 });

		// animate the next element in
		dynamics.animate(nextEl, { opacity: 1, translateX: 0 }, {
			type: dynamics.spring,
			duration: 2000,
			friction: 600,
			complete: function() {
				items.forEach(function(item) { classie.remove(item, 'slide--current'); });
				classie.add(itemNext, 'slide--current');
			}
		});

		// set the right properties for the next title to come in
		dynamics.css(nextTitleEl, { translateX: dir === 'right' ? 250 : -250, opacity: 0 });
		// animate the next title in
		dynamics.animate(nextTitleEl, { translateX: 0, opacity: 1 }, {
			type: dynamics.bezier,
			points: [{"x":0,"y":0,"cp":[{"x":0.2,"y":1}]},{"x":1,"y":1,"cp":[{"x":0.3,"y":1}]}],
			duration: 650
		});
	}

	// disallow scrolling (on the scrollContainer)
	function noscroll() {
		if(!lockScroll) {
			lockScroll = true;
			xscroll = scrollContainer.scrollLeft;
			yscroll = scrollContainer.scrollTop;
		}
		scrollContainer.scrollTop = yscroll;
		scrollContainer.scrollLeft = xscroll;
	}

	init();





})(window);





