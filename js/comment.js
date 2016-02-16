	var EmotionData;
	
	function loadComment(id,eventId,id2){
		var option=getOptionComment();
		d3.select("#"+id).html("正在准备数据，请等待……");
		d3.select("#"+id).style("color","red");

		getEmotionData(eventId,function(error,data){
			if(error)document.getElementById(id).innerHTML="暂无数据";;
			var dt1=getCloudData(data.wordsp)
			    .map(function(d){return {text:d.name, size:d.value}}),
			    dt2=getCloudData(data.wordsn)
			    .map(function(d){return {text:d.name, size:d.value}});
			d3.select("#"+id).html("");
			d3.select("#"+id2).html("");
			d3.select("#"+id2).style("margin-bottom","100px");
			initDiv(id,["emp1","emp2"]);

			loadCloud(dt1,"emp1", "网民评论常用词-正");
			loadCloud(dt2,"emp2", "网民评论常用词-负");

			loadPie(data.emotion,id2);
			
			
			//Baidu lib not used
			//option.series[0].data=dt;
			//InitComment(option,id);
		})
	}
	function loadWords(id,eventId){
		d3.select("#"+id).html("正在准备数据，请等待……");
		d3.select("#"+id).style("color","red");
		getEmotionData(eventId,function(error,data){
			if(error)document.getElementById(id).innerHTML="暂无数据";;
			var dt1=getCloudData(data.wordsp)
			    .map(function(d){return {text:d.name, size:d.value}}),
			    dt2=getCloudData(data.wordsn)
			    .map(function(d){return {text:d.name, size:d.value}});
			d3.select("#"+id).html("");
			d3.select("#"+id).style("margin-bottom","100px");
			initDiv(id,["cmt1","cmt2"]);
			loadWordBar(dt2);	
		});
	}
	function initDiv(id, ids){
		var parent=$("#" + id), 
			width=parseInt(parent.width())/ids.length +"px",
			height=parseInt(parent.height()) + "px";
		parent.html();
		for(var i=0;i<ids.length;i++){
			var div = document.createElement('div');
			div.id=ids[i];
			document.getElementById(id).appendChild(div);
		}
		d3.select("#"+id).selectAll("div").style("width",width)
			.style("height",height).style("float","left");
	}
	function loadPie(dt,id){
		var option=getOptionPie();
		var rst=[{name:"支持",value:dt["emp"]},
			{name:"反对",value:dt["emn"]},
			{name:"中立",value:dt["em0"]},
		];
		option.series[0].data=rst;
		InitComment(option,id);
	}
	function getCloudData(obj){
		var dt=[];
		for(var o in obj){
			if(o=="说")continue;
			dt.push({ name:o, value:parseInt(obj[o]) });
		}
		return dt;
	}
	
	function getEmotionData(eventId, callback)
	{
		var dt={ ID:eventId};	
		ajaxData("comment.php",{key:"comment",data:JSON.stringify(dt)},"",function(data){
			if(data.error==0){
				callback(false, data.data);
			}else{
				callback(true,null);
				alert(data.message);	
			}
		});
	}
	function getWordsData(eventId, callback)
	{
		var dt={ ID:eventId};	
		ajaxData("comment.php",{key:"comment",data:JSON.stringify(dt)},"",function(data){
			if(data.error==0){
				callback(false, data.data);
			}else{
				callback(true,null);
				alert(data.message);	
			}
		});
	}
	function InitComment(option,id){
		id=id || "main";
		require(['echarts','echarts/chart/pie','echarts/chart/funnel'],
            function (ec) {
                var myChart = ec.init(document.getElementById(id));				
				myChart.setOption(option);
            }
        )	 		
	}
	function createRandomItemStyle() {
		return {
			normal: {
				color: 'rgb(' + [
					Math.round(Math.random() * 160),
					Math.round(Math.random() * 160),
					Math.round(Math.random() * 160)
				].join(',') + ')'
			}
		};
	}

	function loadWordBar(data){
		var Max=10;
		var option1=getOptionBar();
		var	option2=getOptionBar();
		var dt1,dt2;
		dt1=data.filter(function(d,index){ return (index % 2)==0; });
		dt2=data.filter(function(d,index){ return (index % 2)!=0; });
		dt1.forEach(function(d,i){if(i<Max){
			option1.xAxis[0].data.push(d.text);
			option1.series[0].data.push(d.size);
			}});
		dt2.forEach(function(d,i){if(i<Max){
			option2.xAxis[0].data.push(d.text);
			option2.series[0].data.push(d.size);
			}});
		InitComment(option1,"cmt1");
		InitComment(option2,"cmt2");
	}
	function getOptionBar(){
		var option = {
			title : { text: '事件正面高频词'},
			tooltip : { trigger: 'axis' },
			calculable : true,
			xAxis : [ {splitLine : { show : false },axisLabel: { show : true, textStyle:
                                { color : 'white',fontWeight:"bold",
				 align:'left'},rotate:60}, 
				type : 'category', data : [] } ],
			yAxis : [ {splitLine : { show : false },type : 'value',axisLabel:{textStyle:
				{show:true, color:"white"}} }],
			series: [{ name:'词频', type:'bar', data:[] } ]
		};
		return option;
	}
	function getOptionComment(){
		var option = {
			tittle : { text :"评论" },
			tooltip : { show:true },
			series : [
			{	name:'评论',
				type:'wordCloud',
				size:['80%','80%'],
				textRotation:[0,0],//标签翻转角度
				textPadding:0,
				autoSize:{ enable:true,minSize:14 },
				data:[]
			}]
		}
		return option;
	}
	function getOptionPie(){
		var option = {
			title : { text: '网民对该事件的态度', x:'center' },
			tooltip : { trigger: 'item', formatter: "{a} <br/>{b} : {c} ({d}%)" },
			legend: {
				orient : 'vertical', x : 'left',y:50,
				data:['支持','反对','中立']
			},
			toolbox: {
				show : true,
				feature : {
					dataView : {show: true, readOnly: false},
					magicType : {
						show: true, type: ['pie', 'funnel'],
						option: { funnel: { x: '25%', 
							width:'50%', funnelAlign:'left', max: 1548 }
						}
					},
					restore : {show: true}, saveAsImage : {show: true}
				}
			},
			calculable : true,
			series : [
				{
					name:'网民态度', type:'pie', radius : '55%',
					center: ['50%', '60%'], data:[]
				}
			]
		};
		return option;
	}
	
	//follow code is used for word cloud
	//good nice
	function loadCloud(data, id, text){
	var div=d3.select("#"+id),w=parseInt(div.style("width")),
			h=parseInt(div.style("height")),m=w>h?h:w;
	var tmp=data.map(function(d){ return d.size; });
	var maxV=tmp.reduce(function(a,b){ return a>b?a:b; });
	var fill = d3.scale.category10();	
	
	var sScale=d3.scale.linear().domain([0, maxV +1]).range([10,m/3]);
	d3.layout.cloud().size([w, h])
		.words(data)
		.font("Impact")
		.rotate(function() { return ~~(0) * 90; })
		.fontSize(function(d) { return sScale(d.size); })
		.on("end", draw)
		.start();
	
	function draw(words) {	  
	  	var title=d3.select("#" + id).append("svg")
			.attr("width", w)
			.attr("height", 25);
		title.append("g")
			.append("text")
			.attr("x", w/2-75)
      			.attr("y", 16)
			.style("font-weight",500)
			.style("font-family", "黑体")
			.style("font-size", "17px")
			.style("fill","red")
			.attr("text-anchor", "center")
	  		.text(text);
			
		var svg=d3.select("#" + id).append("svg")
			.attr("width", w)
			.attr("height", h);
			
		svg.append("g")
			.attr("transform", "translate(" +w/2+","+h/2+")")
			.selectAll("text")
			.data(words)
			.enter().append("text")
			.style("font-size", function(d) { return d.size+ "px"; })
			.style("font-family", "Impact")
			.style("fill", function(d, i) { return fill(i); })
			.attr("text-anchor", "middle")
			.attr("transform", function(d) {
				return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
			})
			.text(function(d) { return d.text; })
			.append("title").text(function(d){ return d.text + "：" + d.size + "次"; });
		}	
	}
