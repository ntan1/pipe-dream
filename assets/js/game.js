// To do: fix board
// To do: start and end sections
// To do: countdown
// To do: water flow
// To do: levels, score, difficulty ramp
// To do: fix cross img

$(document).ready(function () {

    // game settings
    var ROWS = 8;
    var COLS = 10;
    var VISIBLE_PIECES = 4;

    // pieces
    var pieceTypes = {
        // curved pieces
        topRight: { north: false, east: false, south: true, west: true },
        bottomRight: { north: true, east: false, south: false, west: true },
        topLeft: { north: false, east: true, south: true, west: false },
        bottomLeft: { north: true, east: true, south: false, west: false },
        // straight pieces
        vertical: { north: true, east: false, south: true, west: false },
        horizontal: { north: false, east: true, south: false, west: true },
        // cross piece
        //cross: { north: true, east: true, south: true, west: true }
    };


    // Pipe Object
    function Pipe(name, type) {
        this.name = name
        this.north = type.north;
        this.east = type.east;
        this.south = type.south;
        this.west = type.west;
        if (name == "horizontal") {
            this.img = "<img src='assets/images/straight.png' class='straight'>"
        } else if (name == "vertical") {
            this.img = "<img src='assets/images/straight.png' class='vertical-straight'>"
        } else if (name == "topRight") {
            this.img = "<img src='assets/images/curve.png' class='top-right'>"
        } else if (name == "bottomRight") {
            this.img = "<img src='assets/images/curve.png' class='bottom-right'>"
        } else if (name == "topLeft") {
            this.img = "<img src='assets/images/curve.png' class='top-left'>"
        } else if (name == "bottomLeft") {
            this.img = "<img src='assets/images/curve.png' class='bottom-left'>"
        } else if (name == "cross") {
            this.img = "<img src='assets/images/straight.png' class='straight'><img src='assets/images/straight.png' class='vertical-straight'>"
        }
    }
    // test = new Pipe(pieceTypes.topRight);
    // console.log(test);
    createBoard();
    var pile = new Pile(VISIBLE_PIECES);
    // console.log(pile.getPile());
    updateBoardPile();

    // Pile Object
    function Pile(visible_pieces) {
        this.pile = [];
        var keys = Object.keys(pieceTypes);
        this.generatePiece = function () {
            var type = keys[Math.floor(Math.random() * keys.length)];
            var temp_pipe = new Pipe(type, pieceTypes[type]);
            this.pile.unshift(temp_pipe);
        }
        this.getPile = function () {
            return this.pile;
        }
        this.removePiece = function () {
            this.pile.pop();
        }
        for (var i = 0; i < visible_pieces; i++) {
            // generate random piece type
            // var type = keys[Math.floor(Math.random() * keys.length)];
            // console.log(type);
            // var temp_pipe = new Pipe(type, pieceTypes[type]);
            // this.pile.push(temp_pipe);
            this.generatePiece();
        }
    }

    // water object
    function Water() {
        this.path = {};
        this.generatePoint = function (text) {
            var x = Math.floor(Math.random() * COLS);
            var y = Math.floor(Math.random() * ROWS);
            var type = "horizontal";
            this.path[x] = { [y]: type };
            console.log(text + " x " + x);
            console.log(text + " y " + y);
            var row = $("#board").find(".row[data-index='" + y + "']");
            var col = $(row).find("span[data-index='" + x + "']");
            $(col).html("<img src='assets/images/straight.png'>");
        }
        this.setDirection = function (direction = "") {
            if (direction == "") {
                var directions = ["north", "east", "south", "west"]
                direction = directions[Math.floor(Math.random() * 4)];
            } else {
                direction = direction
            }
            return direction;
        }
        this.addToPath = function (x, y, pipe) {
            this.path[x] = { [y]: pipe };
            console.log(this.path);
        }
        this.checkConnected = function (x, y, pipe) {
            console.log(pipe.west);
            if (this.direction == "east" && pipe.west) {
                console.log("true");
                return true;
            } else {
                console.log("false");
                return false;
            }
            console.log(this.path.length);
            return true;
        }
        this.direction = this.setDirection("east");
        this.start = this.generatePoint("start");
        // this.end = this.generatePoint("end");

    }

    var water = new Water();
    console.log(water.direction);

    $("#board").on("click", ".block", function () {
        if ($(this).find("img").length == 0) {
            $(this).html($(".current").find("img").clone());
            var rowIndex = $(this).parent().data("index");
            var colIndex = $(this).data("index");
            var type = pile.pile[VISIBLE_PIECES-1].name;
            if (water.checkConnected(rowIndex, colIndex, pile.pile[VISIBLE_PIECES-1])) {
                water.addToPath(rowIndex, colIndex, pile.pile[VISIBLE_PIECES-1]);
            }
            pile.removePiece();
            pile.generatePiece();
            console.log($(this).parent().data("index"));
            console.log($(this).data("index"));
            updateBoardPile();
            // var img = $(this).find("img").attr("src");
            // $(this).find("img").attr({src: img.replace("png", "gif")});
        }
    });

    // update pile in document
    function updateBoardPile() {
        $("#pile").html("");
        for (var i = 0; i < pile.pile.length; i++) {
            var piece = $("<div>");
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
        var board = $("#board");
        for (var i = 0; i < ROWS; i++) {
            var divRow = $("<div>");
            $(divRow).attr({
                id: "row" + i,
                class: "row",
                "data-index": i
            });
            board.append(divRow);
            for (var z = 0; z < COLS; z++) {
                var block = $("<span>");
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
});