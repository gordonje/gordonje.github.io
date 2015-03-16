
var margin2 = {top: 20, right: 20, bottom: 30, left: 20},
    width2 = $(".bar_chart").width() - margin2.left - margin2.right,
    height2 = $(".bar_chart").height() - margin2.top - margin2.bottom;

var x2 = d3.scale.ordinal()
    .rangeRoundBands([0, width2], .1);

var y2 = d3.scale.linear()
    .rangeRound([height2, 0]);

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var xAxis2 = d3.svg.axis()
    .scale(x2)
    // .orient("bottom");

var yAxis2 = d3.svg.axis()
    .scale(y2);
    // .orient("left")
    // .tickFormat(d3.format(".2s"));

var svg2 = d3.select(".bar_chart").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");