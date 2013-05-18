/**
 * TODO
 *  - Better dialogs for crashes, starting and stopping
 *  - colors
 *  - don't break on resize
 *  - don't let your skier go up and down
 *  - add speed-up objects
 *
 *  - straighten out style w/ consistent class types
 *  - prevent whitespace from overriding bg
 *  - collisions
 *  - dinosaurs
 *  - tracks
 */

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
  var _super = this.prototype;

  // Instantiate a base class (but only create the instance,
  // don't run the init constructor)
  initializing = true;
  var prototype = new this();
  initializing = false;

  // Copy the properties over onto the new prototype
  for (var name in prop) {
    // Check if we're overwriting an existing function
    prototype[name] = typeof prop[name] == "function" &&
    typeof _super[name] == "function" && fnTest.test(prop[name]) ?
    (function(name, fn){
      return function() {
      var tmp = this._super;

      // Add a new ._super() method that is the same method
      // but on the super-class
      this._super = _super[name];

      // The method only need to be bound temporarily, so we
      // remove it when we're done executing
      var ret = fn.apply(this, arguments);
      this._super = tmp;

      return ret;
      };
    })(name, prop[name]) :
    prop[name];
  }

  // The dummy class constructor
  function Class() {
    // All construction is actually done in the init method
    if ( !initializing && this.init )
    this.init.apply(this, arguments);
  }

  // Populate our constructed prototype object
  Class.prototype = prototype;

  // Enforce the constructor to be what we expect
  Class.prototype.constructor = Class;

  // And make this class extendable
  Class.extend = arguments.callee;

  return Class;
  };
})();

var GameObject = Class.extend({
  init: function(x, y, width, height, className){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.className = className;
  },
  getState: function(){
    console.log('failed to override getState');
  },
  stepForward: function(){
    console.log('step forward');
  }
});

var Skier = GameObject.extend({
  init: function(world){
    this._super(4, 4, 5, 4, "skier");

    this.world = world;

    var self = this;

    this.states = {
      'right': [
            "  O  ",
            " -|- ",
            "  \\\\ ",
            "   ``"
      ],
      'left': [
            "  O  ",
            " -|- ",
            " //  ",
            "``   "
      ],
      'down': [
            "  O  ",
            " -|- ",
            " | | ",
            " ' ' "
      ],
      'up': [
            "  O  ",
            " -|- ",
            " \\ / ",
            "  \"  "
      ],
      'fucked': [
            "0 O 0",
            " x0x ",
            " \\ / ",
            "  \"  "
      ]
    };

    this.transformations = {};
    this.transformations['left'] = function(){
      if(self.x > 0){
        self.x--;
      }
    };
    this.transformations['right'] = function(){
      if(self.x < self.world.map.maxChars){
        self.x++;
      }
    };
    this.transformations['fucked'] = function(){
    };

    this.trackIndent = {};
    this.trackIndent['left'] = [2, 3];
    this.trackIndent['right'] = [1, 2];
    this.trackIndent['down'] = [1, 3];
    this.trackIndent['up'] = [1, 3];

    this.state = 'right';

    var skier = this;
    // TODO this adds everytime? maybe clear it out before adding
    shortcut.add("left",function() {
      skier.state = 'left';
    });
    shortcut.add("right",function() {
      skier.state = 'right';
    });
  },
  getState: function(){
    return this.states[this.state];
  },
  stepForward: function(){
    var maxX = this.world.map.maxChars;
    this.transformations[this.state]();
    this.y++;
  },
  render: function(map, position){
    return map[position];
  },
  getCollisionPoint: function(){
    if(this.state == 'left'){
      return [0, 3];
    } else if(this.state == 'right'){
      return [4, 3];
    } else {
      return [2, 3];
    }
  }
});

var Tree = GameObject.extend({
  init: function(x, y){
    this._super(x, y, 5, 4);

    /*
      ^
     /|\
    //^\\
      |

    TODO: Fallen state
    */

    this.state = [
      '  ^  ',
      ' /|\\ ',
      '//^\\\\',
      '  |  '
      ];

    this.collidable = [
      [2,2],
      [1,3],
      [0,4],
      [2,2]
    ];
  },
  getState: function(){
    return this.state;
  },
  getHitBox: function(){
    return { tl: [3,2], br: [3,2]  };
  },
  stepForward: function(){ }
})

function Map(hook){
  this.lineHeight = undefined;
  this.fontSize = undefined;
  this.lines = 30;
  this.maxChars = undefined;
  this.map = [];
  this.scratchMap = undefined;

  this.offset = 0;

  this.elements = [];
  this.hook = hook;
  var self = this;

  this.init = function(){
    var hook = this.hook;
    hook.text("");

    hook.height($(window).height() - $('#controls').innerHeight());

    this.updateMaxChars();

    var visible  = "";
    for(var i = 0; i < this.lines; i++){
      var s = this.getBlankLine(this.maxChars);
      this.map.push(s);
      visible  += s + "\n";
    }
    hook.html(visible);
  }

  this.updateMaxChars = function(){
    // http://stackoverflow.com/questions/8113874

    var span = $('<span></span>');
    span.addClass('map');

    $('#content').append(span);

    var documentWidth = $(document).width();
    var max = 500;
    var fit = undefined;

    var s = "";

    for (var i = 0; i < max; i++){
      s += "X";
      span.text(s);
      if(span.width() > documentWidth) {
        this.maxChars = i - 1;
        break;
      }
    }

    var windowHeight = $(window).height();
    var lineHeight = span.height();
    this.lines = Math.floor(windowHeight / lineHeight);
    span.remove();
  }

  this.stepForward = function(){
    // this.map.shift();
    // var s = this.getRandomLine();
    // this.map.push(s);
    this.offset++;
  }

  this.getBlankLine = function(maxChars){
    var s = '';
    for(var i = 0; i < maxChars; i++){
       s += ' ';
    }
    return s;
  }

  /*


##############
####0#########
###-|-########
###/ \########
##############
##############

    map.replace(x, y, content){ }
    guy = [];
    guy[0] = " 0 ";
    guy[1] = "-|-";
    guy[2] = "/ \";

    map.replace(4, 2, guy){
      go to the line,
      replace non space stuff with characters

      objects will handle collisions based on coordinates
    }


    map will have relative position and real offset
  */

  this.clearScratchMap = function(){
    this.scratchMap = this.map.slice(0);
  }

  /**
   * @param
   *    gameObject - a game object with some properties
   *
   */
  this.renderGameObject = function(gameObject){
    // skip to line
    // step over each character, not counting html tags
    // return a copy of the map with the game object added

    for(var line = gameObject.y;
        line < gameObject.y + gameObject.height; line++){


      var position = line - this.offset;
      if(position >= 0 && position < this.lines){

        var textLine = this.scratchMap[position];
        var modifiedLine = '';

        var tag = false;
        var textColumn = 0;


        for(var htmlColumn = 0; htmlColumn < textLine.length;
            htmlColumn++){

          if(textLine.charAt(htmlColumn) == "<"){
            tag = true;
            console.log("tag is true");
          } else if(tag && textLine.charAt(htmlColumn) == ">"){
            tag = false;
            console.log("tag is false");
          }

          if(textColumn >= gameObject.x &&
              textColumn < gameObject.x + gameObject.width){

            var stateX = textColumn - gameObject.x;
            var stateY = line - gameObject.y;
            character = gameObject.getState()[stateY].charAt(stateX);

            if(character != ' '){
              modifiedLine += character;
            } else {
              modifiedLine += textLine.charAt(htmlColumn);
            }
          } else {
            modifiedLine += textLine.charAt(htmlColumn);
          }


          if(!tag){
            textColumn++;
          }
        }

        this.scratchMap[line - this.offset] = modifiedLine;
      }
    }

  }

}

function Game($hook, $score){
  this.cameraPosition = 0;
  this.position = undefined;
  this.skier = undefined;

  this.map = undefined;
  this.trees = [];

  this.$hook = $hook;
  this.$score = $score;
  this.delay = 50;
  this.timeoutId = undefined;

  this.highscore = undefined;
  this.score = undefined;

  this.gameObjects = undefined;
  this.stopFlag = false;

  this.run = function(){
    var self = this;
    this.timeoutId = setInterval(function(){
      self.render();
      self.stepForward()
      if(this.stopFlag){
        clearTimeout(this.stopFlag);
        this.stopFlag = false;
      }
    }, this.delay);
  };

  this.start = function(){
    if (this.modalTimeout) {
      clearTimeout(this.modalTimeout)
      this.modalTimeout = null;
    }
    $('body').removeClass('ded');
    this.init();
    if(this.timeoutId){
      clearTimeout(this.timeoutId);
    }
    $('#controls').modal('hide')
    $('.start').hide();
    $('.stop').show();
    this.run();
  };

  this.stop = function(){
    if(!this.timeoutId){
      return
    }

    if(!clearTimeout(this.timeoutId)){
      this.stopFlag = true;
    }

    $('.start').show();
    $('.stop').hide();
  };

  this.checkCollision = function(gameObject, skier){
    if(skier == undefined){
      skier = this.skier;
    }

    var cp = skier.getCollisionPoint();

    var sx = cp[0] + skier.x;
    var sy = cp[1] + skier.y;

    var bt = gameObject.y;
    var bb = gameObject.y + gameObject.height - 1;
    if(sy >= bt && sy <= bb){
      var bl = gameObject.x;
      var br = gameObject.x + gameObject.width - 1;
      // vertical = yep
      if(sx >= bl && sx <= br){
        // horizontal = yep

        // determine which row we're at
        var posY = sy - bt;
        var posX = sx - bl;
        var collidable = gameObject.collidable[posY];

        return (sx >= bl + collidable[0] && sx <= bl + collidable[1])
      }
    }
    return false;
  }

  this.stepForward = function(){
    this.position++;
    this.map.stepForward();

    for(var i = 0; i < this.gameObjects.length; i++){
      var value = this.gameObjects[i];
      if(value.y < this.map.offset){
        this.gameObjects.splice(i, 1);
      } else {
        value.stepForward();
      }

      //check for collision with skier
      if(this.checkCollision(value)){
        this.handleCollision();
        this.gameObjects.splice(i, 1);
        this.stop();
      }
    }

    this.skier.stepForward();
    // handle collisions
  };

  this.handleCollision = function(){

    this.skier.state = 'fucked';
    this.score = this.position;
    if(this.highscore == undefined || this.score > this.highscore){
      this.highscore = this.score;
    }
    $('body').addClass('ded');

    this.modalTimeout = setTimeout(function() {
      $('#score').text(this.score + "!!!!");
      $('#status').text("Your highscore is " + this.highscore + ".");
      $('#controls').modal('show');
      $('.start').text("Do it again");
      this.modalTimeout = null;
    }.bind(this), 1000);
  };

  this.render = function(){
    this.map.clearScratchMap();

    var self = this;
    $.each(this.gameObjects, function(index, gameObject){
      self.map.renderGameObject(gameObject);
    });

    this.map.renderGameObject(this.skier);

    this.map.hook.html(this.map.scratchMap.join("\n"));
    this.$score.text(this.position + 1);
  };

  this.init = function(){
    var i, j;
    this.cameraPosition = 0;
    this.skier = new Skier(this);
    this.trees = [];

    this.position = 3;
    this.map = new Map(this.$hook);
    this.map.init();
    this.gameObjects = [];

    var treesPerLine = [
      Math.max(window.innerWidth / 500),
      Math.max(window.innerWidth / 250),
      Math.max(window.innerWidth / 125),
      Math.max(window.innerWidth / 75),
    ]

    totalLength = treesPerLine.length * 100;
    for(i = 15; i < totalLength; i++){
      for(j = 0; j < treesPerLine[Math.floor(i / (totalLength / 3))]; j++) {
        var tree = new Tree(Math.floor(Math.random() * this.map.maxChars), i * 4);
        this.gameObjects.push(tree);
      }
    }

  };
};

function is_touch_device() {
  return !!('ontouchstart' in window) ? 1 : 0;
}

if(is_touch_device()){
  $('.touchscreen').show();
  $('.start').text("I realize this wont work but try it anyway");
}

$(document).ready(function(){

  var game = new Game($('#askii'), $('#live-score'));

  $(window).resize(function(){
    if (game.map){
      game.map.init()
    }
  });

  $('.stop').click(game.stop.bind(game));
  $('.start').click(game.start.bind(game));

  shortcut.add("enter", game.start.bind(game));
  shortcut.add("space", game.start.bind(game));

  $('.stop').hide();

  $('#controls').modal({
    keyboard: false,
    backdrop: false
  });
});
