var canvas;
var vertices = [];
var selectedVertex;

function setUp() {
    canvas = document.getElementById('canvas');
    background = document.getElementById('background');

    canvas.addEventListener('click', function(event) {
        createVertex(event.x, event.y);
        drawTriangulation();
        selectedVertex = null;
    });
    canvas.addEventListener('mousemove', function(event) {
        if (selectedVertex) {
            selectedVertex.setAttribute('cx', event.x);
            selectedVertex.setAttribute('cy', event.y);
            drawTriangulation();
        }
    });

    document.getElementById('toggle_background').addEventListener('click', function(event) {
        background.hidden = !background.hidden;
        if (background.hidden) {
            event.target.innerHTML = "Show Background";
        } else {
            event.target.innerHTML = "Hide Background";
        }
    });

    document.getElementById('set_background').addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            let reader = new FileReader();
            reader.onload = setBackground;
            reader.readAsDataURL(event.target.files[0]);
        }
    });

    fitCanvasToWindow();
    window.addEventListener('resize', fitCanvasToWindow);
}

function fitCanvasToWindow() {
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
}

function setBackground(event) {
    background.setAttribute('src', event.target.result);
}

function drawTriangulation() {
    let lines = canvas.getElementsByTagName('line');
    for (let i = lines.length - 1; i >= 0; i--) {
        canvas.removeChild(lines[i]);
    }

    if (vertices.length < 3) {
        return;
    }

    let nodes = [];
    for (let i = 0; i < vertices.length; i++) {
        nodes.push([vertices[i].getAttribute('cx'), vertices[i].getAttribute('cy')]);
    }
    let delaunator = DelaunatorModule.Delaunator.from(nodes);

    let edges = {};
    for (let t = 0; t < delaunator.triangles.length / 3; t++) {
        for (let i = 0; i < 3; i++) {
            let v1 = delaunator.triangles[3 * t + i];
            let v2 = delaunator.triangles[3 * t + (i + 1) % 3];
            if (v2 < v1) {
                let tmp = v1;
                v1 = v2;
                v2 = tmp;
            }
            if (v1 in edges) {
                if (edges[v1].includes(v2)) {
                    continue;
                } else {
                    edges[v1].push(v2);
                }
            } else {
                edges[v1] = [v2];
            }

            let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', nodes[v1][0]);
            line.setAttribute('y1', nodes[v1][1]);
            line.setAttribute('x2', nodes[v2][0]);
            line.setAttribute('y2', nodes[v2][1]);
            line.setAttribute('style', 'stroke:black;stroke-width:2');
            canvas.insertBefore(line, canvas.firstChild);
        }
    }
}

function createVertex(x, y) {
    let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 5);
    circle.setAttribute('style', 'stroke:none;fill:black');
    setCircleListeners(circle);
    canvas.appendChild(circle);
    vertices.push(circle);
}

function setCircleListeners(circle) {
    circle.addEventListener('mouseover', function() {
        circle.setAttribute('r', '10');
        circle.setAttribute('style', 'stroke:non;fill:red');
    });
    circle.addEventListener('mouseout', function() {
        circle.setAttribute('r', '5');
        circle.setAttribute('style', 'stroke:none;fill:black');
    });
    circle.addEventListener('mousedown', function() {
        circle.setAttribute('style', 'stroke:none;fill:blue');
        selectedVertex = circle;
    });
    circle.addEventListener('click', function() {
        circle.setAttribute('style', 'stroke:none;fill:red');
        event.stopPropagation();
        selectedVertex = null;
    });
}

(function() {
    setUp();
})();
