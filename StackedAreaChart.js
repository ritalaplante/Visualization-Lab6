// input: selector for a chart container e.g., ".chart"
export function StackedAreaChart(container){

	// initialization

    // Define margin conventions
    const margin = {top:50, left:50, right:50, bottom:50};
    const width = 850 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Create scales without domains
    const xScale = d3.scaleTime()
		.range([0, width])

	const yScale = d3.scaleLinear()
		.rangeRound([height, 0])

    const colorScale = d3.scaleOrdinal()
        .range(d3.schemeTableau10)

    // Create axes
    const xAxis = d3.axisBottom()
        .scale(xScale)

    const yAxis = d3.axisLeft()
        .scale(yScale)

    const xAxisChart = svg.append("g")
        .attr("class", "axis x-axis")
    
    const yAxisChart = svg.append("g")
        .attr("class", "axis y-axis")

    // Creat tooltip
    const tooltip = svg
        .append("text")
        .attr('x', 0)
        .attr('y', -10)
        .attr('font-size', 10);

    var clip = svg.append("clipPath")
        .attr("id", "chart-area")
        .append("rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    let selected = null, xDomain, data;

	function update(_data){ 
        
        // Save data from update(_data)
        data = _data
		
        // update scales, encodings, axes (use the total count)

        // Extract category names keys use slice(1) to exclude date
        var keys = selected ? [selected] : data.columns.slice(1)

        // Compute stack from the data
        var stack = d3.stack()
			.keys(keys)
			.order(d3.stackOrderNone)
			.offset(d3.stackOffsetNone)

        var series = stack(data);

        // Update keys for color scales 
        colorScale.domain(keys)
		xScale.domain(xDomain ? xDomain : d3.extent(data, d => d.date))
		yScale.domain([0, d3.max(series, a => d3.max(a, d => d[1]))])

        // Create an area generator
        const area = d3.area()
			.x(d => xScale(d.data.date))
			.y0(d => yScale(d[0]))
			.y1(d => yScale(d[1]))

        // Create areas based on the stack
        const areas = svg.selectAll(".area")
	        .data(series, d => d.key);

        areas.enter() // or you could use join()
	        .append("path")
            .attr('clip-path', 'url(#chart-area)')
			.attr('class', 'area')
			.attr('id', d => 'myArea ' + d.key)
			.attr('fill', d => colorScale(d.key))
			.on("mouseover", (event, d, i) => tooltip.text(d.key))
            .on("mouseout", (event, d, i) => tooltip.text(''))
			.on("click", (event, d) => {
                // toggle selected based on d.key
                if (selected === d.key) {
              selected = null;
            } else {
                selected = d.key;
            }
            update(data); // simply update the chart again
            })
	        .merge(areas)
	        .attr("d", area)

        areas.exit().remove();

        // Update axes
        xAxisChart
            .call(xAxis)
            .attr("transform", `translate(0, ${height})`)

        yAxisChart
            .call(yAxis)
		
	}

	function filterByDate(range){
		xDomain = range;  // -- (3)
		update(data); // -- (4)
	}

	return {
		update,
		filterByDate
	}
}