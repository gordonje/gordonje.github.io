
var margin = {top: 20, right: 20, bottom: 30, left: 100},
    width = $(".chart").width() - margin.left - margin.right,
    height = $(".chart").height() - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
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

d3.json("js/data.json", function(error, data) {

  data.stages.forEach( function(stage) {

    theData[stage.abbrv] = {
        "name": stage.name
      , "position": stage.position
      , "legislators": []
    };

    // console.log(theData[stage.abbrv]);

    // console.log(stage.abbrv);

    data.legislators.forEach( function(legislator) {

      legislator.spon_total = 0;
      legislator.num_sessions = 0;
      legislator.stage_total = 0;

      // for each legislator's legislative session, add up the number of bills sponsored
      legislator.sessions.forEach( function(session) {

        legislator.spon_total += session.num_int_spon;
        legislator.num_sessions += 1;
        
        // and the number of his/her bills at that legislative stage
        switch(stage.abbrv) {
          case "1st":
            legislator.stage_total += session.num_1st_spon;
            break;
          case "2nd":
            legislator.stage_total += session.num_2nd_spon;
            break;
          case "ref":
            legislator.stage_total += session.num_ref_spon;
            break;
          case "3rd":
            legislator.stage_total += session.num_3rd_spon;
            break;
          case "pas":
            legislator.stage_total += session.num_pas_spon;
            break;
          case "sig":
            legislator.stage_total += session.num_sig_spon;
            break;
        }
      });
      // console.log(legislator);
      theData[stage.abbrv].legislators.push(legislator);
    });  
  });

  //Here we define the domains of the X and Y scales...
  //... as everything between the lowest and highest values of sponsored and passed.
  x.domain(d3.extent(data.legislators, function(d) { return d.spon_total; }));
  y.domain(d3.extent(data.legislators, function(d) { return d.stage_total; }));

  // TO DO: append this to the the date element
  // console.log(data.last_updated);

  // console.log(theData);

  //Once our data is set, we're safe to call our functions.
  setNav();
  drawChart();  

});

// setNav is where we assign our button events.
// When any element with the class "btn" is clicked,
// We ask what it's "val" property is.
// Since "val" is defined as a corresponding year in our index.html file,
// We can directly assign that to be the new value of currYear.
// Then, we update our chart.

// The Bootstrap reference for our button group (markup goes in index.html):
// http://getbootstrap.com/components/#btn-groups

function setNav() {

  $(".btn").on("click", function() {
    var val = $(this).attr("val");
    currStage = val;

    updateChart();
  });

};

// We separated our chart into two fucntions: drawChart() and updateChart()
// drawChart will only be called once — when the page is loaded.
// This is where we draw our x and y axis.
// And since we're not clicking any buttons when the page loads,
// We'll directly call updateChart(), which is where the circles get drawn on the chart.
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

// At last, this is where our data gets drawn on the chart.

function updateChart() {

  var data = theData[currStage].legislators;

  // console.log(currStage);

  // console.log(data);

    // Select all elements classed ".dot"
    // Assign the data as the value of "data" and match each element to d.Tm.
  var legislators = svg.selectAll(".dot")
      .data(data, function(d) {
          return d.id;
      });
      
    // If d.Tm does match any elements classed ".dot",
    // We create a new one. In other words, it "enters" the chart.
    // The first time our page loads, no circles with the class name "dot" exist
    // So we append a new one and give it an cx, cy position based on wins and attendance.
    // If the circle already exists for that team, we do nothing here.
  legislators.enter()
    .append("circle")
      .attr("class", "dot")
      .attr("r", 7)
      .attr("cx", function(d) { return x(d.spon_total); })
      .attr("cy", function(d) { return y(d.stage_total); })
      .on("mouseover", function(d) {
        $(".tt").html(
          "<div>" + d.current_abbr_title + ' ' + d.name_first + ' ' + d.name_last + "</div>" +
          "<div>Has sponsored " + d.spon_total + " bills</div>" +
          "<div>" + d.stage_total + " have been " + theData[currStage].name + "</div>"
          );
        d3.select(this)
          .classed("active", true)
          .attr("r", 20);
        $(".tt").show();
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .classed("active", false)
          .attr("r", 7);
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
      });

    // By the same token, if an "circle" element with the class name "dot" is already on the page
    // But the d.Tm property doesn't match anything in the new data,
    // It "exits".
    // Exit doesn't actually remove it though.
    // Exit is just what we use to select the elements that aren't represented in our data.
    // If we'd like to remove it, we use .remove().
    // I've left the transition to black in place so you can see it in action.
    legislators.exit()
      .transition()
      .duration(200)
      .style("fill", "#000");
      //.remove();

    // Finally, we want to reassign the position of all elements that alredy exist on the chart
    // AND are represented in the current batch of data.
    // Here we transition (animate) them to new x,y positions on the page.
    legislators.transition()
      .duration(200)
      .attr("cx", function(d) { return x(d.spon_total); })
      .attr("cy", function(d) { return y(d.stage_total); })
      .style("fill", function(d) { 
        switch(d.current_party) {
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





