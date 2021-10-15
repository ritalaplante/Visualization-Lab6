// input: selector for a chart container e.g., ".chart"
export function AreaChart(container){

	// Initialization

    // Initialize the event listener
    const listeners = { brushed: null }

    // Define margin conventions
    const margin = {top:50, left:50, right:50, bottom:50};
    const width = 850 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Create an SVG element
    const svg = d3.selectAll(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // Create path for area and assign it a class name
    svg.append("path")
        .attr("class", "area")

    // Create scales without domains
    const xScale = d3.scaleTime()
		.range([0, width])

	const yScale = d3.scaleLinear()
		.rangeRound([height, 0])

    // Create axes
    const xAxis = d3.axisBottom()
        .scale(xScale)

    const yAxis = d3.axisLeft()
        .scale(yScale)

    const xAxisChart = svg.append("g")
        .attr("class", "axis x-axis")
    
    const yAxisChart = svg.append("g")
        .attr("class", "axis y-axis")

    // Create brush
    const brush = d3
        .brushX()
        .extent([[0, 0], [width, height]])
        // set the brush extent and callbacks for "brush" and "end" events
		.on('brush', brushed)
		.on('end', brushed)  

    // Add brush by calling it on SVG group
    svg.append("g").attr('class', 'brush').call(brush)

    // Define event callbacks
    function brushed(event) {
        if (event.selection) {
            listeners["brushed"](event.selection.map(xScale.invert));
        }
    };

	function update(data){ 

		// update scales, encodings, axes (use the total count)

        // Update the domains of scales using data passed to update
        xScale.domain([d3.min(data, d=>d.date), d3.max(data,d=>d.date)])
        yScale.domain([0, d3.max(data, d=>d.total)])

        // Create area generator
        var area = d3.area()
			.x(d => xScale(d.date))
			.y0(yScale(0))
			.y1(d => yScale(d.total))
        
        // Select the area and set data using datum, call the area function
        d3.select(".area")
            .datum(data)
            .attr("d",area)
            .attr("fill", "#4E79A7")

        // Update axes using update scales
        xAxisChart
            .call(xAxis)
            .attr("transform", `translate(0, ${height})`);

        yAxisChart
            .call(yAxis)
		
	}

	function on(event, listener) {
		listeners[event] = listener;
    }

	return {
		update,
		on
	}
}