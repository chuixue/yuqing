
	var Dates=[];
	var Sum=0;
	var source={};
	
	function LoadDYN(data){
		Dates=[];
		var DT=initData(data);
		var Spread=getData(DT);
		var Times=getTimes();
		var T=[];
		
		var maxX=d3.max(Spread,function(d){ return d3.max(d.sum); });
		var maxY=d3.max(Spread,function(d){ return d3.max(d.now); });
		var tp=Spread.map(function(d){return d.now;});
		
		var fi=getFineIndex(Spread,Times);
		Times.forEach(function(d,i){ T.push(i); });	
		source={time:Times, data:Spread, sum:Sum, maxY:maxY * 1.1, maxX:maxX * 1.1, tIndex:T, fineIndex:fi };
	}
	//获取好的展示效果起始点
	function getFineIndex(data,time){
		var count=data.length;
		for(var i=0;i<time.length;i++){
			var ct=0;
			data.forEach(function(d,j){
				if(d.sum[i]<1)ct++;
			});
			if(ct<(count/2))return i;
		}
		return index;
	}
	function LoadImage(data,id){
		LoadDYN(data);
		d3.select("#"+id).html("");
		
		var div=d3.select("#"+id),w=parseInt(div.style("width")),
			h=parseInt(div.style("height"));
		var margin = {top: 29.5, right: 29.5, bottom: 29.5, left: 49.5},
			width = w - margin.right,
			height = h - margin.top - margin.bottom;
		// Various scales. These domains make assumptions of data, naturally.
		var xScale = d3.scale.linear().domain([0, source.maxX]).range([0, width]),
			yScale = d3.scale.linear().domain([-10, source.maxY]).range([height, 0]),
			radiusScale = d3.scale.sqrt().domain([0, 100]).range([0, 40]),
			colorScale = d3.scale.category10();

		// The x & y axes.
		var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10, d3.format(",d")),
			yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(9);
		
		// Create the SVG container and set the origin.
		var svg = d3.select("#"+id).append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		  .append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
		// Add the x-axis.
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
		
		// Add the y-axis.
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);
		
		// Add an x-axis label.
		svg.append("text")
			.attr("class", "x label")
			.attr("text-anchor", "end")
			.attr("x", width)
			.attr("y", height - 6)
			.text("截止此时刻 传播总量(历史量之和)");
		
		// Add a y-axis label.
		svg.append("text")
			.attr("class", "y label")
			.attr("text-anchor", "end")
			.attr("y", 6)
			.attr("dy", ".75em")
			.attr("transform", "rotate(-90)")
			.text("当此时刻 事件传播量");
	
		// Add the year label; the value is set on transition.
		var label = svg.append("text")
			.attr("class", "year label")
			.attr("text-anchor", "end")
			.attr("y", height - 24)
			.attr("x", width)
			.text(source.time[source.fineIndex]);
	
		// Add a dot per nation. Initialize the data at 1800, and set the colors.
		var dot = svg.append("g")
			.attr("class", "dots")
		  .selectAll(".dot")
			.data(interpolateData(source.fineIndex))
		  .enter().append("circle")
			.attr("class", "dot")
			.style("fill", function(d) { return colorScale(color(d)); })
			.call(position)
			.sort(order);
		
		// Add a title.
		dot.append("title")
		  .text(function(d) { return d.name; });
		  
		// Positions the dots based on data.	
		function position(dot) {
			dot.attr("cx", function(d) { return xScale(x(d)); })
				.attr("cy", function(d) { return yScale(y(d)); })
				.attr("r", function(d) { return radiusScale(radius(d)); });
		}	
	
  		// Add an overlay for the year label.
		var box = label.node().getBBox();

		var overlay = svg.append("rect")
			.attr("class", "overlay")
			.attr("x", box.x)
			.attr("y", box.y)
			.attr("width", box.width)
			.attr("height", box.height)
			.on("mouseover", enableInteraction);

		// Start a transition that interpolates the data based on time.
		svg.transition()
			.duration(20000)
		  	.ease("linear")
		  	.tween("time", tweenTime)
		  	.each("end", enableInteraction);
		
		function tweenTime() {
    		var time = d3.interpolateNumber(source.fineIndex, source.time.length-1);
		    return function(t) { displayTime(Math.round(time(t))); };
		}
		
	    // Updates the display to show the specified time.
		function displayTime(time) {
			dot.data(interpolateData(time), key).call(position).sort(order);
			var tm=source.time[Math.round(time)];
			if(tm)label.text(tm);
		}

		 // After the transition finishes, you can mouseover to change the year.
	  	function enableInteraction() {
			var timeScale = d3.scale.linear()
				.domain([source.fineIndex, source.time.length])
				.range([box.x + 10, box.x + box.width - 10])
				.clamp(true);

		    // Cancel the current transition, if any.
		    svg.transition().duration(0);

			overlay
				.on("mouseover", mouseover)
				.on("mouseout", mouseout)
				.on("mousemove", mousemove)
				.on("touchmove", mousemove);
			function mouseover() { label.classed("active", true); }
			function mouseout() { label.classed("active", false); }
			function mousemove() { displayTime(timeScale.invert(d3.mouse(this)[0])); }
		}
	}

	function x(d) { return d.total; }
	function y(d) { return d.current; }
	function radius(d) { return d.ratio; }
	function color(d) { return d.cls; }
	function key(d) { return d.name; }	

	// A bisector since many nation's data is sparsely-defined.
  	var bisect = d3.bisector(function(d) { return d; });	
	
	// Defines a sort order so that the smallest dots are drawn on top.
	function order(a, b) {
		return radius(b) - radius(a);
	}	
	// Interpolates the dataset for the given (fractional) year.
	function interpolateData(time) {
		return source.data.map(function(d) {
			return {
				name: d.name,
				cls: d.cls,
				ratio: parseInt(d.count * 100),
				current: interpolateValues(d.now,time,1),
				total: interpolateValues(d.sum,time,0)
		  };
		});
	}	
	
	// Finds (and possibly interpolates) the value for the specified year.
	function interpolateValues(values, time,st) {
		var i = bisect.left(source.tIndex, time, 0, source.tIndex.length - 1),
			a = parseInt(values[i]);
		if (i > 0) {
			var b = parseInt(values[i - 1]),
				t = (time - i) / (b - a);
			var temp=a * (1 - t) + b * t;
			if (!temp)return a;
			return temp;
		}	
		return a;
	}
	
	function initData(DV){
		DV=DV.spread;
		var DT=[];
		DV.forEach(function(itemS){
			var d=itemS.days.map(function(ite){
					return ite.date;
				});	
			Dates=Dates.concat(d);
			var obj={ src:itemS.src, count:0, days:{} };			
			itemS.days.forEach(function(ite){
				obj.days[ite.date]=ite;
				obj.count += ite.value.reduce(function(a,b){
					return parseInt(a)+parseInt(b);	
				});
			});
			if(obj.src=="全部")Sum=obj.count;else DT.push(obj);
		});
		var temp=Dates.reduce(function(prev, next){
			prev[next] = (prev[next] + 1) || 1;
		    return prev;
		},{});
		Dates=[];
		for(v in temp){ Dates.push(v); };
		Dates.sort(function(x, y) { return (parseInt(x) > parseInt(y)) ? 1 : -1});
		return DT;
	}
    
	function getData(DT){	
		var Data=[];
		Zero=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		DT.forEach(function(ite){
			var v=[];
			var a=[];
			Dates.forEach(function(tm){
				var arynum=Zero;
				if(ite.days[tm])arynum=ite.days[tm].value.map(function(d){ return parseInt(d); });
				v=v.concat(arynum);
			});
			var index=0,sum=0;
			v.forEach(function(el){
				sum+=parseInt(el);
				a[index++]=sum;
			});
			Data.push({ 
				name:ite.src,
				count:ite.count/Sum,
				now:v,
				sum:a,
				cls:Math.round(Math.random()*4)
			});
		});
		return Data;
	}
	function getDateFormat(date){ return parseInt(date.substr(4,2)) + "-" + parseInt(date.substr(6,2));}
	function getTimes(){
		times=[];
		Dates.forEach(function(ite){
			for(var k=0;k<24;k++){
				var hour=(k<10)?("0"+k):k;
				var tp=getDateFormat(ite)+ " "+ hour;
				times.push(tp);
			}
		});
		return times;
	}
	
	
	
