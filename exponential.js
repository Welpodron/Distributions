const amount = document.querySelector("#nX");
const bins = document.querySelector("#nBin");
const lambda = document.querySelector("#lambda");

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

function exp_pdf(x, lambda) {
  return lambda <= 0 ? 0 : (-1 / lambda) * Math.log(x);
}

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

var svg2 = d3
  .select("#chart_2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg3 = d3
  .select("#chart_3")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().domain([0, 8]);
var xAxis = d3.axisBottom(x);
var xAxisGroup = svg.append("g");

var y = d3.scaleLinear().range([height, 0]);
var yAxis = svg.append("g");

function update(elements, intervals, lambda) {
  let data1 = Array(parseInt(elements))
    .fill()
    .map((_) => exp_pdf(lcg.nextFloat(), lambda - 1));
  let data2 = Array(parseInt(elements))
    .fill()
    .map((_) => exp_pdf(lcg.nextFloat(), lambda));
  let data3 = Array(parseInt(elements))
    .fill()
    .map((_) => exp_pdf(lcg.nextFloat(), lambda + 1));

  const histogram = d3
    .histogram()
    .value((d) => d)
    .domain(x.domain())
    .thresholds(intervals);

  const bins1 = histogram(data1);
  const bins2 = histogram(data2);
  const bins3 = histogram(data3);

  y.domain([
    0,
    d3.max(bins3, function (d) {
      return d.length;
    }),
  ]);
  yAxis.transition().duration(500).call(d3.axisLeft(y).tickSize(-width));

  x.domain([0, Math.ceil(Math.max.apply(null, data3)) + 2]).range([0, width]);

  xAxisGroup
    .attr("transform", "translate(0," + height + ")")
    .transition()
    .duration(500)
    .call(xAxis);

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

  svg2
    .selectAll("rect")
    .data(bins2)
    .enter()
    .append("rect") // Add a new rect for each new elements
    .merge(svg2.selectAll("rect").data(bins2)) // get the already existing elements as well
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
    .style("fill", "#2ecc71")
    .style("opacity", 0.9);

  svg2.selectAll("rect").data(bins2).exit().remove();

  svg3
    .selectAll("rect")
    .data(bins3)
    .enter()
    .append("rect") // Add a new rect for each new elements
    .merge(svg3.selectAll("rect").data(bins3)) // get the already existing elements as well
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
    .style("fill", "#2980b9")
    .style("opacity", 0.8);

  svg3.selectAll("rect").data(bins3).exit().remove();
}

update(parseInt(amount.value), parseInt(bins.value), parseFloat(lambda.value));

d3.select("#nBin").on("input", function () {
  update(
    parseInt(amount.value),
    parseInt(bins.value),
    parseFloat(lambda.value)
  );
});

d3.select("#nX").on("input", function () {
  update(
    parseInt(amount.value),
    parseInt(bins.value),
    parseFloat(lambda.value)
  );
});

d3.select("#lambda").on("input", function () {
  update(
    parseInt(amount.value),
    parseInt(bins.value),
    parseFloat(lambda.value)
  );
});

const handleClick = (evt) => {
  var visNode = d3.select(`${evt.target.dataset.for}`),
    rects = visNode.selectAll("rect");
  if (!evt.target.checked) {
    rects
      .transition()
      .duration(500)
      .attr("height", function (d) {
        return 0;
      });
  } else {
    rects
      .transition()
      .duration(500)
      .attr("height", function (d) {
        return height - y(d.length);
      });
  }
};

[...document.querySelectorAll(".checkboxes input")].forEach((button) =>
  button.addEventListener("change", handleClick)
);
