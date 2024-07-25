// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');

    //Define array of current nodes and edges between nodes
    let nodes = [];
    let edges = [];

    //Sets initial value for node IDs to be 1
    let curr_node_id = 1;

    //Set initial node size to the initial slider value
    let node_size_slider = document.getElementById("myRange");
    let node_scale = node_size_slider.value;
    let edge_zone_scale = node_scale/2;

    //Tracks if the mouse is currently being held down
    let mouseDown = false;

    //Tracks if a node is currently being moved
    let global_selected_node = false;

    //To do list:
    //Start implementing algos all in probably separate js files.
 
    //Color picker for nodes/edges/edge weights/direction triangles???
    
    //Add slider to control scale (increase or decrease distance between all nodes linearly)

    //Consider what should happen when trying to run an algo that doesn't map the type of the current graph.

    ///Figure out how to store and recall current graphs in cookies so it saves across page refresh!
    //Just need to store nodes/edges array

    //What to do with self-edges??? disallow or visually render a little loop?

    //!!Back edges have their edit weight box hidden by the first edge, also their directional arrows overlap

    
    //Handle the rendering of "live" elements, like nodes currently being moved and edges currently being created
    canvas.addEventListener('mousemove', function (event) {
        let curr_tool = getCurrTool();
        
        if(curr_tool == "node_move" && mouseDown){
            //Node move tool functionality
            let selected_node = coordIsNode(event.offsetX, event.offsetY);

            if(global_selected_node != false) selected_node = global_selected_node;
            else global_selected_node = selected_node;

            if(selected_node != false){
                selected_node.x = event.offsetX;
                selected_node.y = event.offsetY;
                
                rerender();
            }

        } else if(curr_tool == "edge_create" && mouseDown){
            //Allows an edge currently being created to render live and trace from the first node to the current mouse pos
            let selected_node = coordIsNode(event.offsetX, event.offsetY);

            //Checks if the user had clicked on a node at the start of the mouse drag action
            if(global_selected_node != false) selected_node = global_selected_node;
            else global_selected_node = selected_node;

            if(selected_node != false){
                //First rerender to clear previously rendered edge
                rerender();
                //Then draw edge from prev selected node to current mouse pos
                ctx.beginPath();
                ctx.moveTo(selected_node.x, selected_node.y);
                ctx.lineTo(event.offsetX, event.offsetY);
                ctx.stroke();
            }
        }

    });

    //Track if mouse is currently being held down so that elements can be dragged
    canvas.addEventListener('mousedown', function (event) {
        mouseDown = true;
    });

    canvas.addEventListener('mouseup', function (event) {
        mouseDown = false;

        //Enables edge creation tool functionality
        let curr_tool = getCurrTool();
        let curr_node = coordIsNode(event.offsetX, event.offsetY);
        if(curr_tool == "edge_create" && curr_node != false) addEdge(global_selected_node, curr_node);
        rerender();

        //!!!!!!!!!! Integrate this better
        onClick(event.offsetX, event.offsetY);

        //Clears out the variable tracking the node the mouse is being dragged from
        global_selected_node = false;
    });

    //Clears current graph completely
    function clearGraph(){
        nodes = [];
        edges = [];
        curr_node_id = 1;
        rerender();
    }

    //Link functionality to Clear Graph button
    document.getElementById("clear_graph").addEventListener("click", function (event){
        clearGraph();
    });

    function onClick(click_x, click_y){
        let currTool = getCurrTool();

        //Node creation tool functionality
        if(currTool == "node_create"){ 
            const x = click_x;
            const y = click_y;
            
            //Create new node, assign coordinates and unique id
            let new_node = {x:click_x, y:click_y, id:curr_node_id, name:""};
            curr_node_id += 1;

            console.log("Created node " + new_node.id);
    
            //Add node to list of nodes
            nodes.push(new_node);
    
            rerender(); // Redraw nodes on canvas

        //Erase tool functionality
        } else if(currTool == "erase"){
            let node_to_erase = coordIsNode(click_x, click_y);

            if(node_to_erase != false){
                //Remove all edges containing the node to erase
                let matching_indices = [];

                //!!!!!!!!!!! Condense these two loops; just have the one that steps backwards
                for(i = 0; i < edges.length; i++){ 
                    if(node_to_erase.id == edges[i].node1.id || node_to_erase.id == edges[i].node2.id)
                        matching_indices.push(i);
                    
                }

                for(i = edges.length - 1; i >= 0; i--){
                    for(j = 0; j < matching_indices.length; j++){
                        if(i == matching_indices[j]) 
                            edges.splice(i,1);
                    }
                }

                //Remove the node itself
                for(i = 0; i < nodes.length; i++){
                    //Matches by ID
                    if(node_to_erase.id == nodes[i].id){
                        nodes.splice(i, 1);
                        console.log("Deleted node " + node_to_erase.id);
                    }
                }
                
            } else {
                //Now check if clicked on an edge deletion zone
                for(i = edges.length - 1; i >= 0; i--){
                    let mid_x = (edges[i].node1.x + edges[i].node2.x)/2;
                    let mid_y = (edges[i].node1.y + edges[i].node2.y)/2;

                    //!!!!!!!! Make less ugly
                    if((click_x - mid_x) * (click_x - mid_x) + (click_y - mid_y) * (click_y - mid_y) <= edge_zone_scale * edge_zone_scale){
                        console.log("Deleted edge between " + edges[i].node1.id + " and " + edges[i].node2.id);
                        edges.splice(i, 1);
                    }
                }
                
            }

            rerender();
    
            //Run algorithm functionality!!!!
        }   else if (currTool == "run_algo"){
            let start_node = coordIsNode(click_x, click_y);
            let curr_algo = getCurrAlgo();

            //!!!!!!! Remember that some algos don't need a start node!!!!!!!!!
            if(start_node != false){
                //console.log("Running algo at node " + start_node.id);

                if(curr_algo == "bfs"){
                    bfs(start_node, nodes, edges);
                } else if (curr_algo == "dfs"){
                    dfs(start_node, nodes, edges);
                }
            }

        }
    }

    //Takes a set of coordinates, checks if a node exists at those coordinates, and returns that node if so, and false otherwise.
    function coordIsNode(click_x, click_y){
        let found = false;
        let found_node;

        nodes.forEach(node => {
            //Calculates if the given coordinates are within the boundary of the node, accounting for the current size of the node
            if(((click_x - node.x) * (click_x - node.x) + (click_y - node.y) * (click_y - node.y)) <= (node_scale * node_scale)){
                found = true;
                found_node = node;
            }
        });

        if(found) return found_node;
        else return false;
    }

    //Adds an edge between the two specified nodes
    function addEdge(node1, node2) {
        //Checks if an edge between the specified nodes already exists
        let edge_duplicate = false;
        for(i = 0; i < edges.length; i++){
            if(node1.id == edges[i].node1.id && node2.id == edges[i].node2.id) edge_duplicate = true;
        }

        //Prevents duplicate edges being added (directed)
        if(!edge_duplicate){
            let edge_to_add = {node1, node2, edge_weight:0}
            edges.push(edge_to_add);
            console.log("Added edge between " + node1.id + " and " + node2.id);
            rerender(); // Redraw edges if not a duplicate
        }
    }

    //Draws all edges currently in edge array
    function drawEdges() {
        ctx.strokeStyle = 'black'; // Edge color
        ctx.lineWidth = 2; // Edge width
        edges.forEach(edge => {
            //Draw edge between midpoints of nodes
            ctx.beginPath();
            ctx.moveTo(edge.node1.x, edge.node1.y);
            ctx.lineTo(edge.node2.x, edge.node2.y);
            ctx.stroke();

            //If erase tool is currently selected, render a zone to click on to delete corresponding edge.
            let graph_direction = getDirectionality();
            let curr_tool = getCurrTool();
            let mid_x = (edge.node1.x + edge.node2.x)/2;
            let mid_y = (edge.node1.y + edge.node2.y)/2;
            if(curr_tool == "erase"){
                //Create red circle as basis of deletion zone
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(mid_x, mid_y, edge_zone_scale, 0, 2 * Math.PI); //3rd value is size
                ctx.fill();
                
                //Create a black X over the deletion zone
                const factor = Math.sqrt(2)/2;
                ctx.beginPath();
                ctx.moveTo(mid_x + edge_zone_scale * factor, mid_y + edge_zone_scale * factor);
                ctx.lineTo(mid_x - edge_zone_scale * factor, mid_y - edge_zone_scale * factor);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(mid_x + edge_zone_scale * factor, mid_y - edge_zone_scale * factor);
                ctx.lineTo(mid_x - edge_zone_scale * factor, mid_y + edge_zone_scale * factor);
                ctx.stroke();

            } else if (graph_direction == "directed"){
                //Render triangle to indicate direction

                //t_dist: the height of the indicator triangle
                //s_dist: the width of the indicator triangle's base
                let t_dist = 20;
                let s_dist = 10;

                let x_dist = (edge.node2.x - edge.node1.x);
                let y_dist = (edge.node2.y - edge.node1.y);


                //Calculate the three endpoints of the triangle
                let tip_x = mid_x + t_dist * (x_dist) / Math.sqrt((x_dist)*(x_dist) + (y_dist)*(y_dist));
                let tip_y = mid_y + t_dist * (y_dist) / Math.sqrt((x_dist)*(x_dist) + (y_dist)*(y_dist));

                let side1_x = mid_x + s_dist * (-1) * y_dist / Math.sqrt((x_dist)*(x_dist) + (y_dist)*(y_dist));
                let side1_y = mid_y + s_dist * x_dist / Math.sqrt((x_dist)*(x_dist) + (y_dist)*(y_dist));

                let side2_x = mid_x - s_dist * (-1) * y_dist / Math.sqrt((x_dist)*(x_dist) + (y_dist)*(y_dist));
                let side2_y = mid_y - s_dist * x_dist / Math.sqrt((x_dist)*(x_dist) + (y_dist)*(y_dist));

                //Render the triangle
                ctx.beginPath();
                ctx.moveTo(tip_x, tip_y);
                ctx.lineTo(side1_x, side1_y);
                ctx.lineTo(side2_x, side2_y);
                ctx.closePath();

                ctx.fillStyle = "green";
                ctx.fill();
                ctx.fillStyle = "blue";
            }

        });

    }

    //Draws all nodes currently in node array
    function drawNodes() {
        ctx.fillStyle = 'blue';
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node_scale, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function drawLabels(){
        //Erase previous node labels
        let prev_node_labels = document.getElementsByName("node_label");
        for(i = prev_node_labels.length - 1; i >= 0; i--){
            prev_node_labels[i].remove();
        }

        //Erase previous edge labels
        let prev_edge_labels = document.getElementsByName("edge_label");
        for(i = prev_edge_labels.length - 1; i >= 0; i--){
            prev_edge_labels[i].remove();
        }

        let curr_tool = getCurrTool();
        if(curr_tool == "edit_value"){
            //Adds a text box to each node to allow the label to be changed
            nodes.forEach(node => {
                let input = document.createElement("input");
                input.type = "text";
                input.name = "node_label";
                if(node.name == "") input.value = node.id;
                else input.value = node.name;
                input.style.position = 'absolute';
                input.style.left = (node.x - node_scale + 8) + "px";
                input.style.top = (node.y) + 325 + "px"; //!!!!! Magic number bad!!!! Get offset from page itself!
                input.style.width = (1.75 * node_scale) + "px"; 

                //Changes the node name to the current textbox value when the enter key is pressed
                input.addEventListener("keydown", function(event) {
                    if (event.key == "Enter") {
                        console.log("Renamed node " + node.id + " to " + input.value);
                        node.name = input.value;
                        rerender();
                    }
                });

                //Does the same if the text box loses focus
                input.addEventListener("focusout", function(event) {
                        console.log("Renamed node " + node.id + " to " + input.value);
                        node.name = input.value;
                        rerender();
                });
    
                document.body.appendChild(input);
            });

            //Adds input text boxes to each edge IF the graph is weighted
            let graph_weighted = getWeighted();
            if(graph_weighted == "weighted"){
                edges.forEach(edge => {
                    let mid_x = (edge.node1.x + edge.node2.x)/2;
                    let mid_y = (edge.node1.y + edge.node2.y)/2;

                    let input = document.createElement("input");
                    input.type = "text";
                    input.name = "edge_label";
                    input.value = edge.edge_weight;
                    input.style.position = 'absolute';
                    input.style.left = (mid_x) + "px";
                    input.style.top = (mid_y) + 575 + "px"; //!!!!! Magic number bad!!!! Get offset from page itself!

                    //Changes the node name to the current textbox value when the enter key is pressed
                    input.addEventListener("keydown", function(event) {
                        if (event.key == "Enter" && !isNaN(Number(input.value))) {
                            console.log("Changed edge between nodes " + edge.node1.id + " and " + edge.node2.id + " to be " + Number(input.value));
                            edge.edge_weight = Number(input.value);
                            rerender();
                        } else if (event.key == "Enter") rerender();
                    });

                    //Does the same if the textbox looses focus
                    input.addEventListener("focusout", function(event) {
                        if(!isNaN(Number(input.value))){
                            console.log("Changed edge between nodes " + edge.node1.id + " and " + edge.node2.id + " to be " + Number(input.value));
                            edge.edge_weight = Number(input.value);
                            rerender();
                        }
                    });

                    document.body.appendChild(input);
                });
            }

        } else {
            //Render node labels
            nodes.forEach(node => {
                //Use id as label if no defined name
                let label;
                if(node.name == "") label = "" + node.id;
                else label = node.name;
    
                ctx.font = (2 * node_scale /label.length) + "px Georgia";
                ctx.fillStyle = 'white';
                ctx.fillText(label, node.x - node_scale / 2, node.y + node_scale / 2);
            });

            //Render edges if graph is weighted
            let graph_weighted = getWeighted();
            if(graph_weighted == "weighted" && curr_tool != "erase"){
                edges.forEach(edge => {
                    let edge_mid_x = (edge.node1.x + edge.node2.x)/2;
                    let edge_mid_y = (edge.node1.y + edge.node2.y)/2;
                    ctx.font = node_scale / Math.sqrt(("" + edge.edge_weight).length) + "px Georgia"; //!!!!!! Scales small too quickly!!
                    ctx.fillStyle = 'red';
                    ctx.fillText("" + edge.edge_weight, edge_mid_x, edge_mid_y);
                });

            }

        };
        
    }
   

    //Clears the canvas, then draws edges, then nodes overtop
    function rerender(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawEdges();
        drawNodes();
        drawLabels();
    }

    //Re-renders canvas when tool selection or graph properties are changed
    let tool_buttons = document.getElementsByName("curr_tool");
    tool_buttons.forEach(button => {
        button.addEventListener("click", function (event){
            rerender();
        });
    });

    let weight_buttons = document.getElementsByName("weight");
    weight_buttons.forEach(button => {
        button.addEventListener("click", function (event){
            rerender();
        });
    });

    let direction_buttons = document.getElementsByName("directionality");
    direction_buttons.forEach(button => {
        button.addEventListener("click", function (event){
            rerender();
        });
    });


    //Update node scale value whenever the slider value changes
    var slider = document.getElementById("myRange");
    slider.oninput = function() {
        node_scale = this.value;
        edge_zone_scale = node_scale/2;
        rerender();
    } 

    //Returns the id of the currently selected tool
    function getCurrTool() {
        var ele = document.getElementsByName('curr_tool');

        for (i = 0; i < ele.length; i++) {
            if (ele[i].checked)
                return ele[i].id;
        }
    }

    //Returns the id of the currently selected algorithm
    function getCurrAlgo() {
        var ele = document.getElementsByName('curr_algo');

        for (i = 0; i < ele.length; i++) {
            if (ele[i].checked)
                return ele[i].id;
        }
    }

    //Returns whether weighted or unweighted are selected
    function getWeighted() {
        var ele = document.getElementsByName('weight');

        for (i = 0; i < ele.length; i++) {
            if (ele[i].checked)
                return ele[i].id;
        }
    }

    //Returns whether directed or undirected is selected
    function getDirectionality() {
        var ele = document.getElementsByName('directionality');

        for (i = 0; i < ele.length; i++) {
            if (ele[i].checked)
                return ele[i].id;
        }
    }

    // Initialize your application or call initial setup functions
    // For example:
    function init() {
        // Perform any initial setup tasks
        // Start your application logic here
    }

    init(); // Call initialization function
});