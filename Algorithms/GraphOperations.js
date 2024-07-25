//Returns the name of the node; if it has no name return its id. Used for output purposes.
function getNodeName(node){
    let label;
    if(node.name == "") label = "" + node.id;
    else label = node.name;
    return label;
}

//Returns an array of all neighbors of a specified node
function getNeighbors(start_node, edges){
    let neighbors = [];

    edges.forEach(edge => {
        //console.log("Checking if node " + start_node.id + " exists on edge from node " + edge.node1.id + " to " + edge.node2.id);
        if(start_node.id == edge.node1.id){
            if(!containsNode(neighbors, edge.node2)){
                neighbors.push(edge.node2);
            }
        } else if(start_node.id == edge.node2.id){
            if(!containsNode(neighbors, edge.node1)){
                neighbors.push(edge.node1);
            }
        }
    });

    return neighbors;
}

//Checks if an array of nodes contains a specified node
function containsNode(arr, ele){
    let found = false;
    arr.forEach(node => {
        //console.log("Comparing node " + ele.id + " with "+ node.id) 
        if(node.id == ele.id) found = true;
    });

    return found;
}

//Formats and prints the output of any algorithm that returns a graph traversal
function formatTraversal(output_nodes, start_node, algo_name){
    let output_box = document.getElementById("output_box");

    let formatted_text = "Order of traversal while running " + algo_name + " on node " + getNodeName(start_node) + ":<br>";
    for(i = 0; i < output_nodes.length; i++){
        formatted_text += getNodeName(output_nodes[i]);
        if(i != output_nodes.length - 1) formatted_text += " => ";
    }

    output_box.innerHTML = formatted_text;

}