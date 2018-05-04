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
    function Pipe(type) {
        this.north = type.north;
        this.east = type.east;
        this.south = type.south;
        this.west = type.west;
    }
    test = new Pipe(pieceTypes.topRight);
    // console.log(test);
    createBoard();
    var pile = new Pile(VISIBLE_PIECES);
    console.log(pile.getPile());
    
    // Pile Object
    function Pile(visible_pieces) {
        this.pile = [];
        var keys = Object.keys(pieceTypes);
        for (var i = 0; i < visible_pieces; i++) {
            // generate random piece type
            var type = keys[Math.floor(Math.random() * keys.length)];
            console.log(type);
            var temp_pipe = new Pipe(pieceTypes[type]);
            this.pile.push(temp_pipe);
        }
        this.getPile = function() {
            return this.pile;
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