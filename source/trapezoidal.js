const amount = document.querySelector("#nX");
const bins = document.querySelector("#nBin");

var lcg = {
  seed: Date.now(),
  a: 1664525,
  c: 1013904223,
  m: Math.pow(2, 32),

  nextInt: function () {
    this.seed = (this.seed * this.a + this.c) % this.m;
    return this.seed;
  },

  nextFloat: function () {
    return this.nextInt() / this.m;
  },
};

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 1160 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

var svg = d3
  .select("#chart_1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3
  .scaleLinear()
  .domain([-0.1, 1.3]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
  .range([0, width]);
svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).tickSize(-height));

var y = d3.scaleLinear().range([height, 0]);
var yAxis = svg.append("g");

function update(elements, intervals) {
  let data1 = Array(parseInt(elements))
    .fill()
    .map((_) => lcg.nextFloat() / 5 + lcg.nextFloat());

  const histogram = d3
    .histogram()
    .value((d) => d)
    .domain(x.domain())
    .thresholds(intervals);

  const bins1 = histogram(data1);

  y.domain([
    0,
    d3.max(bins1, function (d) {
      return d.length;
    }),
  ]);
  yAxis.transition().duration(500).call(d3.axisLeft(y).tickSize(-width));

  // Manage the existing bars and eventually the new ones:
  svg
    .selectAll("rect")
    .data(bins1)
    .enter()
    .append("rect") // Add a new rect for each new elements
    .merge(svg.selectAll("rect").data(bins1)) // get the already existing elements as well
    .transition() // and apply changes to all of them
    .duration(500)
    .attr("x", 1)
    .attr("transform", function (d) {
      return "translate(" + x(d.x0) + "," + y(d.length) + ")";
    })
    .attr("width", function (d) {
      return x(d.x1) - x(d.x0);
    })
    .attr("height", function (d) {
      return height - y(d.length);
    })
    .style("fill", "#e74c3c")
    .style("opacity", 1);

  svg.selectAll("rect").data(bins1).exit().remove();
}

update(parseInt(amount.value), parseInt(bins.value));

d3.select("#nBin").on("input", function () {
  update(parseInt(amount.value), parseInt(bins.value));
});

d3.select("#nX").on("input", function () {
  update(parseInt(amount.value), parseInt(bins.value));
});
