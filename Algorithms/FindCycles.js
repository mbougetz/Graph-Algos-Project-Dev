function findCycles(nodes, edges, graph_direction) {
    const graph = buildGraph(nodes, edges, graph_direction);
    const visited = new Set();
    const recStack = new Set(); // Used only for directed graphs

    //Stores detected cycles in a 2d array
    const cycles = [];

    //A modified version of DFS to track cycles
    function dfs(node, path, parent) {
        visited.add(node);
        recStack.add(node);
        path.push(node);

        getNeighbors(node, edges, graph_direction).forEach(neighbor => {
            if (!visited.has(neighbor)) {
                if (dfs(neighbor, path, node)) {
                    return true;
                }
            } else if (recStack.has(neighbor) && (graph_direction == "directed" || neighbor !== parent)) {
                // Cycle detected
                const cycleStart = path.indexOf(neighbor);
                cycles.push(path.slice(cycleStart).concat(neighbor));
                return true;
            }
        });

        recStack.delete(node);
        path.pop();
        return false;
    }

    //Run modified DFS on each node in the graph
    for (const node of nodes) {
        if (!visited.has(node)) {
            dfs(node, [], null);
        }
    }

    //Format the detected cycles and render as text in the output box
    formatCycleOutput(cycles);
    
}

//Formats the 2D array output
function formatCycleOutput(cycles){
    let output_box = document.getElementById("output_box");

    let formatted_text = "Cycles found:<br>";
    for(i = 0; i < cycles.length; i++){
        for(j = 0; j < cycles[i].length; j++){
            formatted_text += getNodeName(cycles[i][j]);
            if(j != cycles[i].length - 1) formatted_text += " => ";
        }
        formatted_text += "<br>";
    }

    //Render to output box
    output_box.innerHTML = formatted_text;
}

//Build out a subgraph to run dfs on
function buildGraph(nodes, edges, graph_direction) {
    const graph = {};
    for (const node of nodes) {
        graph[node] = [];
    }

    edges.forEach(edge => {
        graph[edge.node1].push(edge.node2)

        //Account for directionality of current graph
        if (graph_direction == "undirected") {
            graph[edge.node2].push(edge.node1); 
        }
    });

    return graph;
}