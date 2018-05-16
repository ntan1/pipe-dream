// To do: countdown - setinterval
// To do: levels, score, difficulty ramp
// To do: display board function for all html changes (fix score)
// To do: refactor code to use block id instead of row and col data-index


$(document).ready(function () {
    // game settings
    const ROWS = 8;
    const COLS = 10;
    const VISIBLE_PIECES = 4;
    const BLOCK_HEIGHT = 100;
    const BLOCK_WIDTH = 100;
    const TIME_TO_START = 15000;
    const WATER_SPEED = 2000;
    const WON = false;
    let started = false;
    let score = 0;
    let level = 1;
    let time = TIME_TO_START / 1000;
    const vol = 0.4;
    const bgColors = {
        msg: "rgba(87, 162, 212, 0.9)",
        lose: "rgba(199, 30, 30, 0.9)",
        win: "rgb(87, 212, 87, 0.9)"
    }

    // sounds
    const audio = {
        placed: new Audio("assets/sounds/yes.mp3"),
        notAllowed: new Audio("assets/sounds/no.mp3"),
        lose: new Audio("assets/sounds/lose.mp3"),
        win: new Audio("assets/sounds/win.mp3"),
        start: new Audio("assets/sounds/start.mp3"),
        pass: new Audio("assets/sounds/pass.mp3")
    }

    // lower sound volume
    for (let sounds in audio) {
        audio[sounds].volume = vol;
    }
    $("#bg-music")[0].volume = vol;

    // pieces holds objects. properties are directions for incoming flow and values are outgoing flow
    const pieceTypes = {
        // curved pieces
        topRight: {
            south: "west",
            west: "south",
            normal: "west",
            class: "curve top-right",
            passed: false
        },
        bottomRight: {
            north: "west",
            west: "north",
            normal: "north",
            class: "curve bottom-right",
            passed: false
        },
        topLeft: {
            south: "east",
            east: "south",
            normal: "south",
            class: "curve top-left",
            passed: false
        },
        bottomLeft: {
            north: "east",
            east: "north",
            normal: "east",
            class: "curve bottom-left",
            passed: false
        },
        // straight pieces
        vertical: {
            south: "north",
            north: "south",
            normal: "south",
            class: "vertical-straight",
            passed: false
        },
        horizontal: {
            east: "west",
            west: "east",
            normal: "west",
            class: "straight",
            passed: false
        },
        // cross piece
        cross: {
            north: "south",
            south: "north",
            east: "west",
            west: "east",
            normal: "west south",
            class: "straight",
            passed: false
        },
    };

    // pieces not placed by the player
    const specialPieces = {
        end: {
            east: "west",
            west: "east",
            normal: "west",
            passed: false
        }
    };

    // Pipe Object, also sets appropriate class depending on piece type
    function Pipe(name, type) {
        this.name = name;
        this.flow = type; // holds the respective type object from pieceTypes
        this.passed = type.passed; // boolean, whether pipe has been used yet
        this.class = type.class;
    }


    // Pile Object
    function Pile(visible_pieces) {
        this.pile = [];
        // generate new pipe piece and put to beginning of pile queue
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
            this.generatePiece();
        }
    }

    // water object
    // this object is a pointer to current position of the water
    function Water() {
        this.path = []; // 2d array storing location of every pipe placed
        // fix for uncaught type error when accessing unset property of path array for checkConnected()
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
        // generates pipe on the board
        this.generatePoint = function (text, type = "end") {
            let x = "";
            let y = Math.floor(Math.random() * ROWS);
            if (text === "start") {
                x = 0;
            } else if (text === "end") {
                x = COLS - 1;
            } else {
                x = Math.floor(Math.random() * COLS);
            }
            this.addToPath(x, y, new Pipe(type, specialPieces[type]));
            this.path[x][y].passed = true;
            let row = $("#board").find(".row[data-index='" + y + "']");
            let col = $(row).find("div[data-index='" + x + "']");
            $(col).html($("<div>").addClass(type));
            return { x: x, y: y };
        }
        this.generateEnds = function () {
            this.setDirection("east");
            this.start = this.generatePoint("start");
            this.end = this.generatePoint("end");
            this.x = this.start.x;
            this.y = this.start.y;
        }
        // future: set direction to either flow of starting pipe
        // set direction of water flow
        this.setDirection = function (direction = "") {
            if (direction === "") {
                let directions = ["north", "east", "south", "west"];
                this.direction = directions[Math.floor(Math.random() * 4)];
            } else {
                this.direction = direction;
            }
        }
        // adds placed pipe to the path
        this.addToPath = function (x, y, pipe) {
            let temp_data = [];
            if (this.path[x] === undefined) {
                temp_data[y] = pipe;
            } else {
                temp_data = this.path[x]; // get the row
                temp_data[y] = pipe; // assign the pipe to the col
            }
            this.path[x] = temp_data;
        }
        // checks if water flow is opposite of standard flow of the pipe
        // and reverses water flow direction in animation if so
        this.reverse = function (direction) {
            let currentPipe = $(".row[data-index='" + this.y + "']").find(".block[data-index='" + this.x + "']").find("div");
            if (!this.path[this.x][this.y].flow.normal.includes(direction)) {
                if (this.path[this.x][this.y].name === "cross") {
                    if (direction === "east") {
                        currentPipe.addClass("reverse");
                    } else if (direction === "north") {
                        currentPipe.find("div").addClass("reverse");
                    }
                } else {
                    $(currentPipe).addClass("reverse");
                }
            }
        }
        // add anim class to pipe which sets animation-play-state to running
        this.animate = function () {
            let currentPipe = $(".row[data-index='" + this.y + "']").find(".block[data-index='" + this.x + "']").find("div")
            if (["north", "south"].includes(this.direction) && this.path[this.x][this.y].name === "cross") {
                $(currentPipe).find("div").addClass("anim-vert-cross");
            } else {
                $(currentPipe).addClass("anim");
            }
        }
        // checks if next pipe is connected to current pipe where water is
        this.checkConnected = function () {
            let pipe = this.path;
            // check if at end pipe
            if (this.x === this.end.x && pipe[this.x][this.y].flow.hasOwnProperty("east") && this.y === this.end.y) {
                console.log("You won");
                $("#bg-music").get(0).pause();
                audio.win.play();
                // displayBanner("You Win!", bgColors.win);
                started = false;
                setTimeout(function () {
                    toNextLevel();
                }, audio.win.duration * 1000);
                return false;
            } else if (this.direction === "east" && this.x + 1 < COLS) {
                if (pipe[this.x + 1][this.y].flow.hasOwnProperty("west")) {
                    this.path[this.x + 1][this.y].passed = true;
                    this.setDirection(pipe[this.x + 1][this.y].flow.west);
                    // update position of water to next connected pipe
                    this.x += 1;
                    this.reverse("west");
                    return true;
                }
            } else if (this.direction === "west" && this.x - 1 >= 0) {
                if (pipe[this.x - 1][this.y].flow.hasOwnProperty("east")) {
                    this.path[this.x - 1][this.y].passed = true;
                    this.setDirection(pipe[this.x - 1][this.y].flow.east);
                    this.x -= 1;
                    this.reverse("east");
                    return true;
                }
            } else if (this.direction === "north" && this.y - 1 >= 0) {
                if (pipe[this.x][this.y - 1].flow.hasOwnProperty("south")) {
                    this.path[this.x][this.y - 1].passed = true;
                    this.setDirection(pipe[this.x][this.y - 1].flow.south);
                    this.y -= 1;
                    this.reverse("south");
                    return true;
                }
            } else if (this.direction === "south" && this.y + 1 < ROWS) {
                if (pipe[this.x][this.y + 1].flow.hasOwnProperty("north")) {
                    this.path[this.x][this.y + 1].passed = true;
                    this.setDirection(pipe[this.x][this.y + 1].flow.north);
                    this.y += 1;
                    this.reverse("north");
                    return true;
                }
            }
            // lost
            console.log("You lose");
            $("#bg-music").get(0).pause();
            audio.lose.play();
            displayBanner("You Lose", bgColors.lose);
            return false;
        }
        // allowing to use this water object in below setInterval scope
        let _this = this;
        this.startFlow = function () {
            function doAnim() {
                _this.animate();
            }
            doAnim();
            let animFlow = setInterval(doAnim, WATER_SPEED);
            let flow = setInterval(function () {
                if (_this.checkConnected()) {
                    audio.pass.play();
                    score += 100;
                    $("#score").text(score);
                } else {
                    clearInterval(animFlow);
                    clearInterval(flow);
                    started = false;
                }
                doAnim();
            }, WATER_SPEED);
        }
        this.resetPath();
        this.generateEnds();
    }

    $("#board").on("click", ".block", function () {
        if (started) {
            let rowIndex = $(this).data("index");
            let colIndex = $(this).parent().data("index");
            if (!water.path[rowIndex][colIndex].passed) {
                $(this).html($(".current").removeClass("current pile-block"));
                water.addToPath(rowIndex, colIndex, pile.pile[VISIBLE_PIECES - 1]);
                pile.removePiece();
                pile.generatePiece();
                audio.placed.play();
                audio.placed.currentTime = 0;
                updateBoardPile();
            } else {
                audio.notAllowed.play();
                audio.notAllowed.currentTime = 0;
            }
        }
    });

    // update pile in document
    function updateBoardPile() {
        $("#pile").html("");
        for (let i = 0; i < pile.pile.length; i++) {
            let piece = $("<div>");
            if (i === pile.pile.length - 1) {
                $(piece).addClass("current");
            }
            if (pile.pile[i].name === "cross") {
                let horizontal = $("<div>");
                $(horizontal).addClass("vertical-cross vertical-straight");
                $(piece).html(horizontal);
            }
            $(piece).attr({ id: "next" + i });
            $(piece).addClass(pile.pile[i].class + " pile-block");
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
                let block = $("<div>");
                $(block).attr({
                    id: "block" + i + z,
                    class: "block",
                    "data-index": z
                });
                board.find("#row" + i).append(block);
            }
        }
    }

    function displayBanner(text, bgColor) {
        if (text !== "") {
            $("#msg-banner").html("<h1>" + text + "</h1>");
        }
        if (bgColor !== "") {
            $("#msg-banner").css({ "background-color": bgColor });
        }
        $("#msg-banner").show()
        $("#msg-banner").fadeOut(3000);
    }

    $("#start").on("click", function () {
        audio.start.play();
        $(this).hide();
        started = true;
        displayBanner("Level " + level, bgColors.msg);
        setTimeout(function () {
            doCountdown();
            // let countdown = setInterval(function () {
            //     if (time >= 0) {
            //         doCountdown();
            //     } else {
            //         clearInterval(countdown);
            //     }
            // }, 1000);
            let flow = setTimeout(function () {
                water.startFlow(flow);
            }, TIME_TO_START);
            $("#bg-music").get(0).play(); // get(0) audio object from element
        }, audio.start.duration * 1000);
    })

    function doCountdown() {
        $("#time").text(time);
        time--;
        let countdown = setInterval(function () {
            if (time >= 0) {
                $("#time").text(time);
                time--;
            } else {
                clearInterval(countdown);
            }
        }, 1000);
    }

    function toNextLevel() {
        $("#board").html("");
        createBoard();
        water.resetPath();
        water.generateEnds();
        level++;
        $("#level").text(level);
        time = TIME_TO_START / 1000 - (level - 1) > 1 ? TIME_TO_START / 1000 - (level - 1) : 1;
        // time = TIME_TO_START / 1000;
        $("#time").text(time);
        displayBanner("level " + level, bgColors.msg);
        audio.start.play();
        started = true;
        setTimeout(function () {
            let flow = setTimeout(function () {
                water.startFlow();
            }, time * 1000);
            $("#bg-music").get(0).play();
            doCountdown();
        }, audio.start.duration * 1000);
    }

    createBoard();
    const pile = new Pile(VISIBLE_PIECES);
    updateBoardPile();
    const water = new Water();
    $("#time").text(time);
});