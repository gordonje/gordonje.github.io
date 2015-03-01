
var margin = {top: 20, right: 15, bottom: 60, left: 60}
  , width = 960 - margin.left - margin.right
  , height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d[0]; })])
    .range([ 0, width ]);
  
var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d[1]; })])
    .range([ height, 0 ]);


// converting csv file to json, first argument is the .csv file, second argument is the "accessor" function
d3.csv("./data/leg_performance.csv", function(d) { 
  
  // specifying the data types and format the accessor should return
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
// the third argument is the callback function (do I have that right?)
}, function(error, rows) {
  x.domain(d3.extent(rows, function(d) { return d.d.spon_num; }));
  y.domain(d3.extent(rows, function(d) { return d.spon_signed_num; }));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")

var chart = d3.select('.chart')
    .append('svg:svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'chart')

var main = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main')   
      
  // draw the x axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis);

  // draw the y axis
var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis);

var g = main.append("svg:g"); 
  
  g.selectAll("scatter-dots")
    .data(data)
    .enter().append("svg:circle")
        .attr("cx", function (d,i) { return x(d[0]); } )
        .attr("cy", function (d) { return y(d[1]); } )
        .attr("r", 8);
