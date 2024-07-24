function dfs(start_node, nodes, edges){
    console.log("DFS called at node " + start_node.id);
    //Stores previously visited nodes in traversal order
    let visited = []; 
    //Stack of unvisited nodes
    let stack = [];
    //Track traversal order
    let order = [];

    //Mark start node as visited; push to queue
    visited.push(start_node);
    stack.push(start_node);

    //Traverse until stack is empty
    while(stack.length != 0){
        //Pop node to visit off stack
        let curr_node = stack.pop();
        order.push(curr_node);

        let curr_node_neighbors = getNeighbors(curr_node, edges);
        curr_node_neighbors.forEach(neighbor => {
            if(!containsNode(visited, neighbor)){
                visited.push(neighbor);
                stack.push(neighbor);

            }
        }); 

    }

    console.log(order);

    return order;
}

