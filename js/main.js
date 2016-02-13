(function () {
    "use strict";

    /**
     * Main application controller.
     * @constructor
     * @param {string} canvasId - Main canvas element ID.
     */
    var App = function (canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw makeException('CanvasIDNotFound',
                      'The given canvas ID could not be found');
        }

        try {
            this.gl = this.canvas.getContext('experimental-webgl');
            this.downInterval = 500;
        } catch (e) {
            alert(e.name + ': ' + e.message);
            throw e;
        }
    };

    /**
     * Starts running the game.
     */
    App.prototype.start = function () {
        if (!this.gl) {
            throw makeException('NoWebGLContext',
                          'The WebGL context could not be obtained');
        }

        // init all the things!

        // set the underlying data type for glMatrix
        glMatrix.setMatrixArrayType(Float32Array);

        this.initWebGL();
        this.initShaders();
        this.initObjects();
        this.initEvents();

        // start the drawing
        window.setInterval(this.drawScene.bind(this), 15);
    };

    /**
     * Initializes basic GL state.
     */
    App.prototype.initWebGL = function () {
        this.gl.clearColor(0, 0, 1, 1);
        this.gl.clearDepth(1);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        console.log('initWebGL finished');
    };

    /**
     * Loads the shaders used by the app.
     */
    App.prototype.initShaders = function () {
        var vertexShader = new GLShader(this.gl, 'shader-vs');
        var fragmentShader = new GLShader(this.gl, 'shader-fs');

        this.shaderProgram = new GLProgram(this.gl, vertexShader, fragmentShader);
        this.shaderProgram.use();

        this.shaderProgram.enableAttrib('aVertexPosition');
        this.shaderProgram.enableAttrib('aVertexColor');

        console.log('initShaders finished');
    };

    /**
     * Init game objects and logic.
     */
    App.prototype.initObjects = function () {
        this.board = new Board(this.gl);

        console.log('initObjects finished');
    };

    /**
     * Init event handling, like keyboard handling and timers.
     */
    App.prototype.initEvents = function () {
        document.addEventListener('keydown', (function (ev) {
            var key = ev.key || ev.keyIdentifier;
            if (key === "Unidentified") {
                return;
            }

            var unhandled = false;
            switch(key) {
                case 'ArrowLeft':
                case 'Left':
                    console.log('key: left');
                    this.board.moveLeft();
                    break;

                case 'ArrowRight':
                case 'Right':
                    console.log('key: right');
                    this.board.moveRight();
                    break;

                default:
                    unhandled = true;
                    console.log('unhandled keydown: ' + key);
            }

            if (!unhandled) {
                ev.preventDefault();
            }
        }).bind(this));

        // timer
        window.setInterval(function () {
            this.board.moveDown();
        }.bind(this), this.downInterval);
    };

    /**
     * Draws the scene.
     */
    App.prototype.drawScene = function () {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        if (!this.perspectiveMatrix) {
            this.perspectiveMatrix = mat4.create();
            mat4.perspective(this.perspectiveMatrix, 45, 800/600, 0.1, 100);
        }
        this.shaderProgram.setUniformMat4('uPMatrix', this.perspectiveMatrix);

        this.modelViewMatrix = mat4.create();
        mat4.translate(this.modelViewMatrix, mat4.create(), vec3.fromValues(0, 0, -50));

        this.board.draw(this.modelViewMatrix, this.shaderProgram);
    };

    /**
     * Get things running.
     * Call this from <body> onload event
     */
    window.startApp = function () {
        (new App('glcanvas')).start();
    };
})();
