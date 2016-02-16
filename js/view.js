var myView;

function View(Data_View){
	this.DT=[];
	this.Date=[];
	this.option=this.getOption();
	this.Zero=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.hide=5;
	
	//获取x轴信息
	this.getX=function(){
		var tp=[];
		for(var j=0;j<this.Date.length;j++){
			for(var k=0;k<24;k++)
				tp.push(this.getDateFormat(this.Date[j])+ " "+k +":00");
		}
		return { axisLabel:{textStyle:{color:"white"}},type :'category',splitLine:{show:false}, data : tp };
	}
	this.setData=function(){	
		var DT=this.DT;
		for(var i=0;i<DT.length;i++){
			if(i>this.hide)break;
			var v=[];
			for(var j=0;j<this.Date.length;j++){
				var tp=this.Date[j];
				v=(DT[i].days[tp])?v.concat(DT[i].days[tp].value):v.concat(this.Zero);
			}
			this.option.legend.data.push(DT[i].src);
			if(i>0)this.option.legend.selected[DT[i].src]=false;
			var y={ name:DT[i].src,type:'line',data:v };
			this.option.series.push(y);
		}
		this.option.xAxis.push(this.getX());
	}
	this.sortData=function(DV){
		var TP={};
		this.Date=[];
		this.DT=[];
		for(var i=0;i<DV.spread.length;i++){
			var tp=	DV.spread[i];
			var obj={src:tp.src, count:0, days:{}};
			for(var j=0;j<tp.days.length;j++){
				var temp=tp.days[j].date;//求日期*****090122
				obj.days[temp]=tp.days[j];
				if(!TP[temp]){
					TP[temp]=1; this.Date.push(temp);
				}
				for(var k=0;k<tp.days[j].value.length;k++)
					obj.count+=parseInt(tp.days[j].value[k]);
			}
			this.DT.push(obj);
		}
        this.DT.sort(function(x, y) { return (x.count < y.count) ? 1 : -1});
		this.Date.sort(function(x, y) { return (parseInt(x) > parseInt(y)) ? 1 : -1});
	}
	
	this.InitData=function(data){
		if(data.error!=0)return;
		this.sortData(data.data);
		this.setData();
	}
	
	//执行
	this.InitData(Data_View);	
}
//Class End

	function loadView(data,id){
		myView=new View(data);
		Init(myView.option,id);
	}
	function Init(option,id){
		id=id || "main"
		require(['echarts','echarts/chart/line','echarts/chart/bar'],
            function (ec) {
                var myChart = ec.init(document.getElementById(id));				
				myChart.setOption(option);
            }
        )	 		
	}
	
	View.prototype.getOption=function(){
		var option = {
			tooltip : {
				trigger: 'axis',
				axisPointer :{
					type :'cross',crossStyle: {type : 'dashed'}
				}
			},
			grid:{x:40,y:40,x2:8},
			legend: {y:10,
				data:[],
      			selected : {
				},
				selectedMode :"single"
    		},
			toolbox: {
				show : true,
				feature : {
					mark : {show: true},
					dataView : {show: true, readOnly: false},
					magicType : {show: true, type: ['line', 'bar']},
					restore : {show: true},
					saveAsImage : {show: true}
				}
			},
			calculable : true,
			dataZoom : { show : true, realtime: true },
			xAxis : [ ],
			yAxis : [ {splitLine : { show : false }} ],
			series : [ ]
			};	
		return option;
	}
	View.prototype.getDateFormat=function(date){
		return parseInt(date.substr(4,2)) + "-" + parseInt(date.substr(6,2))
	}
	
	
