
var sessionYear = 2013;

var margin = {top: 20, right: 15, bottom: 60, left: 60}
  , width = 960 - margin.left - margin.right
  , height = 500 - margin.top - margin.bottom;

var xValue = function(d) { return d.spon_num;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d.spon_signed_num;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// // setup fill color
// var cValue = function(d) { return d.Manufacturer;},
//     color = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("data/leg_performance.csv", function(d) {
    if (+d.term_start_year === sessionYear) {
      return {
            legislator_id: d.legislator_id
          , name_first: d.name_first
          , name_middle: d.name_middle
          , name_last: d.name_last
          , name_suffix: d.name_suffix
          , nickname: d.nickname
          , chamber_name: d.chamber_name
          , title: d.title
          , abbr_title: d.abbr_title
          , district: +d.district
          , party: d.party
          , photo_url: d.photo_url
          , term_start_year: +d.term_start_year
          , term_end_year: +d.term_end_year
          , term_id: +d.term_id
          , spon_num: +d.spon_num
          , cospon_num: +d.cospon_num
          , spon_signed_num: +d.spon_signed_num
          , cospon_signed_num: +d.cospon_signed_num
        };
      }
  }, function(error, data){

    console.log(data);

    xScale.domain([0, d3.max(data, xValue)]);
    yScale.domain([0, d3.max(data, yValue)]);

    // x-axis
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

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Bills signed into law");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 8)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) {
            if (d.party === "Republican") {
              return 'red'; 
            } else if (d.party === "Democratic") {
              return 'bluesteel';
              } else {
                return 'gray';
              }
            })
      // .append("pattern")
      //   .attr('id', function(d) {
      //         return d.legislator_id + "_pic"; 
      //       })
      //   .attr("width", 16)
      //   .attr("height", 16)
      //   .attr("patternUnits", "userSpaceOnUse")
      //   .append("svg:image")
      //   .attr("xlink:href", function(d) {
      //         return "imgs/" + d.name_last + "_" + d.name_first + "_" + d.legislator_id + ".jpg"; 
      //       })
      //   .attr("width", 16)
      //   .attr("height", 16)
      //   .attr("x", xMap)
      //   .attr("y", yMap)
        // .append("image")
        //   .attr("href", function(d) {
        //       return "imgs/" + d.name_last + "_" + d.name_first + "_" + d.legislator_id + ".jpg"; 
        //     })
        //   .attr("width", 50)
        //   .attr("height", 50)
        //   .attr("transform", "translate(-50,-50)")
        // .style("fill", function(d) { return color(cValue(d));}) 
        .on("mouseover", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
            tooltip.html(d["abbr_title"] + ' ' + d["name_first"] + ' ' + d["name_last"] + "<br/>" +  
            "Has sponsored: " + d["spon_num"] + "<br/>" +  
            "Became laws: " + d["spon_signed_num"])
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        });

});




















// var x = d3.scale.linear()
//     // .domain([0, d3.max(data, function(d) { return d[0]; })])
//     .range([ 0, width ]);
  
// var y = d3.scale.linear()
//     // .domain([0, d3.max(data, function(d) { return d[1]; })])
//     .range([ height, 0 ]);

// // draw the x axis
// var xAxis = d3.svg.axis()
//     .scale(x)
//     .orient('bottom');

// // draw the y axis
// var yAxis = d3.svg.axis()
//     .scale(y)
//     .orient('left');

// var chart = d3.select('.chart')
//     .append('svg:svg')
//     .attr('width', width + margin.right + margin.left)
//     .attr('height', height + margin.top + margin.bottom)
//     .attr('class', 'chart')

// var main = chart.append('g')
//     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
//     .attr('width', width)
//     .attr('height', height)
//     .attr('class', 'main')   
      




// main.append('g')
//     .attr('transform', 'translate(0,' + height + ')')
//     .attr('class', 'main axis')
//     .call(xAxis);



// main.append('g')
//     .attr('transform', 'translate(0,0)')
//     .attr('class', 'main axis')
//     .call(yAxis);



// // // converting csv file to json, first argument is the .csv file, second argument is the "accessor" function
// // d3.csv("./data/leg_performance.csv", function(d) { 
  
// //   // specifying the data types and format the accessor should return
// //     return {  
// //         legislator_id: d.legislator_id
// //       , name_first: d.name_first
// //       , name_middle: d.name_middle
// //       , name_last: d.name_last
// //       , name_suffix: d.name_suffix
// //       , nickname: d.nickname
// //       , chamber_name: d.chamber_name
// //       , title: d.title
// //       , abbr_title: d.abbr_title
// //       , district: +d.district
// //       , party: d.party
// //       , photo_url: d.photo_url
// //       , term_start_year: +d.term_start_year
// //       , term_end_year: +d.term_end_year
// //       , term_id: +d.term_id
// //       , spon_num: +d.spon_num
// //       , cospon_num: +d.cospon_num
// //       , spon_signed_num: +d.spon_signed_num
// //       , cospon_signed_num: +d.cospon_signed_num
// //     };
// // // the third argument is the callback function (do I have that right?)
// // }, function(error, rows) {
// //   x.domain(d3.extent(rows, function(d) { return d.d.spon_num; }));
// //   y.domain(d3.extent(rows, function(d) { return d.spon_signed_num; }));

// //   svg.append("g")
// //     .attr("class", "x axis")
// //     .attr("transform", "translate(0," + height + ")")
// //     .call(xAxis)
// //         .selectAll("text")  
// //             .style("text-anchor", "end")
// //             .attr("dx", "-.8em")
// //             .attr("dy", ".15em")

// // var chart = d3.select('.chart')
// //     .append('svg:svg')
// //     .attr('width', width + margin.right + margin.left)
// //     .attr('height', height + margin.top + margin.bottom)
// //     .attr('class', 'chart')

// // var main = chart.append('g')
// //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
// //     .attr('width', width)
// //     .attr('height', height)
// //     .attr('class', 'main')   
      
// //   // draw the x axis
// // var xAxis = d3.svg.axis()
// //     .scale(x)
// //     .orient('bottom');

// // main.append('g')
// //     .attr('transform', 'translate(0,' + height + ')')
// //     .attr('class', 'main axis date')
// //     .call(xAxis);

// //   // draw the y axis
// // var yAxis = d3.svg.axis()
// //     .scale(y)
// //     .orient('left');

// // main.append('g')
// //     .attr('transform', 'translate(0,0)')
// //     .attr('class', 'main axis date')
// //     .call(yAxis);

// // var g = main.append("svg:g"); 
  
// //   g.selectAll("scatter-dots")
// //     .data(data)
// //     .enter().append("svg:circle")
// //         .attr("cx", function (d,i) { return x(d[0]); } )
// //         .attr("cy", function (d) { return y(d[1]); } )
// //         .attr("r", 8);