// To do: fix board
// To do: start and end sections
// To do: countdown
// To do: water flow
// To do: levels, score, difficulty ramp

$(document).ready(function () {

    // game settings
    var ROWS = 6;
    var COLS = 8;
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
        cross: { north: true, east: true, south: true, west: true }
    };


    // Pipe Object
    function Pipe(name, type) {
        this.name = name
        this.north = type.north;
        this.east = type.east;
        this.south = type.south;
        this.west = type.west;
    }
    // test = new Pipe(pieceTypes.topRight);
    // console.log(test);
    createBoard();
    var pile = new Pile(VISIBLE_PIECES);
    console.log(pile.getPile());
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
        this.generatePoint = function(text) {
            var x = Math.floor(Math.random()*COLS);
            var y = Math.floor(Math.random()*ROWS);
            console.log("x " + x);
            console.log("y " + y);
            var row = $("#board").find(".row[data-index='" + y + "']");
            var col = $(row).find("span[data-index='" + x + "']");
            $(col).text(text);
            console.log(row);
            console.log(col);
        }
        this.setDirection = function() {
            var directions = ["north", "east", "south", "west"]
            var direction = directions[Math.floor(Math.random()*4)];
            return direction;
        }
        this.direction = this.setDirection();
        this.start = this.generatePoint("start");
        this.end = this.generatePoint("end");

    }

    var water = new Water();
    console.log(water.direction);

    $("#board").on("click", ".block", function () {
        if ($(this).find("img").length == 0) {
            $(this).html($(".current").find("img").clone());
            pile.removePiece();
            pile.generatePiece();
            updateBoardPile();
            console.log();
        }
    });

    // update pile in document
    function updateBoardPile() {
        $("#pile").html("");
        for (var i = 0; i < pile.pile.length; i++) {
            var piece = $("<div>");
            if (i === pile.pile.length - 1) {
                $(piece).attr({ id: "next" + i, class: pile.pile[i].name, class: "current" });
            } else {
                $(piece).attr({ id: "next" + i, class: pile.pile[i].name });
            }
            $(piece).html("<img src='assets/images/" + pile.pile[i].name + ".png'>");
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