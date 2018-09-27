var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var LTime = Date.now();
var RTime = 0;

var deltaTime = 0.016;
var imageList = {};
var collisionList = [];


// Vector
function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

/* INSTANCE METHODS */

Vector.prototype = {
	negative: function() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	},
	add: function(v) {
		if (v instanceof Vector) {
			this.x += v.x;
			this.y += v.y;
		} else {
			this.x += v;
			this.y += v;
		}
		return this;
	},
	subtract: function(v) {
		if (v instanceof Vector) {
			this.x -= v.x;
			this.y -= v.y;
		} else {
			this.x -= v;
			this.y -= v;
		}
		return this;
	},
	multiply: function(v) {
		if (v instanceof Vector) {
			this.x *= v.x;
			this.y *= v.y;
		} else {
			this.x *= v;
			this.y *= v;
		}
		return this;
	},
	divide: function(v) {
		if (v instanceof Vector) {
			if(v.x != 0) this.x /= v.x;
			if(v.y != 0) this.y /= v.y;
		} else {
			if(v != 0) {
				this.x /= v;
				this.y /= v;
			}
		}
		return this;
	},
	equals: function(v) {
		return this.x == v.x && this.y == v.y;
	},
	dot: function(v) {
		return this.x * v.x + this.y * v.y;
	},
	cross: function(v) {
		return this.x * v.y - this.y * v.x
	},
	length: function() {
		return Math.sqrt(this.dot(this));
	},
	normalize: function() {
		return this.divide(this.length());
	},
	min: function() {
		return Math.min(this.x, this.y);
	},
	max: function() {
		return Math.max(this.x, this.y);
	},
	toAngles: function() {
		return -Math.atan2(-this.y, this.x);
	},
	angleTo: function(a) {
		return Math.acos(this.dot(a) / (this.length() * a.length()));
	},
	toArray: function(n) {
		return [this.x, this.y].slice(0, n || 2);
	},
	clone: function() {
		return new Vector(this.x, this.y);
	},
	set: function(x, y) {
		this.x = x; this.y = y;
		return this;
    },
    fixSpeed: function(s) {
        this.normalize();
        this.multiply(s);
        return;
    }
};

/* STATIC METHODS */
Vector.negative = function(v) {
	return new Vector(-v.x, -v.y);
};
Vector.add = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x + b.x, a.y + b.y);
	else return new Vector(a.x + v, a.y + v);
};
Vector.subtract = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x - b.x, a.y - b.y);
	else return new Vector(a.x - v, a.y - v);
};
Vector.multiply = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x * b.x, a.y * b.y);
	else return new Vector(a.x * v, a.y * v);
};
Vector.divide = function(a, b) {
	if (b instanceof Vector) return new Vector(a.x / b.x, a.y / b.y);
	else return new Vector(a.x / v, a.y / v);
};
Vector.equals = function(a, b) {
	return a.x == b.x && a.y == b.y;
};
Vector.dot = function(a, b) {
	return a.x * b.x + a.y * b.y;
};
Vector.cross = function(a, b) {
	return a.x * b.y - a.y * b.x;
};


// function




// key

var Lkeys = {};
var keys = {};
var mouseX = 0;
var mouseY = 0;

var keyDownFunc = function(e)
{
    Lkeys[e.code] = 1;
    if(!keys.hasOwnProperty(e.code)) // 지금 누른 key code가 없으면
    {
        keys[e.code] = 0;
    }
}
var keyUpFunc = function(e)
{
    Lkeys[e.code] = -1;
}
var updateKeys = function()
{
    for(code in keys)
    {
        if(Lkeys[code] == 1 && keys[code] == 0) // 전엔 안눌렀는데 지금 눌렀다 -> 누른 순간
        {
            keys[code] = 1;
        }
        else if(Lkeys[code] == 1 && keys[code] == 1) // 전에 눌렀고 지금도 누르고 있다 -> 누르는 중
        {
            keys[code] = 2;
        }
        else if(Lkeys[code] == -1 && keys[code] == -1) // 전에 안눌렀고 지금도 안눌렀다 -> 때고 있는 중
        {
            keys[code] = 0;
            Lkeys[code] = 0;
        }
        else if(Lkeys[code] == -1) // 전엔 눌렀는데 지금은 안눌렀다 -> 키를 땐 순간
        {
            keys[code] = -1;
        }
    }
}
var mouseXY = function()
{
    if (window.Event)
    {
	    document.captureEvents(Event.MOUSEMOVE);
	}
	document.onmousemove = getCursorXY;
}

var getCursorXY = function(e)
{
	mouseX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
	mouseY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
}
var mouseClickDown = function()
{
    
}
var mouseClickUp = function()
{
    
}

document.addEventListener("keydown", keyDownFunc, false);
document.addEventListener("keyup", keyUpFunc, false);
document.addEventListener("mousemove", mouseXY, false);
document.addEventListener("click", mouseClickDown, false);
document.addEventListener("mousedown", mouseClickDown, false);
document.addEventListener("mouseup", mouseClickUp, false);


var preloadImage = function(path)
{
    var _image = new Image();
    _image.src = path;
    imageList[path] = {image : _image, isLoaded : false};
    _image.addEventListener('load', function()
    {
        imageList[path].isLoaded = true;
    }, false);
}


// class

class GameImage
{
    constructor(path, _x, _y, type)
    {
        this.path = path;
        this.pos = {x : _x, y : _y};
        this.scale = {x : 1, y : 1};
        this.rot = 0;
        this.z = 0;
        this.anchor = {x : 0.5, y : 0.5};
        this.type = type;
        this.isDelete = false;

        if(this.type == "enemy" || this.type == "object")
        {
            collisionList.push(this);
        }
        if(imageList[path] == undefined)
        {
            this.image = new Image();
            this.image.src = path;
            imageList[path] = {image : this.image, isLoaded : false};
            this.image.addEventListener('load',         // 이미지 로딩됌
            function()
            {
                imageList[path].isLoaded = true;
            }, false);
        }
        else
        {
            this.image = imageList[path].image;
        }
    }
    render()
    {
        if(!imageList[this.path].isLoaded) // 이미지 로드 안됐으면
        {
            return;
        }
        let dx = this.image.width * this.anchor.x;
        let dy = this.image.height * this.anchor.y;
        ctx.resetTransform();
        ctx.translate(this.pos.x + dx, this.pos.y + dy);
        ctx.rotate(this.rot);
        ctx.transform(this.scale.x, 0, 0, this.scale.y, -dx * this.scale.x, -dy * this.scale.y);
        ctx.drawImage(this.image, 0, 0);
    }
    setZ(newZ)
    {
        this.z = newZ;
        nowScene.sceneImageList.sort(function(a, b)
        {
            return a.z - b.z;
        });
    }
    getCenter(pos)
    {
        if(pos == "x")
            return this.pos.x + this.image.width / 2;
        else if(pos == "y")
            return this.pos.y + this.image.height / 2;
    }
}


// scene

var nowScene = undefined;
class Scene
{
    constructor()
    {
        this.sceneImageList = [];
    }
    init()
    {
        
    }
    start()
    {
        nowScene = this;
        this.init();
    }
    update()
    {

    }
    addImage(image)
    {
        this.sceneImageList.push(image);
        return image;
    }
    render()
    {
        for(let i = 0; i < this.sceneImageList.length; i++)
        {
            this.sceneImageList[i].render();
        }
    }
}
var nullScene = new Scene();
nowScene = nullScene;



// gameLoop

var update = function()
{
    nowScene.update();
}
var render = function()
{
    nowScene.render();
}
var gameLoop = function()
{
    RTime = Date.now();
    deltaTime = (RTime - LTime) / 1000;
    LTime = RTime;
    updateKeys();
    update();
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    render();
}

setInterval(gameLoop, 0);