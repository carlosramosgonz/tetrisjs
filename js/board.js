(function () {
    "use strict";

    var BOARD_SIZE_X = 10;
    var BOARD_SIZE_Y = 20;
	
	/**
	 * Returns a random integer from 0 to max.
	 */
	function RandomInt(max) {
		return Math.floor(Math.random() * max);
	}
	
	/**
	 * Gets a new random piece.
	 * @returns An array with the positions on the board (from (0,0)) of the piece.
	 */
	function GetRandomPiece() {
		var pieceName = window.PiecesNames[RandomInt(window.PiecesNames.length)];
		var variantNumber = 0;   // just one variant for now - when we add rotation there'll be more
		
		return window.Pieces[pieceName][variantNumber];
	}

    /**
     * Represents the game board. All the game logic happens here.
     * @constructor
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    var Board = function (gl) {
        this.gl = gl;

        this.boardArray = [];
        for (var i = 0; i < BOARD_SIZE_Y; i++) {
            var row = new Array(BOARD_SIZE_X);
            row.fill(' ');  // a space = no pieces there
            this.boardArray.push(row);
        }

        this.currentPiece = {
            blocks: GetRandomPiece()
        };
    };

    /**
     * Tests if the current piece would collision with other or the board limits
     * in case it moved by (dx, dy).
     * @param {Number} dx - X displacement
     * @param {Number} dy - Y displacement
     */
    Board.prototype.testCollision = function (dx, dy) {
        var newPositions = [];

        for (var i = 0; i < this.currentPiece.blocks.length; i++) {
            // get each block and move it by (dx, dy)
            var block = this.currentPiece.blocks[i];
            block = [block[0] + dy, block[1] + dx];

            if (block[0] < 0 || block[1] < 0 || block[0] >= BOARD_SIZE_Y || block[1] >= BOARD_SIZE_X) {
                // it collides with the board limits
                return true;
            } else if (this.boardArray[block[0]][block[1]] === 'X') {
                // it collides with other block
                return true;
            } else {
                // doesn't collide, save the new position of the block
                newPositions.push(block);
            }
        }

        // in case there's no collision, we can reuse the new positions array
        // instead of throwing it away and re-calculating it again later
        return {
            collision: false,
            newPositions: newPositions
        };
    };

    Board.prototype.move = function (dx, dy) {
        var testCollision = this.testCollision(dx, dy);
        if (testCollision === true) {
            return true;
        }

        this.currentPiece.blocks = testCollision.newPositions;
    };

    Board.prototype.moveLeft = function () {
        this.move(-1, 0);
    };

    Board.prototype.moveRight = function () {
        this.move(1, 0);
    };

    /**
     * Moves the current piece down.
     */
    Board.prototype.moveDown = function () {
        console.log('move down');
        if (this.move(0, 1)) {
			// there's a collision: put the current piece in the board and
			// make a new one
            this.currentPiece.blocks.forEach(function (block) {
                this.boardArray[block[0]][block[1]] = 'X';
            }.bind(this));
			
			this.currentPiece.blocks = GetRandomPiece();
        }
    };

    /**
     * Draws the boards and all the pieces.
     * @param {Float32Array} modelView - The model-view matrix.
     * @param {GLProgram} shaderProgram - The shader program to use to draw.
     */
    Board.prototype.draw = function (modelView, shaderProgram) {
        // if we're on our first draw, create the objects we'll use to draw
        if (!this.block) {
            this.block = new Block(this.gl);
        }
        if (!this.blackBlock) {
            this.blackBlock = new Block(this.gl, true);
        }

        // helper function we'll use to convert local coordinates to
        // global (screen) coordinates
        var LocalToWorld = function (x, y) {
            return vec3.fromValues(x*2 - 10, -y*2 + 20, 0);
        };

        // draw the board and all the pieces (except the current one)
        this.boardArray.forEach(function (boardRow, i) {
            boardRow.forEach(function (block, j) {
                var worldPos = LocalToWorld(j, i);
                var currentMV = mat4.create();
                mat4.translate(currentMV, modelView, worldPos);

                shaderProgram.setUniformMat4('uMVMatrix', currentMV);
                if (block === 'X') {
                    this.block.draw(shaderProgram);
                } else {
                    this.blackBlock.draw(shaderProgram);
                }
            }.bind(this));
        }.bind(this));

        // draw the current piece
        if (this.currentPiece.blocks) {
            this.currentPiece.blocks.forEach(function (currentBlock) {
                var worldPos = LocalToWorld(currentBlock[1], currentBlock[0]);
                var mv = mat4.create();
                mat4.translate(mv, modelView, worldPos);

                shaderProgram.setUniformMat4('uMVMatrix', mv);
                this.block.draw(shaderProgram);
            }.bind(this));
        }
    };

    window.Board = Board;
})();
