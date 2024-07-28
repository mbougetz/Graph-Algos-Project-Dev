//Define an infinite distance to be the maximum safe integer
const INFINITY = Number.MAX_SAFE_INTEGER;

//Run dijkstra's shortest path alogithm on the current graph
function dijkstra(start_node, nodes, edges, graph_direction){
    //Stores distances from start_node to every other node in the graph
    let distances = new Map();
    //Initialize the start node to have a distance from itself of 0
    distances.set(start_node, 0);

    let queue = [];

    nodes.forEach(node => {
        //Set initial distance for all non-start nodes to be infinity
        if(node.id != start_node.id) distances.set(node, INFINITY);

        //Add all nodes to queue
        queue.push(node);
    });

    while(queue.length > 0){
        let min_node = minNode(queue, distances);

        //Next dequeue min_node
        for(i = 0; i < queue.length; i++){
            if(queue[i].id == min_node.id) queue.splice(i, 1);
        }

        //Calculate minimum distance from current min_node to all its neighbors
        let neighbors = getNeighbors(min_node, edges, graph_direction);
        neighbors.forEach(node => {
            let curr_dist = distances.get(min_node) + getEdgeWeight(min_node, node, edges, graph_direction);

            //Update distance if current path is shorter
            if(curr_dist < distances.get(node)) distances.set(node, curr_dist);
        });

    }


    //Format and print the distances from start_node to all other reachable nodes
    formatDijkstraOutput(start_node, distances);
}

//Formats and prints the resultant output
function formatDijkstraOutput(start_node, distances){
    //Get reference to output text box
    let output_box = document.getElementById("output_box");

    //First sort distances ascending
    let sorted_distances = new Map([...distances.entries()].sort());

    //Format output text
    let formatted_text = "Results of running Dijkstra's shortest path algorithm starting from node " + getNodeName(start_node) + ":<br>";
    sorted_distances.forEach((dist, node) => {
        //If a node still has an unchanged distance of INFINITY, mark as unreachable
        if(dist == INFINITY) dist = "Unreachable";

        //Formats distance for each node
        //ignores the starting node as start_node will always have a distance from itself of 0
        if(start_node.id != node.id) formatted_text += "Distance from node " + getNodeName(start_node) + " to node " + getNodeName(node) + ": " + dist + "<br>";
    });

    //Place formatted text into output box
    output_box.innerHTML = formatted_text;
}

//Returns the weight of the edge between two given nodes
function getEdgeWeight(node1, node2, edges, graph_direction){
    let weight;

    //console.log("Searching for edge between " + node1.id + " and " + node2.id + " on a graph with directionality of " + graph_direction);
    edges.forEach(edge => {
        //console.log("Comparing to edge between " + edge.node1.id + " and " + edge.node2.id + " with weight " + edge.edge_weight);
        if(edge.node1.id == node1.id && edge.node2.id == node2.id) weight = edge.edge_weight;
        else if(edge.node1.id == node2.id && edge.node2.id == node1.id && graph_direction == "undirected") weight = edge.edge_weight;
    });

    //console.log("Returning weight of " + weight);

    return weight;
}

//Returns the node in the queue with the current smallest distance from the start node
function minNode(queue, distances){
    let min_distance = INFINITY;
    let min_node = "";

    queue.forEach(node => {
        if(distances.get(node) <= min_distance){
            min_node = node;
            min_distance = distances.get(node);
        }
    });

    return min_node;
}