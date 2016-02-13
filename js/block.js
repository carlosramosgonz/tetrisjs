(function (){
    "use strict";

    /**
     * Represents a drawable block (square).
     * @constructor
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {boolean} black - Should the block be black?
     */
    var Block = function(gl, black) {
        this.gl = gl;

        var vertices = [
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0,
            1.0, -1.0, 0.0,
            -1.0, -1.0, 0.0
        ];

        if (black) {
            var colors = new Array(4*4);
            // color (0,0,0) -> negro
            colors.fill(0);
            // alpha = 1
            for (var i = 3; i < 4*4; i += 4) {
                colors[i] = 1;
            }
        } else {
            var colors = [
                1.0,  1.0,  1.0,  1.0,    // blanco
                1.0,  0.0,  0.0,  1.0,    // rojo
                0.0,  1.0,  0.0,  1.0,    // verde
                0.0,  0.0,  1.0,  1.0     // azul
            ];
        }

        this.buffer = new GLBuffer(gl, vertices);
        this.colorBuffer = new GLBuffer(gl, colors);

        this.pos = vec3.create();
    };

    /**
     * Draws the block on the screen.
     * @param {GLProgram} shaderProgram - The shader program to use.
     */
    Block.prototype.draw = function(shaderProgram) {
        this.buffer.bind();
        this.gl.vertexAttribPointer(shaderProgram.attribs['aVertexPosition'],
                                    3, this.gl.FLOAT, false, 0, 0);
        this.colorBuffer.bind();
        this.gl.vertexAttribPointer(shaderProgram.attribs['aVertexColor'],
                                    4, this.gl.FLOAT, false, 0, 0);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    };

    window.Block = Block;
})();
