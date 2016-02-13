(function (){
    "use strict";

    /**
     * A buffer of vertices to draw.
     * @constructor
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {Array} vertices - Array of vertices
     */
    var GLBuffer = function(gl, vertices) {
        this.gl = gl;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    };

    /**
     * Bind this buffer to the current GL state.
     */
    GLBuffer.prototype.bind = function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    };

    window.GLBuffer = GLBuffer;

})();
