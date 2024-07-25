function bfs(start_node, nodes, edges){
    console.log("BFS called at node " + start_node.id);
    //Stores previously visited nodes in traversal order
    let visited = []; 
    //Queue of unvisited nodes
    let queue = [];

    //Mark start node as visited; push to queue
    visited.push(start_node);
    queue.push(start_node);

    //Traverse until queue is empty
    while(queue.length != 0){
        //Dequeue node to visit
        let curr_node = queue[0];
        queue.splice(0, 1);

        let curr_node_neighbors = getNeighbors(curr_node, edges);
        curr_node_neighbors.forEach(neighbor => {
            if(!containsNode(visited, neighbor)){
                visited.push(neighbor);
                queue.push(neighbor);

            }
        }); 

    }

    //console.log(visited);

    formatTraversal(visited, start_node, "Breadth-First Search");

    //return visited;
}


