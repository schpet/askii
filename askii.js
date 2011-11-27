function Skier(world){
    this.x = 0;
    this.width = 6;
    this.height = 4;
    this.world = world;

    this.states = {
        'right': [
            "..    ", 
        " ..O  ", 
        "  -|- ",
        "   \\\\ "
            ],
        'left': [
            "    ..",
        "  O.. ",
        " -|-  ",
        " //   "
            ]
    };

    this.state = this.states['right'];

    this.turnLeft = function(){
        this.state = this.states['left'];
    }
    this.turnRight = function(){
        this.state = this.states['right'];
    }

    this.stepForward = function(){
        var max = this.world.map.maxChars;
        if(this.state == this.states['left'] && this.x > 0)
            this.x--;
        else if(this.state == this.states['right'] && this.x < max - this.width)
            this.x++;
    }
}

function Map(hook){
    this.lineHeight = 15;
    this.fontSize = 12;
    this.lines = 30;
    this.maxChars = undefined;
    this.map = [];

    this.elements = [];
    this.hook = hook;

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

        var s = ""
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
        this.map.shift();
        var s = this.getRandomLine();
        this.map.push(s);
    }

    // returns mostly backticks, with some spice!
    // todo seeded random
    this.getRandomLine = function(){
        var s = '';
        for(var i = 0; i < this.maxChars; i++){
            var rand = Math.random()
                if(rand < 0.99){
                    s += '`'
                } else {
                    s += '#'
                }
        }
        return s;
    }
}

function Game(){
    this.cameraPosition = 0;
    this.position = 3;
    this.map = undefined;
    this.skier = undefined;
    this.hook = undefined;
    this.delay = 50;
    this.timeoutId = undefined;
    this.skierPosition = 4; // todo move me to map, calculate by %

    this.stepForward = function(){
        this.position++;
        this.skier.stepForward();
        this.map.stepForward();

    };
    this.render = function(){
        var visible = "";


        for(var i = 0; i < this.map.lines; i++){
            var original = this.map.map[i];
            var line = undefined;

            if(i >= this.skierPosition && i < this.skierPosition + this.skier.height){
                var relativePos = i - this.skierPosition;

                line = original.substr(0, this.skier.x);
                line += '<span class="skier"'; 
                line += (relativePos == 1) ? ' id="skier">': '>';
                line += this.skier.state[relativePos];
                line += '</span>';
                line += original.substr(this.skier.x + this.skier.width);
            }  else {
                line = original;
            }

            visible += line + "\n";
        }
        this.map.hook.html(visible);
    };

    this.run = function(){
        var self = this;
        this.timeoutId = setTimeout(function(){ 
                if(self.position > self.map.maxChars - self.skier.state.length)
                self.position = 0;

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


console.log(breh);
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

$('#left').click(function(){
    game.skier.turnLeft();
});
shortcut.add("a",function() {
    game.skier.turnLeft();
});
shortcut.add("left",function() {
    game.skier.turnLeft();
});
$('#right').click(function(){
    game.skier.turnRight();
});
shortcut.add("d",function() {
    game.skier.turnRight();
});
shortcut.add("right",function() {
    game.skier.turnRight();
});

$('#stop').click(function(){
    game.stop();
    $('#start').show();
    $('#stop').hide();
});

$('#stop').hide();

$('#start').click(function(){
    game.run();
    $('#start').hide();
    $('#stop').show();
});

