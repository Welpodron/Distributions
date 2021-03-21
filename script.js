const data = Array(100000)
  .fill()
  .map((_) => Math.random());

const newArray = [];

for (let i = 0; i < 100000; i++) {
  let r1 = Math.random() / 2;
  let r2 = Math.random() / 2;

  newArray.push(r1 + r2);
}

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

const someArray = [];

g = new Gauss();

for (let i = 0; i < 10000; i++) {
  someArray.push(g.next());
}

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 40 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var bins = d3.bin()(someArray);

console.log(bins);

//
var x = d3
  .scaleLinear()
  .domain([bins[0].x0, bins[bins.length - 1].x1])
  .range([0, width]); // range отвечает за отрисовку
svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));
//
var y = d3
  .scaleLinear()
  .domain([0, d3.max(bins, (d) => d.length)])
  .nice()
  .range([height, 0]);
svg.append("g").call(d3.axisLeft(y));
//

// append the bar rectangles to the svg element
svg
  .selectAll("rect")
  .data(bins)
  .enter()
  .append("rect")
  .attr("x", 1)
  .attr("transform", function (d) {
    return "translate(" + x(d.x0) + "," + y(d.length) + ")";
  })
  .attr("width", function (d) {
    return x(d.x1) - x(d.x0) - 1;
  })
  .attr("height", function (d) {
    return height - y(d.length);
  })
  .style("fill", "#69b3a2");
