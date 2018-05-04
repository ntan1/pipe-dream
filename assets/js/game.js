// To do: fix board
// To do: start and end sections
// To do: countdown
// To do: water flow
// To do: levels, score, difficulty ramp

$(document).ready(function () {

    // game settings
    var ROWS = 8;
    var ROWS = 10;
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
            console.log(type);
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

    $("#board").on("click", ".block", function () {
        if ($(this).find("img").length == 0) {
            $(this).html($(".current").find("img").clone());
            pile.removePiece();
            pile.generatePiece();
            updateBoardPile();
        }
    });

    // update pile in document
    function updateBoardPile() {
        $("#pile").html("");
        for (var i = 0; i < pile.pile.length; i++) {
            var piece = document.createElement("li");
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
            var divRow = document.createElement("div");
            $(divRow).attr({
                id: "row" + i,
                class: "row"
            });
            board.append(divRow);
            for (var z = 0; z < ROWS; z++) {
                var block = document.createElement("span");
                $(block).attr({
                    id: "block" + i + z,
                    class: "block"
                });
                $(block).text("P");
                board.find("#row" + i).append(block);
            }
        }
    }
});