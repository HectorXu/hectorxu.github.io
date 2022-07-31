var crange = ["red", "blue"];
var svg = d3.select("svg").style("background-color", '#a1c8e7');
var margin = 150
var width = svg.attr("width") - margin
var height = svg.attr("height") - margin;

var x = d3.scaleLinear().domain([1960, 2021]).range([0, width])
var y = d3.scaleLinear().domain([0, 23000]).range([height, 0])
var cs = d3.scaleOrdinal().domain([0, 1]).range(crange);

var g = svg.append("g")
	.attr("transform", "translate(" + 100 + "," + 50 + ")");

// Define the line chart for each country
var linepop = d3.line()
	.x(function (d) { return x(d.Year); })
	.y(function (d) { return y(d.GDP); });

const selectCountry = ["China", "United States"];

// Load GDP growth trend
d3.csv("/data/USChinaData.csv", function (data) {
	data.forEach(function (d) {
			d.Year = +d.Year;
			d.GDP = +d.GDP;
	});

	// pivoting the data for each country
	var dataGroup = d3.nest()
		.key(function (d) {
			return d.Country;
		})
		.entries(data);

	dataGroup.forEach(function (d, i) {
		svg.append("path")
			.attr('stroke', cs(i))
			.attr('stroke-width', 2)
			.attr('fill', 'none')
			.attr('class', 'country-line')
			.attr("transform", "translate(" + 100 + ", 50)")
			.attr("d", linepop(d.values))

		// Add the Legend
		var legend = g.selectAll('g')
			.data(dataGroup)
			.enter()
			.append('g')
			.attr('class', 'legend');

		legend.append('rect')
			.attr('x', 20)
			.attr('y', function (d, i) {
				return i * 20;
			})
			.attr('width', 20)
			.attr('height', 10)
			.style('fill', function (d, i) {
				return cs(i);
			});

		legend.append('text')
			.attr('x', 50)
			.attr('y', function (d, i) {
				return (i * 20) + 10;
			})
			.text(function (d) {
				return d.key;
			});
	});

	// Adding the y-axis 
	g.append("g")
		.attr("transform", "translate(0, 0)")
		.call(d3.axisLeft(y))

	g.append("text")
		.attr("x", 0 - (height / 2))
		.attr("y", -75)
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "middle")
		.text("DGP (Current US $ billion) ");

	// Adding the bottom x-axis 
	g.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))

	g.append("text")
		.attr("x", width / 2)
		.attr("y", height + (height / 10))
		.text("Year");

	// Adding the annotation
	var annotation = g.append('g');

	annotation.append('text')
		.attr('x', 800)
		.attr('y', 0)
		.text("The trend of the DGP growth of United States and China is largely consistent");

	// set the tool tip
	var tooltip = g.append("g")
	var countries = document.getElementsByClassName('country-line');

	var country = tooltip.selectAll('.countryline')
		.data(dataGroup)
		.enter()
		.append("g")
		.attr("class", "countryline");

	country.append("text");

	tooltip.append('svg:rect')
		.attr('fill', 'none')
		.attr('pointer-events', 'all')
		.attr('width', width)
		.attr('height', height)
		.on('mousemove', function () {
			var pointer = d3.mouse(this);
			d3.select(".tooltip-display")
				.attr("d", function () {
					var d = "M" + pointer[0] + "," + height;
					d += " " + pointer[0] + "," + 0;
					return d;
				});

			d3.selectAll(".countryline")
				.attr("transform", function (d, i) {
					var start = 0
					var end = countries[i].getTotalLength()
					var result = null;

					while (true) {
						result = Math.floor((start + end) / 2);
						pos = countries[i].getPointAtLength(result);
						if ((result == end || result == start) && pos.x != pointer[0]) {
							break;
						}
						if (pos.x < pointer[0]) {
							start = result;
						}
						else if (pos.x > pointer[0]) {
							end = result;
						}
						else break;
					}

					// display absolute GDP values
					var parseNumber = d3.format(",");
					d3.select(this).select('text')
						.text("Year: " + parseNumber(x.invert(pos.x).toFixed(0)) +
							" GDP: $" + parseNumber(y.invert(pos.y).toFixed(0)) + " billion");
					return "translate(" + (pos.x - 150) + "," + pos.y + ")";
				});
		});
});	