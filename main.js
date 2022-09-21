function main() {
    var kanvas = document.getElementById("kanvas")
    var gl = kanvas.getContext("webgl")

    var vertices = [
        0.5, 0.0, 0.0, 1.0, 1.0, // Kanan atas (Biru langit)
        0.0, -0.5, 1.0, 0.0, 1.0, // Bawah tengah (Magenta)
        -0.5, 0.0, 1.0, 1.0, 0.0, // Kiri atas (Kuning)
        0.0, 0.5, 1.0, 1.0, 1.0 // Atas tengah (Putih)
    ]

    var buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)

    // Vertex shader
    var vertexShaderCode = `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    uniform float uTheta;
    varying vec3 vColor;
    void main() {
        float x = -sin(uTheta) * aPosition.x + cos(uTheta) * aPosition.y;
        float y = cos(uTheta) * aPosition.x + sin(uTheta) * aPosition.y;
        gl_PointSize = 10.0;
        gl_Position = vec4(x, y, 0.0, 1.0);
        vColor = aColor;
    }`

    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShaderObject, vertexShaderCode)
    gl.compileShader(vertexShaderObject)

    // Fragment shader
    var fragmentShaderCode = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }`
    var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShaderObject, fragmentShaderCode)
    gl.compileShader(fragmentShaderObject)

    var shaderProgram = gl.createProgram() // wadah dari executable (.exe)
    gl.attachShader(shaderProgram, vertexShaderObject)
    gl.attachShader(shaderProgram, fragmentShaderObject)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)

    // Variabel Lokal
    var theta = 0.0;
    var freeze = false;

    // Variabel pointer ke GLSL
    var uTheta = gl.getUniformLocation(shaderProgram, "uTheta")

    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition")
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0)
    gl.enableVertexAttribArray(aPosition)

    var aColor = gl.getAttribLocation(shaderProgram, "aColor")
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT)
    gl.enableVertexAttribArray(aColor)

    // Grafika Interaktif
    function onMouseClick(e) {
        freeze = !freeze
    }

    document.addEventListener("click", onMouseClick)

    function render() {
        gl.clearColor(1.0, 0.65, 0.0, 1.0)
        //          Merah, Hijau, Biru, Transparansi
        gl.clear(gl.COLOR_BUFFER_BIT)

        if(!freeze) {
            theta += 0.1
            gl.uniform1f(uTheta, theta)
        }
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        requestAnimationFrame(render)
    }
    
    render()
}