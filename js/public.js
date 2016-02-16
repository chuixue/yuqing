// JavaScript Document
//服务器配置相关
function getConfig(){
	var srvURL="http://10.10.1.201/demo";
	var srvIP="10.10.1.201";
	var ajaxPORT="80";
	var webPORT="80";
	var webURL=srvURL + ":" + webPORT;
	var ajaxURL=srvURL + ":" + ajaxPORT;
	
	srvURL="http://119.6.203.96/php/bin";
	var cfg={
		srvURL: srvURL,
		srvIP: srvIP,
		ajaxPORT: ajaxPORT,
		webPORT: webPORT,
		webURL: webURL,
		ajaxURL: ajaxURL
	};	
	return cfg;
}
function trim(str){ //删除左右两端的空格　　
     return str.replace(/(^s*)|(s*$)/g, "");
}
function ltrim(str){ //删除左边的空格
	return str.replace(/(^s*)/g,"");
}
function rtrim(str){ //删除右边的空格
	return str.replace(/(s*$)/g,"");
}
//设置cookies
function setCookie(name,value)
{
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}
//读取cookies
function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)"); 
    if(arr=document.cookie.match(reg))
        return (arr[2]);
    else
        return null;
}
//服务器地址，附加数据，信息标签ID，成功回调，错误回调
function ajaxData(url,data,rstId,callbackS,callbackE){
	rstId="#"+rstId;
	if(rstId!="")$(rstId).html("请等待...");
	var server=getConfig().srvURL;
	var rand= parseInt(Math.random() * 100);
	$.ajax({
		url: server + "/" + url,
		dataType: "jsonp",	 
		data: data,
		type: 'get',
		jsonpCallback: 'callback' + rand.toString(), 
		success: function (data) {	//out(data);//调试
			callbackS(data);
			if(rstId!="")$(rstId).html("OK");
		},
		error: function (xhr, status, error) {
			if(callbackE!=null)callbackE(xhr, status, error);
			if(rstId!="")$(rstId).html("连接服务器失败!");
			alert(error.message);
		}
	  });	
}




function EnterPress(e){ //传入 event 
	var e = e || window.event; 
	if(e.keyCode == 13)return true;
	return false;
}

function getTimeNow(){
	var now= new Date();
	var year=now.getFullYear();
	var month=now.getMonth()+1; 
	var day=now.getDate(); 
	var hour=now.getHours(); 
	var minute=now.getMinutes(); 
	var second=now.getSeconds(); 
	var nowdate=year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second; 	
	return nowdate;
}
Array.prototype.remove = function(val) {   
    var index = this.indexOf(val);   
    if (index > -1) {   
        this.splice(index, 1);   
    }   
}
Array.prototype.indexOf = function(val) {               
	for (var i = 0; i < this.length; i++) {   
      if (this[i] == val) return i;   
	}   
	return -1;   
}

//用于调试
function out(obj){
　　var ob=eval(obj);var property="";for(var p in ob)property+=p+ ": " + obj[p] + "\n";alert(property);
}
function $$(id){ return document.getElementById(id); };