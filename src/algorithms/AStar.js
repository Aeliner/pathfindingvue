let AStar = {

AStarFind(grid, start, end)
{
    let openList = [], closedList = [];

    openList.push(start);

    while(openList.length > 0)
    {
        let lowInd = 0;
        for(let i = 0; i < openList.length; i++)
        {
            if(openList[i].f < openList[lowInd].f)
            lowInd = i;
        }

        let currentNode = openList[lowInd];
        if(currentNode.pos == end.pos )
        {
            let current = currentNode, returnArr = [];
            while(current.parent)
            {
                returnArr.push(current);
                current = current.parent;
            }
            return returnArr.reverse();
        }
        let index = openList.findIndex(item => item.pos == currentNode.pos);
        openList.splice(index, 1);
        closedList.push(currentNode);
        console.log("currrent y neighbors");
        console.log(currentNode);
        let neighborsArr = this.findNeighbors(grid, currentNode);
        
        
        console.log(neighborsArr);
        for(let i = 0; i < neighborsArr.length; i++)
        {
            let neighbor = neighborsArr[i];
            if(closedList.find(obj => obj.pos == neighbor.pos) || neighbor.isWall)
            {
                continue;
            }
            let gScore = currentNode.g +1;
            let gScorreIsBest = false;
            if(!openList.find(obj => obj.pos == neighbor.pos))
            {
                gScorreIsBest = true;
                neighbor.h = this.heuristic(neighbor.pos, end.pos);
                openList.push(neighbor);
            }
            else if(gScore < neighbor.g)
            gScorreIsBest = true;
            if(gScorreIsBest)
            {
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }
    return [];
},

findNeighbors(grid, node)
{
    let returnArray = [], x = node.pos.x, y = node.pos.y;
    if(grid[x-1] && grid[x-1][y])
    {
        returnArray.push(grid[x-1][y]);
    }

    if(grid[x+1] && grid[x+1][y])
    {
        returnArray.push(grid[x+1][y]);
    }

    if(grid[x][y-1] && grid[x][y-1])
    {
        returnArray.push(grid[x][y-1]);
    }

    if(grid[x][y+1] && grid[x][y+1])
    {
        returnArray.push(grid[x][y+1]);
    }
    return returnArray;
},

heuristic(pos1, pos2)
{
    let d1 = Math.abs(pos2.x - pos1.x);
    let d2 = Math.abs(pos2.y - pos1.y);
    return d1 + d2;
}

};

export default AStar;