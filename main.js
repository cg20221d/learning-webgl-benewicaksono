function main() {
    var kanvas = document.getElementById("kanvas");
    var gl = kanvas.getContext("webgl");

    var vertices = [
        0.5, 0.0, 0.0, 1.0, 1.0,   // A: kanan atas    (BIRU LANGIT)
        0.0, -0.5, 1.0, 0.0, 1.0,  // B: bawah tengah  (MAGENTA)
        -0.5, 0.0, 1.0, 1.0, 0.0,  // C: kiri atas     (KUNING)
        0.0, 0.5, 1.0, 1.0, 1.0    // D: atas tengah   (PUTIH)
    ];

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Vertex shader
    var vertexShaderCode =  `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    uniform float uTheta;
    uniform vec2 uDelta;
    varying vec3 vColor;
    void main() {
        vec2 position = aPosition;
        mat4 rotation = mat4(
            cos(uTheta), sin(uTheta), 0.0, 0.0,
            -sin(uTheta), cos(uTheta), 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        );
        mat4 translation = mat4(
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            uDelta.x, uDelta.y, 0.0, 1.0
        );
        gl_Position = translation * rotation * vec4(position, 0.0, 1.0);
        vColor = aColor;
    }
    `;
    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderCode);
    gl.compileShader(vertexShaderObject);   // sampai sini sudah jadi .o

    // Fragment shader
    var fragmentShaderCode = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
    `;
    var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderCode);
    gl.compileShader(fragmentShaderObject);   // sampai sini sudah jadi .o

    var shaderProgram = gl.createProgram(); // wadah dari executable (.exe)
    gl.attachShader(shaderProgram, vertexShaderObject);
    gl.attachShader(shaderProgram, fragmentShaderObject);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Variabel lokal
    var theta = 0.0;
    var freeze = false;
    var horizontalSpeed = 0.0;
    var verticalSpeed = 0.0;
    var horizontalDelta = 0.0;
    var verticalDelta = 0.0;

    // Variabel pointer ke GLSL
    var uTheta = gl.getUniformLocation(shaderProgram, "uTheta");
    var uDelta = gl.getUniformLocation(shaderProgram, "uDelta");

    // Kita mengajari GPU bagaimana caranya mengoleksi
    //  nilai posisi dari ARRAY_BUFFER
    //  untuk setiap verteks yang sedang diproses
    var aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 
        5 * Float32Array.BYTES_PER_ELEMENT, 
        0);
    gl.enableVertexAttribArray(aPosition);
    var aColor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 
        5 * Float32Array.BYTES_PER_ELEMENT, 
        2 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aColor);

    // Grafika interaktif
    // Tetikus
    function onMouseClick(event) {
        freeze = !freeze;
    }
    document.addEventListener("click", onMouseClick);
    // Papan ketuk
    function onKeydown(event) {
        if (event.keyCode == 32) freeze = !freeze;  // spasi
        // Gerakan horizontal: a ke kiri, d ke kanan
        if (event.keyCode == 65) {  // a
            horizontalSpeed = -0.01;
        } else if (event.keyCode == 68) {   // d
            horizontalSpeed = 0.01;
        }
        // Gerakan vertikal: w ke atas, s ke bawah
        if (event.keyCode == 87) {  // w
            verticalSpeed = -0.01;
        } else if (event.keyCode == 83) {   // s
            verticalSpeed = 0.01;
        }
    }
    function onKeyup(event) {
        if (event.keyCode == 32) freeze = !freeze;
        if (event.keyCode == 65 || event.keyCode == 68) horizontalSpeed = 0.0;
        if (event.keyCode == 87 || event.keyCode == 83) verticalSpeed = 0.0;
    }
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);

    function render() {
        gl.clearColor(1.0,      0.65,    0.0,    1.0);  // Oranye
        //            Merah     Hijau   Biru    Transparansi
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (!freeze) {
            theta += 0.1;
            gl.uniform1f(uTheta, theta);
        }
        horizontalDelta += horizontalSpeed;
        verticalDelta -= verticalSpeed;
        gl.uniform2f(uDelta, horizontalDelta, verticalDelta);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
