// TO DO: Figure out what is up with data (probably some double counting in a couple of stages)
// Add move to the front / move to the back code
// fix mouseOver position
// maybe sort the records too?

var margin = {top: 20, right: 20, bottom: 30, left: 100},
    width = $(".chart").width() - margin.left - margin.right,
    height = $(".chart").height() - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, 90])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, 90])
    .range([height, 0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// initial legislative stage to show when the chart is loaded
var currStage = "1st";

var theData = {}

d3.json("js/data2.json", function(error, json) {
  if (error) return console.warn(error);
  theData = json;

  setNav();
  drawChart();
});

// The Bootstrap reference for our button group (markup goes in index.html):
// http://getbootstrap.com/components/#btn-groups

function setNav() {

  $(".btn").on("click", function() {

    var val = $(this).attr("val");
    currStage = val;

    updateChart();
  });

};

function drawChart() {

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Bills sponsored");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      // TO DO: dynamic y-axis label
      .text("Bills achieved stage");

      updateChart();
};

function updateChart() {

  console.log(currStage);

  // nest the legislators in each stage and sum up the bill counts
  var legSums = d3.nest()
    .key( function(d) {return d.legislator_id;} )
    .sortKeys(d3.ascending)
    .rollup(function(d) {
      return {
        spon_total:d3.sum(d, function(g) {return +g.introd_spon_count;}),
        cospon_total:d3.sum(d, function(g) {return +g.introd_cospon_count}),
        stage_spon_total:d3.sum(d, function(g) {return +g.stage_spon_count;}),
        stage_cospon_total:d3.sum(d, function(g) {return +g.stage_cospon_count})
      };
    })
    .map(theData.sessions.filter( function(d) {
      if (d.stage == currStage) {
        return d;
      } 
    }));

  results_leg = [];

  for (legId in legSums) {
    legSums[legId].id = legId;
    legSums[legId].last_abbr_title = theData.legislators[legId].last_abbr_title;
    legSums[legId].name_first = theData.legislators[legId].name_first;
    legSums[legId].name_last = theData.legislators[legId].name_last;
    legSums[legId].last_party = theData.legislators[legId].last_party;
    
    results_leg.push(legSums[legId]);
  };

  console.log(results_leg);

// fix this, can it even go here?
  x.domain(d3.extent(results_leg, function(d) { return d.spon_total; }));
  y.domain(d3.extent(results_leg, function(d) { return d.stage_spon_total; }));

  d3.select(".y.axis").transition().duration(500).call(yAxis); 

  var legislators = svg.selectAll(".dot")
      .data(results_leg, function(d) {
          return d.id;
      });
      
  legislators.enter()
    .append("circle")
      .attr("class", "dot")
      .attr("r", 7)
      .attr("cx", function(d) { return x(d.spon_total); })
      .attr("cy", function(d) { return y(d.stage_spon_total); })
      .on("mouseover", function(d) {
        $(".tt").html(
          "<div>" + d.last_abbr_title + ' ' + d.name_first + ' ' + d.name_last + "</div>" +
          "<div>Has sponsored " + d.spon_total + " bills</div>" +
          "<div>" + d.stage_spon_total + " have been " + theData.stages[currStage].name + "</div>"
          );
        d3.select(this)
          .classed("active", true)
          .attr("stroke-width", 2)
          .attr("stroke", "black")
        $(".tt").show();
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .classed("active", false)
          .attr("stroke-width", 0)
        $(".tt").hide();
      })
      .on("mousemove", function(d) {
        var pos = d3.mouse(this);
        var left = pos[0] + margin.left // + 15 - ($(".tt").outerWidth()/2);
        var top = pos[1] + margin.top // - $(".tt").height() - 30
        $(".tt").css({
          "left" : left+"px",
          "top" : top+"px"
          });
      })

      .transition()
      .duration(200)
      .style("fill", "#000")
      .remove(); // keep?

    // Finally, we want to reassign the position of all elements that alredy exist on the chart
    // AND are represented in the current batch of data.
    // Here we transition (animate) them to new x,y positions on the page.
    legislators.transition()
      .duration(200)
      .attr("cx", function(d) { return x(d.spon_total); })
      .attr("cy", function(d) { return y(d.stage_spon_total); })
      .style("fill", function(d) { 
        switch(d.last_party) {
          case "Republican":
            return "red";
            break;
          case "Democratic":
            return "steelblue"
            break;
          default:
            return "yellow";
            break;
        };
      });

    // TO READ MORE ABOUT EXIT ENTER, READ MIKE BOSTOCK'S THREE LITTLE CIRCLES TUTORIAL:
    // http://bost.ocks.org/mike/circles/

  /* -------------- */
  /* Labels
  /* -------------- */

    // Everything we did above we'll also do with labels.
    // It is literally the exact same pattern.

    // var labels = svg.selectAll(".lbl")
    //     .data(data, function(d) {
    //       return d.current_abbr_title + ' ' + d.name_first + ' ' + d.name_last;
    //     });
      
    // labels.enter()
    //   .append("text")
    //     .attr("class", "lbl")
    //     .attr("x", function(d) { return x(d.spon_total); })
    //     .attr("y", function(d) { return y(d.stage_total); })
    //     .text(function(d) {
    //       return d.current_abbr_title + ' ' + d.name_first + ' ' + d.name_last;;
    //     });

    // labels.exit()
    //   .remove();

    // labels.transition()
    //   .duration(200)
    //   .attr("x", function(d) { return x(d.spon_total); })
    //   .attr("y", function(d) { return y(d.stage_total); })

}





