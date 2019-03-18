$(document).ready(function() {
	setTimeout(ddosAttack, 1000);
});

function ddosAttack(){
	var node;
	for(var i=0;i<nodes.length;i++){
        if(nodes[i].deviceName == "10.99.8.20"){
        	node = nodes[i];
        	break;
        }
    }
	// 提示受到ddos攻击信息
	var $_div = $("<div id='ddos-attack' style='position: absolute; top:47px; right:300px;'>");
	var $_img = $("<img src='img/ld.png' width='23px' height='21px'/>");
	$_div.append($_img);
	$(".wai").append($_div);
	// 画出受到ddos攻击的设备
	topo.drawDDosDevices(node.deviceId);
	// 找出链路
	var linkNode = ['r1872','r1871','r1870','r1868','e12673','e12613'];
    //  显示攻击流
    showDDosLine(node);

}
/**
 * 显示攻击流
 */
function showDDosLine(node){
    var n=node;
    setTimeout(function(){
        // reportOfDevice.showDDosTip(node.deviceId,"<div id='repair-log' style='height:200px;'></div><a href='javascript:repair();'></a>")
        if(reportOfDevice.DDosParams.nodeIndex>0){
            $("#line-"+reportOfDevice.DDosParams.nodes[reportOfDevice.DDosParams.nodeIndex-1]+"-"+reportOfDevice.DDosParams.nodes[reportOfDevice.DDosParams.nodeIndex]).animate({
                opacity: 0
            }, 'slow' );
            $("#line-"+reportOfDevice.DDosParams.nodes[reportOfDevice.DDosParams.nodeIndex]+"-"+reportOfDevice.DDosParams.nodes[reportOfDevice.DDosParams.nodeIndex-1]).animate({
                opacity: 0
            }, 'slow' );
        }
        reportOfDevice.DDosLine();
        if(reportOfDevice.DDosParams.nodeIndex==reportOfDevice.DDosParams.nodes.length-1){
            setTimeout(function(){
	            $("#line-"+reportOfDevice.DDosParams.nodes[reportOfDevice.DDosParams.nodeIndex-1]+"-"+reportOfDevice.DDosParams.nodes[reportOfDevice.DDosParams.nodeIndex]).animate({
	                opacity: 0
	            }, 'slow' );
	            $("#line-"+reportOfDevice.DDosParams.nodes[reportOfDevice.DDosParams.nodeIndex]+"-"+reportOfDevice.DDosParams.nodes[reportOfDevice.DDosParams.nodeIndex-1]).animate({
	                opacity: 0
	            }, 'slow' );
            },1500);
            setTimeout(function(){
            	// 自动弹出信息
            	reportOfDevice.showTip(n.deviceId);
            	//修改为攻击选中状态
            	topo.changeCheckedIdentifyClass($("#"+n.deviceId),true);
            	setTimeout(function(){
                    var $_div1 = $("<div id='repair-info' style='margin-left: 10px;margin-bottom: 25px;'></div>");
                    $_div1.append("<p>The device (ip address 10.99.8.20 ) is attacked by </p>");
                    $_div1.append("<p>DDOS ICMP Flood. </p>");
                    $_div1.append("<p>Remediation:</p>");
                    $_div1.append("<p>Add the anti-ddos commands on the firewall specific</p>");
                    $_div1.append("<p>interfaces to defense the ddos attack.</p>");
                    $_div1.append("<img src='img/repair.png' class='repairClass'>")
                    reportOfDevice.showDDosTip(n.deviceId,$_div1)
                    $("#repair-info").after("<a id='repair-start' class='repair_buttom' href='javascript:repair(0,\""+n.deviceId+"\");'>Repair</a>");
                    initPaintingProgress();
//                paintingProgress();
            	}, 500);
            },1800);
            //显示修复
        }else{
            showDDosLine(n);
        }

    }, 1500);
}

function repair(index, deviceId){
    //显示修复窗口
    $(".repair_end").animate({"opacity":1},"slow");
    //显示进度条
	$("#repair-info").after(map.get("progress_bar"));
	$("#repair-start").remove();
	initPaintingProgress();
	_repair(index, deviceId);
}

function _repair(index, deviceId){
	setTimeout(function(){
		cleanClass();
		$(".repair_end .contant").append(" <p class='repair_bg'><span>"+cmd[index++]+"</span></p>");
		scrollToBottom();
		if(index < cmd.length){
			_repair(index, deviceId);
			progressBar.update(index/cmd.length *100);
		} else {
			reportOfDevice.repairSuccess = true;
			progressBar.update(100);
            reportOfDevice.repairDDosLine();
            $("#ddos-attack").remove();
            //修改为不受攻击状态
            topo.changeCheckedIdentifyClass($("#"+deviceId),false);
		}
	},Math.round(Math.random() * 200));
  }          

function scrollToBottom(){
	$(".repair_end .contant").animate({scrollTop:$(".repair_end .contant").get(0).scrollHeight},1);
}

function cleanClass(){
	$(".repair_end .contant p").removeAttr("class");
}







