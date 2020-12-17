import * as go from 'gojs';

export class CustomLink extends go.Link {


  
  constructor() {
    super();
    this.curviness = 0;
    this.zOrder = -100;
  }

  // public computeCurviness() {
  //     if(this.fromNode===null || this.toNode === null){
  //         return 0;
  //     }
  //     var floc = this.fromNode.location;
  //     var tloc = this.toNode.location;
  //     if (Math.abs(tloc.x-floc.x) < 1) return 0;
  //     if(this.fromNode.data.depth == 0){
  //       //for root
        
  //       return (tloc.y-floc.y)/(tloc.x-floc.x) * -50;
  //     } else{
  //       //for others
  //       return (tloc.y-floc.y)/(tloc.x-floc.x) * 10
  //     }
    
  // }

  public computePoints() {
    var result = go.Link.prototype.computePoints.call(this);
    if (result && this.pointsCount === 4) {
      if(this.fromNode !== null && this.fromNode.data.depth == 0){
        var p0 = this.getPoint(0);
        var p3 = this.getPoint(3);
        if(p0.x < p3.x) p0 = p0.offset(-15, 0);
        else p0 = p0.offset(15, 0);

        this.setPoint(1, new go.Point(p0.x, (p0.y+p3.y)/2));
        this.setPoint(2, new go.Point((p0.x+p3.x)/2, p3.y));
      } else{

      }
      
      
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
