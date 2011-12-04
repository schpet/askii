function Skier(world){
    var self = this;

    this.x = 4;
    this.y = 4;
    this.width = 5;
    this.height = 4;
    this.world = world;

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
    this.transformations['up'] = function(){ 
        if(self.y > 0)
            self.y--
    };
    this.transformations['down'] = function(){ 
    };

    this.trackIndent = {};
    this.trackIndent['left'] = [2, 3];
    this.trackIndent['right'] = [1, 2];
    this.trackIndent['down'] = [1, 3];
    this.trackIndent['up'] = [1, 3];
    
    this.state = 'right';

    this.getState = function(){
        return this.states[this.state];
    }

    this.stepForward = function(){
        var maxX = this.world.map.maxChars;
        this.transformations[this.state]();
    }


    this.render = function(textBlock){
    };

    this.render = function(map, position){
        // get 
        var line = '';

        var original = map[position];
        if(position < self.y){
            // long ago 
            return original;
        } else if(position >= self.y && position < self.y + self.height ){
            
            var offset = position - self.y;

            if(offset == self.height - 3){
                //track 
                var leftTrackPos = self.trackIndent[self.state][0];
                var rightTrackPos = self.trackIndent[self.state][1];
                var cursor = self.x + leftTrackPos;

                var trackLine = original.substr(0, cursor);
                cursor++;
                trackLine += ".";
                for(; cursor < self.x + rightTrackPos; cursor++){
                    trackLine += original.charAt(cursor);
                }
                trackLine += ".";
                cursor++;

                trackLine += original.substr(cursor);

                

                map[position] = trackLine;
            }

            var skier = self.getState()[offset];
            var original = map[position];

            line = original.substr(0, self.x);
            for(var i = 0; i < skier.length; i++){
                var character = skier.charAt(i);
                if(character == ' '){
                    line += original.charAt(self.x + i);
                } else {
                    line += '<span class="skier">'; 
                    line += character;
                    line += '</span>';
                }
            }
            line += original.substr(self.x + self.width);
            return line;
        } else {
            return map[position];
        }

/*
        if(offset == 0){
            original = "zzzzzzz";
        } else {

            var skier = self.getState()[offset - 1];

            line = original.substr(0, self.x);
            for(var i = 0; i < skier.length; i++){
                var character = skier.charAt(i);
                if(character == ' '){
                    line += original.charAt(self.x + i);
                } else {
                    line += '<span class="skier">'; 
                    line += character;
                    line += '</span>';
                }
            }
            line += original.substr(self.x + self.width);
        }

*/
        return line;
    }
}

function Tree(x, y){
    this.x = x;
    this.y = y;
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
        '//|\\\\',
        '  |  '
        ];
}

function Map(hook){
    this.lineHeight = undefined;
    this.fontSize = undefined;
    this.lines = 30;
    this.maxChars = undefined;
    this.map = [];

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
            var s = this.getRandomLine();
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

        var windowHeight = $(window).height() - $('#controls').innerHeight();
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

    this.getRandomLine = function(){
        var s = '';
        for(var i = 0; i < this.maxChars; i++){
            var rand = Math.random();

            if(rand < 0.995){
                s += ' '
            } else {
                s += '#'
            }
        }
        return s;
    }
    this.getBlankLine = function(){
        var s = '';
        for(var i = 0; i < this.maxChars; i++){
           s += ',';
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

    /**
     * @param 
     *      gameObject - a game object with some properties
     *
     *                   x
     *                   y
     *                   // width
     *                   height
     *                   state
     *                   className
     *                   
     *                   TODO: make a game object interface 
     */
    this.addGameObject = function(gameObject){
        // skip to line
        // step over each character, not counting html tags
        // return a copy of the map with the game object added
        console.log("addGameObject y = " + gameObject.y);
        
        for(var line = gameObject.y; 
                line < gameObject.y + gameObject.height; line++){

            var lineText = this.map[line - this.offset];
            var tag = false;
            var textColumn = 0;

            console.log("offset: " + this.offset);
            console.log("linetext : " + lineText);
            for(var htmlColumn = 0; htmlColumn < lineText.length; 
                    htmlColumn++){
                if(lineText.charAt(htmlColumn) == "<"){
                    tag = true;
                    console.log("tag is true");
                } else if(tag && lineText.charAt(htmlColumn) == ">"){
                    tag = false;
                    console.log("tag is false");
                }
                // xxx 

                if(!tag){
                    textColumn++;
                }
            }
        }
    }

}

function Game(){
    this.cameraPosition = 0;
    this.position = 3;

    this.map = undefined;
    this.skier = undefined;
    this.trees = [];

    this.hook = undefined;
    this.delay = 40;
    this.timeoutId = undefined;
    this.skierPosition = 4; // todo move me to map, calculate by %

    this.stepForward = function(){
        this.position++;
        this.skier.stepForward();
        this.map.stepForward();
        
        // handle colisions

    };
    this.render = function(){
        var textBlock = "";

        // render map, return the block of text
        // create the block of text 
        // render trees
        // render skier
        this.map.addGameObject(this.skier);

        for(var i = 0; i < this.map.lines; i++){
            var line = this.skier.render(this.map.map, i);
            textBlock += line + "\n";
        }
        this.map.hook.html(textBlock);
    };

    this.run = function(){
        var self = this;
        this.timeoutId = setTimeout(function(){ 
                if(self.position > self.map.maxChars - self.skier.state.length){
                    self.position = 0;
                }

                self.render(); 
                self.stepForward() 
                self.run();
            }, this.delay);
    };

    this.stop = function(){
        if(this.timeoutId){
            clearTimeout(this.timeoutId);
        }
    };
};


var game = new Game();
var breh = new Skier(game);

game.skier = breh;
game.hook = $('#askii');

game.map = new Map($('#askii'));
game.map.init();

console.log(game);

$(window).resize(function() {
    game.map.init();
});

shortcut.add("left",function() {
    game.skier.state = 'left';
});
shortcut.add("right",function() {
    game.skier.state = 'right';
});

shortcut.add("up",function() {
    game.skier.state = 'up';
});

shortcut.add("down",function() {
    game.skier.state = 'down';
    game.skier.y++;
});

$('#left').click(function(){
    game.skier.turnLeft();
});
$('#right').click(function(){
    game.skier.turnRight();
});

$('.stop').click(function(){
    game.stop();
    $('.start').show();
    $('.stop').hide();
});

$('.stop').hide();

$('.start').click(function(){
    game.run();
    $('.start').hide();
    $('.stop').show();
});
