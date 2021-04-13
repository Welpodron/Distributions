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

function Gauss() {
  var ready = false;
  var second = 0.0;

  this.next = function (mean, dev) {
    mean = mean == undefined ? 0.0 : mean;
    dev = dev == undefined ? 1.0 : dev;

    if (this.ready) {
      this.ready = false;
      return this.second * dev + mean;
    } else {
      var u, v, s;
      do {
        u = 2.0 * Math.random() - 1.0;
        v = 2.0 * Math.random() - 1.0;
        s = u * u + v * v;
      } while (s > 1.0 || s == 0.0);

      var r = Math.sqrt((-2.0 * Math.log(s)) / s);
      this.second = r * u;
      this.ready = true;
      return r * v * dev + mean;
    }
  };
}

g = new Gauss();

// set the dimensions and margins of the graph
var margin = { top: 25, right: 25, bottom: 25, left: 25 },
  width = 700 - margin.left - margin.right,
  height = 350 - margin.top - margin.bottom;

var svg = d3
  .select("#chart_1")
  .append("svg")
  .attr("viewBox", `0 0 700 350`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3
  .select("#chart_2")
  .append("svg")
  .attr("viewBox", `0 0 700 350`)
  .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// X axis: scale and draw:
var x = d3
  .scaleLinear()
  .domain([-5, 5]) // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
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
    .map(
      (_) =>
        Array(12)
          .fill()
          .map((_) => Math.random())
          .reduce((acc, prevValue) => acc + prevValue) - 6
    );
  let data2 = Array(parseInt(elements))
    .fill()
    .map((_) => g.next());

  const histogram = d3
    .histogram()
    .value((d) => d)
    .domain(x.domain())
    .thresholds(intervals);

  const bins1 = histogram(data1);
  const bins2 = histogram(data2);

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
}

update(parseInt(amount.value), parseInt(bins.value));

d3.select("#nBin").on("input", function () {
  document.querySelector("#red").checked = true;
  document.querySelector("#green").checked = true;
  update(parseInt(amount.value), parseInt(bins.value));
});

d3.select("#nX").on("input", function () {
  document.querySelector("#red").checked = true;
  document.querySelector("#green").checked = true;
  update(parseInt(amount.value), parseInt(bins.value));
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
