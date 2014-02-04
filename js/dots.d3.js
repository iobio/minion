function dotsD3(container, heightPct, color) {
   var margin = {top: 5, right: 30, bottom: 40, left: 60},
          width = $(container).width()*0.98 - margin.left - margin.right,
          height = $(container).height()*heightPct - margin.top - margin.bottom;
   // var width = $(container).width() * 0.98;
   // var height = $(container).height() * 0.85;
   var formatCount = d3.format(",.0f");
   
   var duration = 200;
   
   var x = d3.scale.linear()
       .range([0, width]);
   var svg = d3.select(container).append("svg")
      .style("z-index", "1")
      .style("position", "relative")
      .attr("width", '98%')
      .attr("height", parseInt(heightPct*100) + '%')
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
      // .attr('viewBox',"0 0 794 173")
      .attr('viewBox',"0 0 " + parseInt(width+margin.left+margin.right) + " " + parseInt(height+margin.top+margin.bottom))
      .attr("preserveAspectRatio", "none")
      .append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
   

   function my(values, options, klass) {
      //var minMax = d3.extent(values, function(elem) {return parseInt(elem.pos)} );
      // var avgDepth = d3.mean(values, function(elem) { return elem.length } );
      var numBins = 30;
      if (options != undefined) {
         minMax = options.minMax || minMax;
         numBins = options.numBins || numBins;
      }
      //x.domain( minMax );
      x.domain([10108000,10289000])
      if(x.domain()[0] == x.domain()[1])
         x.domain([ x.domain()[0] - 10, x.domain()[1] + 10 ]);
      
      var data = d3.layout.histogram()
          .bins(x.ticks(numBins))
          .value(function(d){return parseInt(d.pos)})
          (values);
          
      var y = d3.scale.linear()
          .domain([0,20])
          //.domain([Math.max(0,d3.min(data, function(d) { return d.y -2; })), d3.max(data, function(d) { return d.y; })])          
          .range([height, 0]);                  
                   
      var xAxis = d3.svg.axis()
         .scale(x)
         .tickFormat(function (d) {
            if ((d / 1000000) >= 1)
              d = d / 1000000 + "M";
            else if ((d / 1000) >= 1)
              d = d / 1000 + "K";
            
            return d;            
         })
         .orient("bottom");
         
      var yAxis = d3.svg.axis()
         .scale(y)
         .tickFormat(function(d) {
            if ( d % 4 == 0)
               return d;
         })
         .orient("left");
      
      // handle new data
      svg.selectAll(".dot:not(." + klass + ") circle").style("stroke", "red");
      var dot = svg.selectAll(".dot." + klass)
          .data(data);              
      
      var dotEnter = dot.enter().append("g")
         .attr("class", "dot " + klass)
         .attr("transform", function(d) { return "translate(" + x(d.x) + ",0)"; });

                
      dotEnter.append("circle")
         .attr("cx", x(x.domain()[0] + data[0].dx)/2)
         .attr("cy", y(0))
         .attr("r", 0)
         .attr("fill", 'white')
         .on("mouseover", function(d) {      
                  div.transition()        
                      .duration(200)      
                      .style("opacity", .9);      
                  var str = "Variants: " + d.length;
                  for (var i=0; i < d.length; i++) {
                     str += "<br/>" + parseInt(i+1) + ") Pos:" + d[i].pos + " Ref:" + d[i].ref + " Alt:" + d[i].alt;
                  }
                  div .html(str)                                 
                      .style("left", (d3.event.pageX) + "px") 
                      .style("text-align", 'left')    
                      .style("top", (d3.event.pageY - 24) + "px");    
                  })                  
              .on("mouseout", function(d) {       
                  div.transition()        
                      .duration(500)      
                      .style("opacity", 0);   
            });
         
      dot.select("circle").transition()
         .duration(duration)
         .attr("cy", function(d,i) { 
            return y(d.y); 
         })
         .attr("r", function(d) { if (d.y == 0) {return 0;} else { return 3; } })
         // .attr("fill", function(d) { if (d.y == 0) {return "white";} else { return color; } })
         .attr("stroke", color)
         .attr("stroke-width", "2px");
               
     // dot.exit().remove(); 
      
      
      if (svg.select(".x.axis").empty()) {
         svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .style("font-size", "10px")
            .style('font-weight', '400')
            .call(xAxis);
            svg.append("text")
               .text("Genomic Location")
               .style("font-size", "10px")
               .style("font-weight", '400')
               .attr('text-anchor', 'middle')
               .attr("transform", 'translate(' + width/2 + ',' + parseInt(height +30) + ')');
            
      } else {
         svg.select(".x.axis").transition()
            .duration(duration)
            .call(xAxis);
      }
      
      if (svg.select(".y.axis").empty()) {
         svg.append("g")
            .attr("class", "y axis")
            .style("font-size", "9px")
            .style("font-weight", '400')
            .call(yAxis);
         svg.append("text")
            .text("Variant Density")
            .style("font-size", "10px")
            .style("font-weight", '400')
            .attr('text-anchor', 'middle')
            .attr("transform", 'translate(-' + 27 + ',' + parseInt(height / 2) + ') rotate(-90)');
      } else {
         svg.select(".y.axis").transition()
            .duration(duration)
            .call(yAxis);
      }
      
      
   }

   my.width = function(value) {
      if (!arguments.length) return width;
      width = value;
      return my;
   };
   return my;
   
   my.height = function(value) {
      if (!arguments.length) return height;
      height = value;
      return my;
   };
   return my;
}

