/**
 * Created by logmei on 2017/3/9.
 */
var reportOfDevice={
    highZIndex:10000,//最高显示层
    reportTipOnlyOne:true,
    reportTipId:"",
    reportTipIds:[],
    reportMap:{},//设备存储map
    repairSuccess : false,
    background:{
      transparent:false/*,
      color:"rgba(0,0,0,1)"*/
    },//透明
    lastXY:{//最新位置
        x:0,
        y:0,
        offsetX:95,
        offsetY:20
    },
    animation:{//是否添加动画
       enable: true,
       className:"reportClassAnimation"
    },
    tipHtml:"",//内容提示框对象
    sectionCont:[],//内容显示

       pieConfig : {//饼图配置信息
        width :150,
        height: 250,
        fontColor:"#A3A3A3",
        series: [],
        canvas: null,
        canvasBackgroudOpacity:true,
        unit: "kg",
        title:"",
        tooltips : {
            enable : true
        },
        animation :{
            enable: false
        },
        legend : {
            enable : true
        },
        text : {
            enable: false
        },
        circle:{
            clear:true
        }
    },
    configOptions:{
        config_info:true,//显示配置信息
        config_perform:true//显示性能
    },
    DDosParams:{//攻击流
        nodeIndex:0,
        nodes:['r10000000000','r1872','r1871','r1870','r1868','e12673','e12610'],
        color:"red"
    },
    repairDDosParams:{//修复攻击流
        nodeIndex:0,
        nodes:['r1872','r1871','r1870','r1868','e12673','e12610'],
        color:"red"
    },
    initSetting:function(topo){
        //this.reportMap=reportMap;
        this.tipHtml=$("#tip").html();
        this.DDosParams.nodeIndex=0;
    },
    DDosLine:function(){//攻击流
        if(this.DDosParams.nodeIndex==this.DDosParams.nodes.length-1)return;
        var linkNode=this.DDosParams.nodes[this.DDosParams.nodeIndex];
        var layerId=$("#"+linkNode).attr("layerId");
        var lineId="line-DDos-"+this.DDosParams.nodes[this.DDosParams.nodeIndex]+"-"+this.DDosParams.nodes[this.DDosParams.nodeIndex+1];
        topo.paintingDDosLink(layerId,this.DDosParams.nodes[this.DDosParams.nodeIndex],this.DDosParams.nodes[this.DDosParams.nodeIndex+1],lineId);
        this.DDosParams.nodeIndex++;
    },
    repairDDosLine:function(){//修复攻击流
        for(var i=0;i<this.repairDDosParams.nodes.length;i++){
            if(i==this.repairDDosParams.nodes.length-1)return;
            $("#line-"+reportOfDevice.repairDDosParams.nodes[i]+"-"+reportOfDevice.repairDDosParams.nodes[i+1]).animate({
                opacity: 1
            }, 'slow' );
            $("#line-"+reportOfDevice.repairDDosParams.nodes[i+1]+"-"+reportOfDevice.repairDDosParams.nodes[i]).animate({
                opacity: 1
            }, 'slow' );
            $("#line-DDos-"+reportOfDevice.repairDDosParams.nodes[i]+"-"+reportOfDevice.repairDDosParams.nodes[i+1]).remove();
        }
    },
    showTip:function(deviceId){
        this.highZIndex++;

        if($("#tip-"+deviceId)[0]!=undefined){
            $("#tip-"+deviceId).css("z-index",this.highZIndex);
            $("#tip-"+deviceId).find(".reportTool").css("z-index",this.highZIndex);
            return;
        }

        this.setTipNumber(deviceId);
        this.showReportValue(deviceId);//显示报告内容
    },
    showLinkTip:function(deviceId){
        this.highZIndex++;

        if($("#tip-"+deviceId)[0]!=undefined){
            $("#tip-"+deviceId).css("z-index",this.highZIndex);
            $("#tip-"+deviceId).find(".reportTool").css("z-index",this.highZIndex);
            return;
        }

        this.setTipNumber(deviceId);
        this.showLinkValue(deviceId);//显示报告内容
    },
    setTipNumber:function(deviceId){//设置弹出框的个数

        if(topo.controls.reportTipNumber>0&&(this.reportTipIds.length-topo.controls.reportTipNumber)>=0){
            for(var i=0;i<=(this.reportTipIds.length-topo.controls.reportTipNumber);i++){
                var id=this.reportTipIds.shift();
                this.closeTipBydeviceId(id);
                //最终位置
                if(this.lastXY.x>this.lastXY.offsetX)this.lastXY.x-=this.lastXY.offsetX;
                for(var n=0;n<this.reportTipIds.length;n++){
                    var obj=$("#tip-"+this.reportTipIds[n]);
                    var top=getNumV(obj.css("top"));
                    obj.css("top",(top-this.lastXY.offsetX)+"px");
                }
            }
        }
        if(deviceId!=undefined)this.reportTipIds.push(deviceId);
    },
    showDDosTip:function(deviceId,cont){
        this.highZIndex++;
        if($("#tip-DDosRepair-"+deviceId)[0]!=undefined){
            $("#tip-DDosRepair-"+deviceId).css("z-index",this.highZIndex);
            $("#tip-DDosRepair-"+deviceId).find(".reportTool").css("z-index",this.highZIndex);
            return;
        }
        this.showDDosRepair(deviceId,cont);//显示报告内容

    },
    closeTipBydeviceId:function(deviceId){
        $("#tip-"+deviceId).remove();
        if(this.hasOtherTips()==0){
            this.lastXY.x=0;
            this.lastXY.y=0;
        }
        topo.removeCheckedIdentify(deviceId);
    },
    closeTip:function(obj){
        $(obj).parent().parent().parent().remove();
        if(this.hasOtherTips()==0){
            this.lastXY.x=0;
            this.lastXY.y=0;
        }
        var deviceId=$(obj).parent().parent().parent().attr("id").substr(4);
        topo.removeCheckedIdentify(deviceId);
    },
    showReportValue:function(deviceId){
        //判断是否已打开

        var tip=$(this.tipHtml);
        var node=reportMap.get(deviceId);
        tip.attr("id","tip-"+deviceId);
        //设置背景色
        if(!this.background.transparent){
            tip.css("background",this.background.color);
        }


        this.sectionCont=[{"name":"设备名称","value":node.deviceName},{"name":"IP地址","value":node.mgmtIp},{"name":"设备类型","value":node.deviceType},{"name":"系统版本","value":node.osVersion},{"name":"设备厂商","value":node.vendor},{"name":"设备版本","value":node.deviceVersion},{"name":"问题数量","value":node.errorNum}];
        var cont="<li><input id=\"tab_report_"+deviceId+"_config\" type=\"radio\" checked name=\"report_tab"+deviceId+"\"><label for=\"tab_report_"+deviceId+"_config\">设备信息</label> <section  class=\"tab_report_section\">";
        for(var i=0;i<this.sectionCont.length;i++){
            cont+="<p><span class='title'>"+this.sectionCont[i].name+":</span><span class='contant'>"+this.sectionCont[i].value+"</span></p>";
        }
        tip.find(".tab_chose").append(cont+"</section></li>");
        if(this.configOptions.config_info)this.getConfigInfoReportCont(tip,deviceId);
        if(this.configOptions.config_perform)this.getConfigPerformReportCont(tip,deviceId);//性能

        $("#tip").before(tip);
        this.setReportDialogPosition(tip);

       // topo.paintingCheckedIdentify(deviceId);
    },
    showLinkValue:function(deviceId){
        //判断是否已打开
        var tip=$(this.tipHtml);
        tip.attr("id","tip-"+deviceId);
        //设置背景色
        if(!this.background.transparent){
            tip.css("background",this.background.color);
        }
       var cont="<li><input id=\"tab_report_"+deviceId+"_config\" type=\"radio\" checked name=\"report_tab"+deviceId+"\"><label for=\"tab_report_"+deviceId+"_config\">链路信息</label> <section  class=\"tab_report_section\">";
        var line=LinkMap.get(deviceId);
        for(var i=0;i<line.length;i++){
            cont+="<p><span class='title'>"+line[i].fromName+"设备:</span><span class='contant'>"+line[i].deviceName+"</span></p>";
            cont+="<p><span class='title'>"+line[i].fromName+"接口:</span><span class='contant'>"+line[i].interfaceName+"</span></p>";
        }
        tip.find(".tab_chose").append(cont+"</section></li>");
        tip.find(".reportTool_left").css("width","100%");
        tip.find(".reportTool_right").css("width","0%");
        tip.find(".contant").css("max-width","80%");
        if(this.configOptions.config_perform)this.getConfigPerformLinkCont(tip,deviceId);//性能

        $("#tip").before(tip);
        this.setReportDialogPosition(tip);
    },
    showDDosRepair:function(deviceId,cont){//ddos弹出框
        var tip=$(this.tipHtml);
        tip.attr("id","tip-DDosRepair-"+deviceId);
        var reportCont=$("<li><input id=\"tab_report_repair_"+deviceId+"_config\" type=\"radio\" checked name=\"report_tab_repair_"+deviceId+"\"><label for=\"tab_report_repair_"+deviceId+"_config\">Alert</label><section  class=\"tab_report_section\"> </section></li>")
        reportCont.find(".tab_report_section").append(cont);
        tip.find(".tab_chose").append(reportCont);
        tip.find(".reportTool_left").css("width","100%")
        $("#tip").before(tip);
       // $("#tip-DDosRepair-"+deviceId).css("background-image","url(img/repair.png)").css("background-position","100% 97%").css("background-repeat","no-repeat");
        var h=getNumV($("#tip-"+deviceId).css("height"));
        this.setReportDialogPosition(tip,h);
    },
    getConfigInfoReportCont:function(tip,deviceId){//设备信息
        //配置核查或主机漏洞
        var hadPie=false;//判断是否有饼图
        if(hostScanMap.get(deviceId)!=undefined){
            tip.find("._pie").css("display","block");
            //this.paintingPie(deviceId,tip,"主机漏扫");
            this.paintingEchartsPie(deviceId,tip,"主机漏扫");
            hadPie=true;
        }
        if(configCheckMap.get(deviceId)!=undefined){
            tip.find("._pie").css("display","block");
            //this.paintingPie(deviceId,tip,"配置核查");
            this.paintingEchartsPie(deviceId,tip,"配置核查");
            hadPie=true;
        }
        //DDos攻击
        if(DDosMap.get(deviceId)!=undefined){
            var DDosCont=[{"name":"攻击方式","value":DDosMap.get(deviceId).attackType},{"name":"发包pps峰值","value":DDosMap.get(deviceId).send_pps},{"name":"收包pps峰值","value":DDosMap.get(deviceId).receive_pps},{"name":"发包bps峰值","value":DDosMap.get(deviceId).send_bps},{"name":"收包bps峰值","value":DDosMap.get(deviceId).receive_bps}];

            var cont="<li><input id=\"tab_report_"+deviceId+"_DDos\" type=\"radio\"  name=\"report_tab"+deviceId+"\"><label for=\"tab_report_"+deviceId+"_DDos\"  style=\"left:72px;\">DDos信息</label> <section  class=\"tab_report_section\"  >";
            for(var i=0;i<DDosCont.length;i++){
                cont+="<p><span class='title'>"+DDosCont[i].name+":</span><span class='contant'>"+DDosCont[i].value+"</span></p>";
            }
            tip.find(".tab_chose").append(cont+"</section></li>");
        }
        if(hadPie){
            tip.find(".reportTool_left").css("width","50%");
            tip.find(".reportTool_right").css("width","50%");
            tip.css("background","");
        }else{
            tip.find(".reportTool_left").css("width","100%");
            tip.find(".reportTool_right").css("width","0%");
        }
    },
    getConfigPerformReportCont:function(tip,deviceId){//性能
        tip.find(".performBox").css("display","block");
        this.paintingEchartsLine(deviceId,tip,"","node");
    },
    getConfigPerformLinkCont:function(tip,deviceId){//线性能
        tip.find(".performBox").css("display","block");
        this.paintingEchartsLine(deviceId,tip,"","Link");
    },
    setReportDialogPosition:function(tip,nextOffsetT){//设置弹出框出现位置和动画
        //最终位置
        this.lastXY.x+=this.lastXY.offsetX;
       // this.lastXY.y+=this.lastXY.offsetY;
        //初始化屏幕中间位置
       // var pos = toolPosition.divOfScreenCenter(tip);
        var t=0;
        if(nextOffsetT!=undefined)t=nextOffsetT;
        tip.css("top",(this.lastXY.x+t)+"px").css("left",20+"px");
        tip.css("z-index",this.highZIndex);
        tip.find(".reportTool").css("z-index",this.highZIndex)
        var keyframesCont=KeyFramesUtil.getKeyFrame(3,"showReport");//report.css中获取showReport的keyframes
        var pos=toolPosition.divOfScreenCenter(tip);
        keyframesCont.cssRules[0].style.top=(this.lastXY.x+t)+"px";
        keyframesCont.cssRules[0].style.left=pos.left+"px";
        keyframesCont.cssRules[1].style.top=(this.lastXY.x+t)+"px";
        keyframesCont.cssRules[1].style.height=$("#"+tip.attr("id")).css("height");
        if(this.animation.enable)tip.addClass(this.animation.className);
    },
    paintingPie:function(deviceId,tip,title){//canvas画饼图
       var seriesData= [{name:"严重", value:"serious", color:"RGBA(255,0,0,1)"},
            {name:"中等", value:"secondary", color:"RGBA(255,255,0,1)"},
            {name:"轻微", value:"slight", color:"RGBA(255,0,255,1)"},
            {name:"关注", value:"follow", color:"RGBA(0,255,255,1)"},
            {name:"未知", value:"unkown", color:"RGBA(0,127,255,1)"}];//饼图颜色分配
        this.pieConfig.series=[];
        if(hostScanMap.get(deviceId)!=undefined||configCheckMap.get(deviceId)!=undefined){
            var seriesDataValue=hostScanMap.get(deviceId)!=undefined?hostScanMap.get(deviceId):configCheckMap.get(deviceId);
            for(var j=0;j<seriesData.length;j++){
                var dataValue=seriesData[j];
                if(seriesDataValue[dataValue.value]!=undefined){
                    dataValue.value=seriesDataValue[dataValue.value];
                    this.pieConfig.series.push(dataValue);
                }
            }

            tip.find("._pie").find("h3").text(title)
            var canvas = tip.find("canvas").eq(0);
            canvas.attr("id",deviceId+"-canvas");
            this.pieConfig.canvas=canvas[0];
            this.pieConfig.title=title
            //画饼图
            pieChart.initSettings(this.pieConfig);
            pieChart.render();
        }
    },
    paintingEchartsPie:function(deviceId,tip,title){//饼状图
          var seriesDataValue=hostScanMap.get(deviceId)!=undefined?hostScanMap.get(deviceId):configCheckMap.get(deviceId);
            var config ={
                myChart:null,
                legendData:[],
                seriesData:[],
                title:""
            };
            config.myChart = tip.find("#my_pie_container")[0];
            for(var j=0;j<seriesDataValue.length;j++){
                var dataValue=seriesDataValue[j];
               // config.legendData.push(dataValue.ruleLevelName);
                var obj=new Object();
                obj.value=dataValue.count;
                obj.name=dataValue.ruleLevelName;
                config.seriesData.push(obj);
            }
            if(seriesDataValue.length>0){
                tip.find("._pie").find("div.active").text(title)
                config.title = title;
                pie_echartRequire.initSetting(config);
                pie_echartRequire.render();
            }


    },
    paintingEchartsLine:function(deviceId,tip,title,type){//折线图
        if(type=="node"){
            this.paintingCpu(deviceId,tip);
            this.paintingMemory(deviceId,tip);
        }else if(type=="Link"){
            this.paintingIn(deviceId,tip);
            this.paintingOut(deviceId,tip);
        }

    },
    paintingCpu:function(deviceId,tip){

        tip.find(".line_chart").show();
        var config ={
            myChart:null,
            areaColor:{
                high:{offset0:'rgba(255, 0, 0, 0.4)',offset1:'rgba(255, 0, 0, 0.1)'},
                middle:{offset0:'rgba(255, 255, 0, 0.4)',offset1:'rgba(255, 255, 0, 0.1)'},
                low:{offset0:'rgba(2, 40, 184, 0.4)',offset1:'rgba(2, 40, 184, 0.1)'}
            } ,
            lineColor:'#1278b8',
            gridBackgroundColor:'rgba(255, 255, 255, 0.05)',
            tip:tip
        };
        config.myChart = tip.find("._line_cpu>div")[0];
        var lineRequire= LineRequire.init(config);
        setInterval(function () {
            lineRequire.data.shift();
            lineRequire.option.series[1].data.shift();
            var data=0;
            var data1=0;
            if(reportOfDevice.repairSuccess) data=lineRequire.randomData(50,1);
            else data=lineRequire.randomData(99,50);
            data1=lineRequire.randomData(50,30);
            lineRequire.changeColor(data);
            lineRequire.data.push(data);
            lineRequire.option.series[1].data.push(data1);
            lineRequire.paramConfig.tip.find("._line_cpu").find("span").eq(2).text(data.value[1]+"%");
            lineRequire.paramConfig.tip.find("._line_cpu").find("span").eq(1).text("CPU");
            lineRequire.option.series[0].data=lineRequire.data;
            lineRequire.render();
        }, 2000);

    },
    paintingMemory:function(deviceId,tip){
        tip.find(".line_chart").show();
        var config ={
            myChart:null,
            areaColor:{
                high:{offset0:'rgba(255, 0, 0, 0.05)',offset1:'rgba(255, 0, 0, 0.05)'},
                middle:{offset0:'rgba(255, 255, 0, 0.05)',offset1:'rgba(255, 255, 0, 0.05)'},
                low:{offset0:'rgba(125, 1, 180, 0.05)',offset1:'rgba(125, 1, 180, 0.05)'}
            },
            lineColor:'#9528B4',
            gridBackgroundColor:'rgba(255, 255, 255, 0.05)',
            tip:tip
        };
        config.myChart=tip.find("._line_M>div")[0];
        var lineRequire= LineRequire.init(config);
        setInterval(function () {
            lineRequire.data.shift();
            var data=lineRequire.randomData(40,30);
            lineRequire.changeColor(data);
            lineRequire.data.push(data);
            lineRequire.paramConfig.tip.find("._line_M").find("span").eq(2).text(data.value[1]+"%");
            lineRequire.paramConfig.tip.find("._line_M").find("span").eq(1).text("Memory");
            lineRequire.option.series[0].data=lineRequire.data;
            lineRequire.render();
        }, 2000);
    },
    paintingIn:function(deviceId,tip){

        tip.find(".line_chart").show();
        var config ={
            myChart:null,
            areaColor:{
                high:{offset0:'rgba(255, 0, 0, 0.4)',offset1:'rgba(255, 0, 0, 0.1)'},
                middle:{offset0:'rgba(255, 255, 0, 0.4)',offset1:'rgba(255, 255, 0, 0.1)'},
                low:{offset0:'rgba(2, 40, 184, 0.4)',offset1:'rgba(2, 40, 184, 0.1)'}
            } ,
            lineColor:'#1278b8',
            gridBackgroundColor:'rgba(255, 255, 255, 0.05)',
            tip:tip
        };
        config.myChart = tip.find("._line_cpu>div")[0];
        var lineRequire= LineRequire.init(config);
        setInterval(function () {
            lineRequire.data.shift();
            var data=0;
            if(reportOfDevice.repairSuccess) data=lineRequire.randomData(50,1);
            else data=lineRequire.randomData(99,50);
            lineRequire.changeColor(data);
            lineRequire.data.push(data);
            lineRequire.paramConfig.tip.find("._line_cpu").find("span").eq(2).text(data.value[1]+"%");
            lineRequire.paramConfig.tip.find("._line_cpu").find("span").eq(1).text("In");
            lineRequire.option.series[0].data=lineRequire.data;
            lineRequire.render();
        }, 2000);

    },
    paintingOut:function(deviceId,tip){
        tip.find(".line_chart").show();
        var config ={
            myChart:null,
            areaColor:{
                high:{offset0:'rgba(255, 0, 0, 0.05)',offset1:'rgba(255, 0, 0, 0.05)'},
                middle:{offset0:'rgba(255, 255, 0, 0.05)',offset1:'rgba(255, 255, 0, 0.05)'},
                low:{offset0:'rgba(125, 1, 180, 0.05)',offset1:'rgba(125, 1, 180, 0.05)'}
            },
            lineColor:'#9528B4',
            gridBackgroundColor:'rgba(255, 255, 255, 0.05)',
            tip:tip
        };
        config.myChart=tip.find("._line_M>div")[0];
        var lineRequire= LineRequire.init(config);
        setInterval(function () {
            lineRequire.data.shift();
            var data=lineRequire.randomData(40,30);
            lineRequire.changeColor(data);
            lineRequire.data.push(data);
            lineRequire.paramConfig.tip.find("._line_M").find("span").eq(2).text(data.value[1]+"%");
            lineRequire.paramConfig.tip.find("._line_cpu").find("span").eq(1).text("Out");
            lineRequire.option.series[0].data=lineRequire.data;
            lineRequire.render();
        }, 2000);
    },
    clickReportTool:function(obj){
        this.highZIndex++;
        $(obj).css("z-index",this.highZIndex);
        $(obj).find(".reportTool").css("z-index",this.highZIndex);
    },
    hasOtherTips:function(){
        return $(document).find("div[id^='tip-']").length;
    }
}