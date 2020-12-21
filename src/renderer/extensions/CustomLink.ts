import * as go from 'gojs';

export class CustomLink extends go.Link {


  
  constructor() {
    super();
    this.curviness = 0;
    this.zOrder = -100;
  }

  public computePoints() {
    if(this.fromNode !== null && this.fromNode.data.depth == 0){
      this.curve = go.Link.Bezier;
      this.routing = go.Link.Normal;
      this.corner = 0;
    } else{
      this.curve = go.Link.None;
      this.routing = go.Link.Orthogonal;
      this.corner = 2;
    }

    var result = go.Link.prototype.computePoints.call(this);
    console.log(this.pointsCount);
    if (result && this.pointsCount === 4) {
      if(this.fromNode !== null && this.fromNode.data.depth == 0){
        var p0 = this.getPoint(0);
        var p3 = this.getPoint(3);
        if(p0.x < p3.x) p0 = p0.offset(-15, 0);
        else p0 = p0.offset(15, 0);

        this.setPoint(1, new go.Point(p0.x, (p0.y+p3.y)/2));
        this.setPoint(2, new go.Point((p0.x+p3.x)/2, p3.y));
      }  
    } else if (result && this.pointsCount === 6){
        var p0 = this.getPoint(0);
        var p5 = this.getPoint(5);
        this.setPoint(1, new go.Point((p0.x+p5.x)/2, p0.y));
        this.setPoint(2, new go.Point((p0.x+p5.x)/2, p0.y));
        this.setPoint(3, new go.Point((p0.x+p5.x)/2, p0.y));
        this.setPoint(4, new go.Point((p0.x+p5.x)/2, p5.y));
    }
    return result;
  }

  public getLinkPoint(node: go.Node, port: any, spot: any, from: any, ortho: any, othernode: any, otherport: any, result: any) {
    if (!from || node.data.depth > 0) {
      //For depths 1 ang further  
      var ox = othernode.location.x;
      var tx = node.location.x;
      return port.getDocumentPoint((ox < tx) ? go.Spot.Left : go.Spot.Right, result);
    }
      
    //For root
    // otherwise, normal behavior
    return go.Link.prototype.getLinkPoint.call(this, node, port, spot, from, ortho, othernode, otherport, result);
  }

}
