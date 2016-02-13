(function() {
    "use strict";

    /**
     * Creates a new shader object.
     * @constructor
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {string} name - ID of the <script> element with the shader code.
     */
    var GLShader = function(gl, name) {
        var shaderScript = document.getElementById(name);
        if (!shaderScript) {
            throw {
                name: 'ElementIDNotFound',
                message: "Can't find element with ID: "  + name
            };
        }

        var srcCode = "";
        var curChild = shaderScript.firstChild;

        while (curChild) {
            if (curChild.nodeType == 3) {
                srcCode += curChild.textContent;
            }

            curChild = curChild.nextSibling;
        }

        if (shaderScript.type === "x-shader/x-fragment") {
            this.id = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type === "x-shader/x-vertex") {
            this.id = gl.createShader(gl.VERTEX_SHADER);
        } else {
            throw {
                name: 'ShaderType',
                message: 'Tipo de shader no soportado.'
            };
        }

        gl.shaderSource(this.id, srcCode);
        gl.compileShader(this.id);

        if (!gl.getShaderParameter(this.id, gl.COMPILE_STATUS)) {
            throw {
                name: 'CompileShaderError',
                message: 'Error compiling shader: ' + gl.getShaderInfoLog(shader)
            };
        }
    };

    /**
     * Creates a new shader program (combination of vertex/fragment shaders).
     * @constructor
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {Shader} vShader - Vertex shader
     * @param {Shader} fShader - Fragment shader
     */
    var GLProgram = function(gl, vShader, fShader) {
        this.gl = gl;
        this.id = gl.createProgram();
        gl.attachShader(this.id, vShader.id);
        gl.attachShader(this.id, fShader.id);
        gl.linkProgram(this.id);
        this.attribs = {};
        this.uniforms = {};
    };

    /** Set this shader program as the current active one. */
    GLProgram.prototype.use = function() { this.gl.useProgram(this.id) };

    /**
     * Enables the given attribute in the shader program.
     * @param {string} name - Name of the attribute.
     */
    GLProgram.prototype.enableAttrib = function(name) {
        if (!this.attribs[name]) {
            this.attribs[name] = this.gl.getAttribLocation(this.id, name);
        }
        this.gl.enableVertexAttribArray(this.attribs[name]);
    };

    /**
     * Loads a 4x4 matrix in the given uniform.
     * @param {string} uniformName - Name of the uniform.
     * @param {Float32Array} mat - 4x4 matrix
     */
    GLProgram.prototype.setUniformMat4 = function (uniformName, mat) {
      if (!this.uniforms[uniformName]) {
        this.uniforms[uniformName] = this.gl.getUniformLocation(this.id, uniformName);
      }
      this.gl.uniformMatrix4fv(this.uniforms[uniformName], false, mat);
    };

    window.GLShader = GLShader;
    window.GLProgram = GLProgram;
})();
