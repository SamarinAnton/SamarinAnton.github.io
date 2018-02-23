window.onload = function () {

    // Colors
    var WHITE_COLOR = "#ffffff",
        BLACK_COLOR = "#000",
        CURRENT_NODE_COLOR = "#ff3300",
        EXTRA_EDGE_COLOR = "#ffff00",
        FIRST_NODE_COLOR = "#00ff00",
        DEFAULT_NODE_COLOR = "#000",
        DEFAULT_EDGE_COLOR = "#000";

    // Canvas variables
    var canvas,
        ctx,
        nodes,
        draw,
        dragNode,
        dragPoint,
		deleteNode;

    var NODE_RANGE = 3;


    var info_field,
        setTextToInfo;

    // Welcome Info
    info_field = document.getElementById("info_field");
    setTextToInfo = function (info) {
        info_field.innerHTML = info;
    };

    /*
     BUTTONS
     */
    var currentBtn,
		btnDeleteNode,
        btnCreateNode,
        btnWork,
        btnStop,
        btnView,
        btnClearCanvas,
        btnCreateRandomNodes,
        btnNextStep;

	btnDeleteNode = document.getElementById('btn_delete_nodes');
	btnDeleteNode.addEventListener("click", function (event) {
        changeCurrentButton(btnDeleteNode);
    }, false);


    btnCreateNode = document.getElementById('btn_create_node');
    btnCreateNode.addEventListener("click", function (event) {
        changeCurrentButton(btnCreateNode);
    }, false);

    btnView = document.getElementById('btn_view');
    btnView.addEventListener("click", function (event) {
        changeCurrentButton(btnView);
    }, false);

    btnClearCanvas = document.getElementById('btn_clear_canvas');
    btnClearCanvas.addEventListener("click", function (event) {
        clearNodes();
        draw();
    }, false);

    btnCreateRandomNodes = document.getElementById("btn_create_random_nodes");
    btnCreateRandomNodes.addEventListener("click", function (event) {
        createRandomNodes();
    }, false);

    btnWork = document.getElementById("btn_work");
    btnWork.disabled = true;
    btnWork.addEventListener("click", function (event) {
        if (btnWork.disabled) return;
        if (isPaused || isStopped) {
            if (isFirstStart) {
                currentStep = startAlgorithm;
                btnStop.disabled = false;
                btnStop.src = "imgs/stop_red.png";
                isStopped = false;
                isFirstStart = false;
            }

            btnNextStep.disabled = true;
            btnNextStep.src = "imgs/next_black.png";
            btnWork.src = "imgs/pause_yellow.png";
            isPaused = false;
            setTextToInfo("For more information lets try pause mode");
            nextStep(currentStep);
        } else {
            isPaused = true;
            btnWork.src = "imgs/start_green.png";
            btnNextStep.disabled = false;
            btnNextStep.src = "imgs/next_blue.png";
            clearTimeout(nextTimer);
        }
    }, false);

    btnStop = document.getElementById("btn_stop");
    btnStop.disabled = false;
    btnStop.src = "imgs/stop_black.png";
    btnStop.addEventListener("click", function (event) {
        if (btnStop.disabled) return;
        clearTimeout(nextTimer);
        isStopped = true;
        btnStop.disabled = true;
        btnStop.src = "imgs/stop_black.png";
        isPaused = false;
        btnWork.disabled = false;
        btnWork.src = "imgs/start_green.png";
        isFirstStart = true;
        btnNextStep.disabled = false;
        btnNextStep.src = "imgs/next_blue.png";
        clearAlgorithmInfo();
    }, false);

    btnNextStep = document.getElementById("btn_next_step");
    btnNextStep.disabled = false;
    btnNextStep.src = "imgs/next_blue.png";
    btnNextStep.addEventListener("click", function (event) {
        if (btnNextStep.disabled) return;
        if (isFirstStart) {
            currentStep = startAlgorithm;
            btnStop.disabled = false;
            btnStop.src = "imgs/stop_red.png";
            isStopped = false;
            isFirstStart = false;
        }
        isPaused = true;
        btnWork.src = "imgs/start_green.png";
        isSkipped = true;
        nextStep(currentStep);
    }, false);


    // Return back default settings
    var clearAlgorithmInfo = function () {
        setTextToInfo("All settings are default");
        nodes.forEach(function (node) {
            node.edge = undefined;
            node.extraEdge = undefined;
			node.setNodeColor(DEFAULT_NODE_COLOR);
        });
    };

    var SRC_VIEW_CURRENT = "imgs/view_current.png",
        SRC_VIEW_BLACK = "imgs/view_black.png",
        SRC_CREATE_CURRENT = "imgs/create_current.png",
        SRC_CREATE_BLACK = "imgs/create_black.png";

		SRC_DELETE_CURRENT = "imgs/delete_red.ico";
		SRC_DELETE_BLACK = "imgs/delete_black.ico";


    var changeCurrentButton = function (button) {
        switch (button.id) {
            case btnView.id:
                btnView.src = SRC_VIEW_CURRENT;
                btnCreateNode.src = SRC_CREATE_BLACK;
				btnDeleteNode.src = SRC_DELETE_BLACK;
                break;
            case btnCreateNode.id:
                btnCreateNode.src = SRC_CREATE_CURRENT;
                btnView.src = SRC_VIEW_BLACK;
				btnDeleteNode.src = SRC_DELETE_BLACK;
                break;
			case btnDeleteNode.id:
				btnDeleteNode.src = SRC_DELETE_CURRENT;
				btnView.src = SRC_VIEW_BLACK;
				btnCreateNode.src = SRC_CREATE_BLACK;
				break;
        }
        currentBtn = button;
    };

    // At first we in view module
    changeCurrentButton(btnView);


    /*
     Nodes
     */
    var clearNodes = function () {
        nodes = [];
        btnWork.disabled = true;
    };

    var Node = function (id, pos) {
        return {
            id: id,
            edge: undefined,
            extraEdge: undefined,
            x: pos.x,
            y: pos.y,
            color: DEFAULT_NODE_COLOR,

            setNodeColor: function (color) {
                this.color = color;
                draw();
            },

            createEdge: function (to) {
                this.edge = {
                    color: DEFAULT_EDGE_COLOR,
                    to: Number(to),

                    setEdgeColor: function (color) {
                        this.color = color;
                        draw();
                    }
                };
                draw();
            },

            createExtraEdge: function (to) {
                this.extraEdge = {
                    color: EXTRA_EDGE_COLOR,
                    to: Number(to)
                };
                draw();
            }
        };
    };

    var getNode = function (id) {
        return nodes[id];
    };

    nodes = [];

    /*
     Canvas + Draw
     */
    canvas = document.getElementById('canvas');

    ctx = canvas.getContext('2d');

    // Redraw canvas and his elements
    draw = function () {
        ctx.fillStyle = WHITE_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw edges
        nodes.forEach(function (node) {
            [node.edge, node.extraEdge].forEach(function (edge) {
                if (edge === undefined) return;
                var from = node,
                    to = getNode(edge.to);
                ctx.fillStyle = BLACK_COLOR;
                ctx.strokeStyle = edge.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            });
        });

        // Draw vertices
        nodes.forEach(function (node) {
            ctx.beginPath();
            ctx.fillStyle = node.color;
            ctx.strokeStyle = BLACK_COLOR;
            ctx.arc(node.x, node.y, NODE_RANGE, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = BLACK_COLOR;
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
        });
    };

    /*
     Random
     */
    var createRandomNodes = function () {
        clearNodes();
        btnWork.disabled = false;

        var nodesCount = Number(document.getElementById("nodes_count").value);
        if(nodesCount > 100) {
            randomException();
            return;
        } // if nodeCount >100, The work time will be long


        var nodesPos = [];

        var getRandomValue = function (limit) {
            return Math.floor(Math.random()*1000) % limit;
        };

        var compareCoordinateForCompatibility = function (pos1, pos2, withWhat) {
            return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) > withWhat * withWhat;
        };

        var checkBorders = function (pos) {
            var range = NODE_RANGE * 4;

            if(pos.x < range){
                pos.x += range;
            }
            if(canvas.width - pos.x < range){
                pos.x -= range;
            }
            if(pos.y < range){
                pos.y += range;
            }
            if(canvas.height - pos.y < range){
                pos.y -= range;
            }
            return pos;
        };

        var getRandomPos = function() {
            return checkBorders({
                x: getRandomValue(canvas.width),
                y: getRandomValue(canvas.height)
            });
        };

        var checkPosCompatibility = function (pos) {
            var check = true;
            nodesPos.forEach(function(nodePos) {
                check = check && compareCoordinateForCompatibility(pos, nodePos, NODE_RANGE);
            });
            return check;
        };

        // Generate vertices
        for(var i = 0; i < nodesCount; i++){
            var pos = getRandomPos();
            while(!checkPosCompatibility(pos)){
                pos = getRandomPos();
            }
            nodesPos.push(pos);
            createNode(pos);
        }

        draw();
        endRandom()
    };

	/*
     Delete node
     */

	canvas.addEventListener('click', function (event) {
        if (currentBtn !== btnDeleteNode) {
            return;
        }
		var pos = getMousePosFromEvent(event);
		deleteNode = getNodeByPos(pos);
		if (deleteNode !== undefined) {
			setTextToInfo("You delete node");
			nodes.splice(deleteNode.id, 1);
			for (i = deleteNode.id; i < nodes.length; i++) {
				nodes[i].id--;
			}
			draw();
        } else {
			setTextToInfo("You can't delete vertex. Try again. Click more close to vertex");
		}
		deleteNode = undefined;
	}, false);

    /*
     Node movement by mouse
     */

    // Get from mouse event coordinates relatively left-top corner of canvas
    var getMousePosFromEvent = function (evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    // Find node by coordinates
    var getNodeByPos = function (pos) {
        var result = undefined;
        nodes.forEach(function (node) {
            if (Math.pow((node.x - pos.x), 2) + Math.pow((node.y - pos.y), 2)
                <= NODE_RANGE * NODE_RANGE * 15) {
                result = node;
            }
        });
        return result;
    };

    // Find node and remember that in dragNode
    canvas.addEventListener('mousedown', function (event) {
        if (currentBtn !== btnView) {
            return;
        }
        var pos = getMousePosFromEvent(event);
        dragNode = getNodeByPos(pos);
        // Find dragPoint
        if (dragNode !== undefined) {
			setTextToInfo("Move vertex, where you want");
            dragPoint = {
                x: pos.x - dragNode.x,
                y: pos.y - dragNode.y
            }
        } else {
			setTextToInfo("You can't take vertex. Try again. Click more close to vertex");
		}
    }, false);

    // Forgot current dragNode
    canvas.addEventListener('mouseup', function () {
        dragNode = undefined;
    }, false);

    // Change node coordinate and redraw
    canvas.addEventListener('mousemove', function (event) {
        var pos;
        if (dragNode !== undefined) {
            pos = getMousePosFromEvent(event);
            dragNode.x = pos.x - dragPoint.x;
            dragNode.y = pos.y - dragPoint.y;
            draw();
        }
    }, false);

    /*
    Create
     */

    // Create node if now create mode
    canvas.addEventListener('click', function (event) {
        var pos = getMousePosFromEvent(event);
        switch (currentBtn.id) {
            case "btn_create_node":
                createNode(pos);
                break;
            default:
                return;
        }
        draw();
    }, false);

    var createNode = function (pos) {
        nodes.push(Node(nodes.length, pos));
        btnWork.disabled = false;
    };




    /*
    Algorithm
    */
    var nextStep,
        nextTimer,
        currentStep,
        isFirstStart = true,
        isStopped = true,
        isPaused = false,
        isSkipped = false,
        isPauseOrStop,
        firstNode,
        currentNode,
        nextNode,
        index,
        nextIndex;
    setSpeed = function () {return Number(document.getElementById("speed").value);}


    nextStep = function (func) {
        if(isSkipped){
            isSkipped = false;
            func();
            return;
        } else if(isPauseOrStop(func)) return;

        nextTimer = setTimeout(func, 1000/setSpeed());
    };

    isPauseOrStop = function (func) {
        currentStep = func;
        return isStopped || isPaused;
    };

    nextIndex = function (currInd) {
        index = (currInd + 1) % nodes.length;
    };

    var startAlgorithm = function () {
        setTextToInfo("Find the downiest node and start gift wrapping");
        nextStep(findFirstNodeStep);
    };

    var findFirstNodeStep = function () {
        firstNode = getNode(0);
        nodes.forEach(function (node) {
            if(node.y > firstNode.y) firstNode = node;
        });

        firstNode.setNodeColor(FIRST_NODE_COLOR);
        currentNode = firstNode;
        if (isPaused){setTextToInfo("Find next node");};
        nextStep(findNextNodeStep);
    };

    var findNextNodeStep = function () {
        nextIndex(currentNode.id);
        currentNode.createEdge(index);
        nextNode = getNode(index);
        nextIndex(index);
        if (isPaused){setTextToInfo("Take next node<br>Check this node with other nodes for rotation");};
        nextStep(findMinNodeStep);
    };

    var findMinNodeStep = function () {
        if(index === currentNode.id){
            setTextToInfo("For more information lets try pause mode");
            nextStep(setNextNodeStep);
            return;
        }

        currentNode.createExtraEdge(index);
        if (isPaused){setTextToInfo("Check rotation with this node");};
        nextStep(checkRotateStep);
    };

    var checkRotateStep = function () {
        var node = getNode(index);
        var rotate = (nextNode.x - currentNode.x)*(node.y - nextNode.y)
            - (nextNode.y - currentNode.y)*(node.x - nextNode.x);

        if(rotate > 0){
            nextNode = node;
            currentNode.createEdge(currentNode.extraEdge.to);
            if (isPaused){setTextToInfo("This node more righter than current. Change the node");};
        } else {
            if (isPaused) {setTextToInfo("This node less righter than current. Don't change the node");};
        }

        currentNode.extraEdge = undefined;
        draw();

        nextIndex(index);
        nextStep(findMinNodeStep);
    };

    var setNextNodeStep = function () {
        currentNode = nextNode;
        currentNode.setNodeColor(CURRENT_NODE_COLOR);
        if(currentNode.id === firstNode.id){
            if (isPaused){setTextToInfo("The algorithm returned in first node");};
            nextStep(endAlgorithm);
        }
        else {
            nextStep(findNextNodeStep);
            if (isPaused){setTextToInfo("Find next node");};
        }
    };

    /*
    Messeges
     */
    var endAlgorithm = function () {
        setTextToInfo("Algorithm finished");
    };
    var randomException = function () {
        setTextToInfo("Sorry, For your parameters, the visualization will take too long, we advise you to select an amount less than 100  ");
    };
    var endRandom = function () {
        setTextToInfo("vertices are generated");
    };

    draw();

};
