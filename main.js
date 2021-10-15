import {AreaChart} from './AreaChart.js';
import {StackedAreaChart} from './StackedAreaChart.js';

d3.csv("unemployment.csv", d3.autoType).then(data => {

	// process data and create charts
    var columns = data.columns.slice(1,-1);

    data.forEach(
        d=>{let sum = 0 
        columns.forEach(col=>sum = sum+ d[col]) 
        d.total = sum;}
    );

    var areaChart = AreaChart('.area-chart')
	areaChart.update(data)
	areaChart.on('brushed', function(range) {
		stackedChart.filterByDate(range)
	})

	var stackedChart = StackedAreaChart('.stacked-chart')
	stackedChart.update(data)

});