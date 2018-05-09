// To do: water flow set new direction
// To do: end sections
// To do: countdown - setinterval
// To do: levels, score, difficulty ramp
// To do: fix cross img

$(document).ready(function () {

    // game settings
    const ROWS = 8;
    const COLS = 10;
    const VISIBLE_PIECES = 4;
    const TIME_TO_START = 8000;
    const WATER_SPEED = 3000;
    const WON = false;

    // pieces, properties are directions for incoming flow and values are outgoing flow
    const pieceTypes = {
        // curved pieces
        topRight: {
            south: "west",
            west: "south"
        },
        bottomRight: {
            north: "west",
            west: "north"
        },
        topLeft: {
            south: "east",
            east: "south"
        },
        bottomLeft: {
            north: "east",
            east: "north"
        },
        vertical: {
            south: "north",
            north: "south"
        },
        horizontal: {
            east: "west",
            west: "east"
        },
        cross: { 
            north: "south",
            south: "north", 
            east: "west",
            west: "east"
        },
        // topRight: { north: false, east: false, south: true, west: true },
        // bottomRight: { north: true, east: false, south: false, west: true },
        // topLeft: { north: false, east: true, south: true, west: false },
        // bottomLeft: { north: true, east: true, south: false, west: false },
        // // straight pieces
        // vertical: { north: true, east: false, south: true, west: false },
        // horizontal: { north: false, east: true, south: false, west: true },
        // cross piece
        //cross: { north: true, east: true, south: true, west: true }
    };


    // Pipe Object, sets appropriate image depending on piece type
    function Pipe(name, type) {
        this.name = name;
        this.flow = type;
        // this.north = type.north;
        // this.east = type.east;
        // this.south = type.south;
        // this.west = type.west;
        if (name == "horizontal") {
            this.img = "<img src='assets/images/straight.png' class='straight'>";
        } else if (name == "vertical") {
            this.img = "<img src='assets/images/straight.png' class='vertical-straight'>";
        } else if (name == "topRight") {
            this.img = "<img src='assets/images/curve.png' class='top-right'>";
        } else if (name == "bottomRight") {
            this.img = "<img src='assets/images/curve.png' class='bottom-right'>";
        } else if (name == "topLeft") {
            this.img = "<img src='assets/images/curve.png' class='top-left'>";
        } else if (name == "bottomLeft") {
            this.img = "<img src='assets/images/curve.png' class='bottom-left'>";
        } else if (name == "cross") {
            // this.img = "<img src='assets/images/straight.png' class='straight'><img src='assets/images/straight.png' class='vertical-straight'>";
            this.img = "<img src='assets/images/straight.gif' class='vertical-straight'>";
        }
    }
    // test = new Pipe(pieceTypes.topRight);
    // console.log(test);
    createBoard();
    const pile = new Pile(VISIBLE_PIECES);
    // console.log(pile.getPile());
    updateBoardPile();

    // Pile Object
    function Pile(visible_pieces) {
        this.pile = [];
        // generate new pipe piece and put to beginning or pile array
        this.generatePiece = function () {
            let keys = Object.keys(pieceTypes);
            let type = keys[Math.floor(Math.random() * keys.length)];
            let temp_pipe = new Pipe(type, pieceTypes[type]);
            this.pile.unshift(temp_pipe);
        }
        this.getPile = function () {
            return this.pile;
        }
        this.removePiece = function () {
            this.pile.pop();
        }
        for (let i = 0; i < visible_pieces; i++) {
            // generate random piece type
            // let type = keys[Math.floor(Math.random() * keys.length)];
            // console.log(type);
            // let temp_pipe = new Pipe(type, pieceTypes[type]);
            // this.pile.push(temp_pipe);
            this.generatePiece();
        }
    }



    // water object
    // this object is a pointer to current position of water flow
    function Water() {
        this.path = [];
        // temp fix for uncaught type error when accessing unset property of path array for checkConnected()
        this.resetPath = function () {
            for (let i = 0; i < COLS; i++) {
                let arr = [];
                for (let z = 0; z < ROWS; z++) {
                    arr.push({ flow: "not" });
                }
                this.path[i] = arr;
            }
        }
        // move to pile object? let pile handle generating start and end?
        this.generatePoint = function (text) {
            // let x = Math.floor(Math.random() * COLS);
            let x;
            let y = Math.floor(Math.random() * ROWS);
            if (text === "start") {
                x = 0;
                this.x = x;
                this.y = y;
            } else if (text === "end") {
                x = COLS - 1;
            } else {
                x = Math.floor(Math.random() * COLS);
            }
            let type = "horizontal";
            // this.path[x] = { [y]: new Pipe("horizontal", pieceTypes.horizontal) };
            // this.path[x] = [];
            // this.path[x][y] = new Pipe("horizontal", pieceTypes.horizontal);
            this.addToPath(x, y, new Pipe("horizontal", pieceTypes.horizontal));
            console.log(text + " x " + x);
            console.log(text + " y " + y);
            let row = $("#board").find(".row[data-index='" + y + "']");
            let col = $(row).find("span[data-index='" + x + "']");
            $(col).html("<img src='assets/images/straight.png'>");
            return { x: x, y: y };
        }
        // future: set direction to either flow of starting pipe
        this.setDirection = function (direction = "") {
            if (direction == "") {
                let directions = ["north", "east", "south", "west"];
                this.direction = directions[Math.floor(Math.random() * 4)];
            } else {
                this.direction = direction;
            }
        }
        this.addToPath = function (x, y, pipe) {
            // let temp_data;
            // if (this.path[x] === undefined) {
            //     temp_data = {};
            //     temp_data[y] = pipe;
            // } else {
            //     temp_data = this.path[x];
            //     temp_data[y] = pipe;
            // }
            let temp_data;
            if (this.path[x] === undefined) {
                temp_data = [];
                temp_data[y] = pipe;
            } else {
                temp_data = this.path[x];
                temp_data[y] = pipe;
            }
            this.path[x] = temp_data;
            // this.path[x] = { [y]: pipe };
        }
        this.checkConnected = function () {
            // console.log("next x: " + x);
            // console.log("next y: " + y);
            console.log(this.path);
            let pipe = this.path;
            if (this.x + 1 == this.end.x && pipe[this.x][this.y].flow.hasOwnProperty("east")) {
                console.log("You won");
                return true;
            } else if (this.direction == "east" && this.x + 1 < COLS) {
                if (pipe[this.x + 1][this.y].flow.hasOwnProperty("west")) {
                    this.setDirection(pipe[this.x + 1][this.y].flow.west);
                    // update position of water to next connected pipe
                    this.x += 1;
                    console.log("x: " + this.x + " | y: " + this.y);
                    return true;
                }
            } else if (this.direction == "west" && this.x - 1 >= 0) {
                if (pipe[this.x - 1][this.y].flow.hasOwnProperty("east")) {
                    this.setDirection(pipe[this.x - 1][this.y].flow.east);
                    this.x -= 1;
                    console.log("x: " + this.x + "y: " + this.y);
                    return true;
                }
            } else if (this.direction == "north" && this.y - 1 >= 0) {
                if (pipe[this.x][this.y - 1].flow.hasOwnProperty("south")) {
                    this.setDirection(pipe[this.x][this.y - 1].flow.south);
                    this.y -= 1;
                    console.log("x: " + this.x + "y: " + this.y);
                    return true;
                }
            } else if (this.direction == "south" && this.y + 1 < ROWS) {
                if (pipe[this.x][this.y + 1].flow.hasOwnProperty("north")) {
                    this.setDirection(pipe[this.x][this.y + 1].flow.north);
                    this.y += 1;
                    console.log("x: " + this.x + "y: " + this.y);
                    return true;
                }
            }
            console.log("You lose");
            return false;
        }
        let _this = this;
        this.startFlow = function () {
            let flow = setInterval(function () {
                // if (_this.checkConnected(_this.x+1, _this.y)) {
                if (_this.checkConnected()) {
                    console.log("connected");
                } else {
                    clearInterval(flow);
                }
            }, WATER_SPEED);
        }
        this.setDirection("east");
        this.end = this.generatePoint("end");
        this.start = this.generatePoint("start");
    }

    const water = new Water();
    water.resetPath();
    console.log("start direction: " + water.direction);

    $("#board").on("click", ".block", function () {
        if ($(this).find("img").length == 0) {
            $(this).html($(".current").find("img").clone());
            let rowIndex = $(this).data("index");
            let colIndex = $(this).parent().data("index");
            let type = pile.pile[VISIBLE_PIECES - 1].name;
            // console.log(pile.pile[VISIBLE_PIECES - 1]);
            // if (water.checkConnected(rowIndex, colIndex, pile.pile[VISIBLE_PIECES - 1])) {
            water.addToPath(rowIndex, colIndex, pile.pile[VISIBLE_PIECES - 1]);
            // }
            pile.removePiece();
            pile.generatePiece();
            // console.log($(this).parent().data("index"));
            // console.log($(this).data("index"));
            updateBoardPile();
            // let img = $(this).find("img").attr("src");
            // $(this).find("img").attr({src: img.replace("png", "gif")});
        }
    });

    // update pile in document
    function updateBoardPile() {
        $("#pile").html("");
        for (let i = 0; i < pile.pile.length; i++) {
            let piece = $("<div>");
            if (i === pile.pile.length - 1) {
                $(piece).attr({ id: "next" + i });
                $(piece).addClass(pile.pile[i].name + " current");
            } else {
                $(piece).attr({ id: "next" + i, class: pile.pile[i].name });
            }
            $(piece).html(pile.pile[i].img);
            $("#pile").append(piece);
        }
    }

    // create board
    function createBoard() {
        let board = $("#board");
        for (let i = 0; i < ROWS; i++) {
            let divRow = $("<div>");
            $(divRow).attr({
                id: "row" + i,
                class: "row",
                "data-index": i
            });
            board.append(divRow);
            for (let z = 0; z < COLS; z++) {
                let block = $("<span>");
                $(block).attr({
                    id: "block" + i + z,
                    class: "block",
                    "data-index": z
                });
                $(block).text("P");
                board.find("#row" + i).append(block);
            }
        }
    }

    let flow = setTimeout(function () {
        water.startFlow();
    }, TIME_TO_START);
});