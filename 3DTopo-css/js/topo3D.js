/**
 * Created by logmei on 2017/2/24.
 * 3d拓扑
 */
;!function(window, undefined){
    "use strict";

    var $, win, ready = {
        config: {}
    };

// 默认内置方法。
    var Topo = {
        v: '1.0',
        Nodes : [],//节点
        Links : [],//连线
        Layers : [],//层
        speedLine:{//旋转速度控制条
            top:0,
            left:0,
            width:0
        },
        scaleLine:{//缩放控制条
            top:0,
            left:0
        },
        NodeParams:{
            offsetT:15,//top轴偏移量
            offsetL:26,//left轴偏移量
            offsetZ:7,//设备立体偏移量

            hostoffsetT:1,//主机top轴偏移量
            hostoffsetL:26,//主机left轴偏移量
            hostoffsetZ:7,//主机设备立体偏移量
            multipleOfLayout:1.5//节点位置的扩展倍数
             },
        layerParams:{
            initX:60,//初始化时X的倾斜度
            mouseMoveSpeed:0.25,//鼠标拖动速度
            autoMoveSpeed:60,//1圈60s
            mouseMoveLayerClass:"stageEffect",//旋转层样式
            autoPlay:true,//自动旋转
            scaleTimes:1//缩放
        },
        configOptions:{
            config_info:true,//显示配置信息
            config_perform:false//显示性能
        }

    };



    /*
    定义对象：topoClass
    url：连接或json串
       json串为{nodes:{},links{},layers{}}
    stageId:为舞台id
    */
    var TopoClass = function(url,stageId){
        var that = this;
        that.config = $.extend({}, that.config, ready.config, {url : url},{stageId:stageId});
        that.reload();

    };

    TopoClass.pt = TopoClass.prototype;

   //默认配置
    //layers的第一个对象顶层，其他层的translateZ均为负值即下面的层
   TopoClass.pt.config = {
       layers:[{"id":"topLayer","tz":"0","width":1600,"height":1000,"deviceTypes":""}],
       nodeParams:Topo.NodeParams,
       layerParams:Topo.layerParams,
       configOptions:Topo.configOptions,
       topLayerId:"topLayer",
       layerMap:{"topLayer":"0"}
    };
    //加载数据
    TopoClass.pt.reload = function(){
        if ( typeof this.config.url === "string" ) {
            var url1=eval("("+this.config.url+")");
            if(typeof url1 === "object"){
                this.config.nodes=url1.nodes;
                this.config.links=url1.links;
                if(typeof this.config.layers != "undefined"){
                    this.config.layers=url1.layers;
                    this.config.topLayerId=this.config.layers[0].id;

                    //保存层的高度
                    this.config.layerMap=new Map();
                    for(var i=0;i<url1.layers.length;i++){
                        this.config.layerMap.put(url1.layers[i].id,url1.layers[i].tz);
                    }

                }
            }else{
                //连接
            }
        }
    }
    //创建拓扑
    TopoClass.pt.create=function(){
        this.paintingLayers();
        this.paintingNodes();
        this.paintingLinks();
        this.paintingIdentifys();
    }
    //画标志
    TopoClass.pt.paintingIdentifys=function(){
        //画节点
        for(var i=0;i<this.config.nodes.length;i++){
            var node=this.config.nodes[i];
            if(this.config.configOptions.config_info){//配置信息
                this.drawconfigCheckDevices(node.deviceId);
              //  this.drawDDosDevices(node.deviceId);
                this.drawhostScanDevices(node.deviceId);
            }
            if(this.config.configOptions.config_perform) {//配置信息
                this.drawPerformDevices(node.deviceId);
            }

        }
    }
    //画选中标志
    TopoClass.pt.paintingCheckedIdentify=function(deviceId){
        var content=$(map.get("checked_identify"));
        $("#"+deviceId).append(content);
    }
    //获得画选中标志样式
    /**
     *
     * @param device:对象
     * @param isSufferDDos:true遭受攻击，false没有
     */
    TopoClass.pt.changeCheckedIdentifyClass=function(device,isSufferDDos){
        var div=device.find(".checkedIdentifyClass>div").eq(0);
        if(isSufferDDos){
            div.removeClass("circle1").addClass("ddosCircle1")
            div.find("div").removeClass("inner-cirlce1").addClass("ddosInner-cirlce1");
        }else{
            div.removeClass("ddosCircle1").addClass("circle1")
            div.find("div").removeClass("ddosInner-cirlce1").addClass("inner-cirlce1");
        }
    }
    //画选中标志
    TopoClass.pt.removeCheckedIdentify=function(deviceId){
        var content=$(map.get("checked_identify"));
        $("#"+deviceId).find(".circle").remove();
    }
    TopoClass.pt.drawPerformDevices=function(deviceId){//性能
        var node=reportMap.get(deviceId);
        for(var i=0;i<perform.length;i++){
            if(perform[i].ip==node.mgmtIp){
                performMap.put(deviceId,perform[i]);
                this.paintingIdentify(deviceId,"identify_red","C");
                this.paintingIdentify(deviceId,"identify_blue","M");
                this.paintingIdentify(deviceId,"identify_yellow","D");
            }
        }
    }
    TopoClass.pt.clearIdentifys=function(){//清除标志
        $(".identifyClass").remove();
        $("div[id^='tip-']").remove();
    }
    TopoClass.pt.drawDDosDevices=function(deviceId){//画受攻击的设备
        var node=reportMap.get(deviceId);
        for(var i=0;i<ddos.length;i++){
            if(ddos[i].ip==node.deviceName||ddos[i].ip==node.mgmtIp){
                DDosMap.put(deviceId,ddos[i]);
                this.paintingIdentify(deviceId,"identify_blue");
                $("#"+deviceId).addClass("heartAnimation");
            }
        }
    },
    TopoClass.pt.drawhostScanDevices=function(deviceId){//画主机漏扫的设备
        var node=reportMap.get(deviceId);
        var had=false;
        var check=[];
        for(var i=0;i<hostScan.length;i++){
            if(hostScan[i].ip==node.deviceName){
                had=true;
                check.push(configCheck[i]);
            }
        }
        if(had){
            hostScanMap.put(deviceId,check);
            this.paintingIdentify(deviceId,"identify_yellow");
        }
    },
    TopoClass.pt.drawconfigCheckDevices=function(deviceId){//画配置核查的设备
        var node=reportMap.get(deviceId);
        var had=false;
        var check=[];
        for(var i=0;i<configCheck.length;i++){
            if(configCheck[i].ip==node.mgmtIp){
                had=true;
                check.push(configCheck[i]);
            }
        }
        if(had){
            configCheckMap.put(deviceId,check);
            this.paintingIdentify(deviceId,"identify_yellow");
        }

    }
    /**
     * 画层
     */
   TopoClass.pt.paintingLayers=function(){
       for(var i=0;i<this.config.layers.length;i++){
           var layer=this.config.layers[i];
           var layersDiv=$('<div class="stageBottom" id="'+layer.id+'"></div>');
           layersDiv.css("transform","translateZ("+layer.tz+"px)")
                       .css("-webkit-transform","translateZ("+layer.tz+"px)")
                       .css("-moz-transform","translateZ("+layer.tz+"px)")
                       .css("-o-transform","translateZ("+layer.tz+"px)")
                       .css("-ms-transform","translateZ("+layer.tz+"px)");
           $("#"+this.config.stageId).append(layersDiv);
       }
   }
    /**
     * 画点
     */
    TopoClass.pt.paintingNode=function(layerId,node){
        var positionStr= 'left:'+node.tuoPuX*this.config.nodeParams.multipleOfLayout+'px;top:'+node.tuoPuY*this.config.nodeParams.multipleOfLayout+'px;';
        var nodeContent=map.get("container");
        var nodeChildCont=map.get(node.deviceType);
        var nodeDiv=$(nodeContent);
         nodeDiv.attr("id",node.deviceId);
        nodeDiv.attr("style",positionStr);
        nodeDiv.attr("layerId",layerId);
        nodeDiv.attr("deviceType",node.deviceType);
        nodeDiv.attr("onclick","showReportCont('"+node.deviceId+"')");
        nodeDiv.append(nodeChildCont);
        reportMap.put(node.deviceId,node);
        $("#"+layerId).append(nodeDiv);

    }
    /**
     * 标注设备
     * @param deviceId
     * @param type  identify_yellow：A(Audit)，identify_red:V(vulnerability),identify_blue:D(DDos)
     */
    TopoClass.pt.paintingIdentify=function(deviceId,type,valueText){
        var content=$(map.get(type));
        if(valueText!=undefined)content.find(".identify_front").text(valueText);
        $("#"+deviceId).append(content);
    }

    /**
     * 画线
     * 参数均为id
     */
    TopoClass.pt.paintingLink=function(layerId,nodeId1,nodeId2,lineId){
        var lineDiv=$("<div class='lineClass' id='"+lineId+"'></div>");
        var offsetT=this.config.nodeParams.offsetT;//top轴偏移量
        var offsetL=this.config.nodeParams.offsetL;//left轴偏移量
        var offsetZ=this.config.nodeParams.offsetZ;//设备立体偏移量
        var top=$("#"+nodeId1).attr("deviceType")=="host"?(getNumV($("#"+nodeId1).css("top"))+this.config.nodeParams.hostoffsetT):(getNumV($("#"+nodeId1).css("top"))+this.config.nodeParams.offsetT);
        var left=$("#"+nodeId1).attr("deviceType")=="host"?(getNumV($("#"+nodeId1).css("left"))+this.config.nodeParams.hostoffsetL):(getNumV($("#"+nodeId1).css("left"))+this.config.nodeParams.offsetL);
        var top2=$("#"+nodeId2).attr("deviceType")=="host"?(getNumV($("#"+nodeId2).css("top"))+this.config.nodeParams.hostoffsetT):getNumV($("#"+nodeId2).css("top"))+this.config.nodeParams.offsetT;
        var left2=$("#"+nodeId2).attr("deviceType")=="host"?(getNumV($("#"+nodeId2).css("left"))+this.config.nodeParams.hostoffsetL):getNumV($("#"+nodeId2).css("left"))+this.config.nodeParams.offsetL;
        var rotateAngleZ=getAngle(top,left,top2,left2);//水平面转角
        var hypotenuse=getHypotenuse(top,left,top2,left2);//平角斜边
        lineDiv.css("top",top+"px");
        lineDiv.css("left",left+"px");
        //同层连线
        if($("#"+nodeId1).attr("layerId") == $("#"+nodeId2).attr("layerId") ){//若为顶层画平面线
            var startNodeLayerId=$("#"+nodeId1).attr("layerId");
            var tz=parseInt(this.config.layerMap.get(startNodeLayerId))+offsetZ;
            lineDiv.css("transform","translateZ(7px) rotateZ("+rotateAngleZ+"deg) ");
            lineDiv.css("width",hypotenuse+"px");
            $("#"+startNodeLayerId).append(lineDiv);
        }else{//不同层连线
            var startNodeLayerId=$("#"+nodeId1).attr("layerId");
            var layer1TZ=parseInt(this.config.layerMap.get($("#"+nodeId1).attr("layerId")))+offsetZ;
            var layer2TZ=parseInt(this.config.layerMap.get($("#"+nodeId2).attr("layerId")))+offsetZ;
            var h=layer2TZ-layer1TZ;
            var rotateAngleY=getAngleBottoms(hypotenuse,h);//立体转角
            hypotenuse=getHypotenuseBySide(hypotenuse,Math.abs(h));
            lineDiv.css("transform","translateZ(7px) rotateZ("+rotateAngleZ+"deg) rotateY("+rotateAngleY+"deg)");
            lineDiv.css("width",hypotenuse+"px");
            $("#"+startNodeLayerId).append(lineDiv);
        }


    }
    /**
     * 画线
     * 参数均为id
     */
    TopoClass.pt.paintingDDosLink=function(layerId,nodeId1,nodeId2,lineId){
        var lineDiv=$("<div class='lineClassDDos' id='"+lineId+"'></div>");
        var offsetT=this.config.nodeParams.offsetT;//top轴偏移量
        var offsetL=this.config.nodeParams.offsetL;//left轴偏移量
        var offsetZ=this.config.nodeParams.offsetZ;//设备立体偏移量
        var top=$("#"+nodeId1).attr("deviceType")=="host"?(getNumV($("#"+nodeId1).css("top"))+this.config.nodeParams.hostoffsetT):(getNumV($("#"+nodeId1).css("top"))+this.config.nodeParams.offsetT);
        var left=$("#"+nodeId1).attr("deviceType")=="host"?(getNumV($("#"+nodeId1).css("left"))+this.config.nodeParams.hostoffsetL):(getNumV($("#"+nodeId1).css("left"))+this.config.nodeParams.offsetL);
        var top2=$("#"+nodeId2).attr("deviceType")=="host"?(getNumV($("#"+nodeId2).css("top"))+this.config.nodeParams.hostoffsetT):getNumV($("#"+nodeId2).css("top"))+this.config.nodeParams.offsetT;
        var left2=$("#"+nodeId2).attr("deviceType")=="host"?(getNumV($("#"+nodeId2).css("left"))+this.config.nodeParams.hostoffsetL):getNumV($("#"+nodeId2).css("left"))+this.config.nodeParams.offsetL;
        var rotateAngleZ=getAngle(top,left,top2,left2);//水平面转角
        var hypotenuse=getHypotenuse(top,left,top2,left2);//平角斜边
        lineDiv.css("top",top+"px");
        lineDiv.css("left",left+"px");
        lineDiv.css("border-left","2px solid red");
        lineDiv.css("border-top","2px solid red")
        //同层连线
        if($("#"+nodeId1).attr("layerId") == $("#"+nodeId2).attr("layerId") ){//若为顶层画平面线
            var startNodeLayerId=$("#"+nodeId1).attr("layerId");
            var tz=parseInt(this.config.layerMap.get(startNodeLayerId))+offsetZ;
            lineDiv.css("transform","translateZ(7px) rotateZ("+rotateAngleZ+"deg) ");

           // $(lineDiv).animate({width:hypotenuse+'px'},1500,"linear");
            $("#"+startNodeLayerId).append(lineDiv);
            animatePaintLine(lineDiv,hypotenuse,1000,0);
        }else{//不同层连线
            var startNodeLayerId=$("#"+nodeId1).attr("layerId");
            var layer1TZ=parseInt(this.config.layerMap.get($("#"+nodeId1).attr("layerId")))+offsetZ;
            var layer2TZ=parseInt(this.config.layerMap.get($("#"+nodeId2).attr("layerId")))+offsetZ;
            var h=layer2TZ-layer1TZ;
            var rotateAngleY=getAngleBottoms(hypotenuse,h);//立体转角
            hypotenuse=getHypotenuseBySide(hypotenuse,Math.abs(h));
            lineDiv.css("transform","translateZ(7px) rotateZ("+rotateAngleZ+"deg) rotateY("+rotateAngleY+"deg)");
            //lineDiv.css("width",hypotenuse+"px");
           // lineDiv.css("width",hypotenuse+"px");

           // $(lineDiv).animate({width:hypotenuse+'px'},1500,"linear");
            $("#"+startNodeLayerId).append(lineDiv);
            animatePaintLine(lineDiv,hypotenuse,1000,0);
        }


    }

    /**
     * 遍历画点
     */
    TopoClass.pt.paintingNodes=function(){
        //画节点
        for(var i=0;i<this.config.nodes.length;i++){
            var node=this.config.nodes[i];
            //根据分层来画点
                for(var j=0;j<this.config.layers.length;j++){
                var layer=this.config.layers[j];
                if(layer.deviceTypes.indexOf(","+node.deviceType+",")!=-1){
                    this.paintingNode(layer.id,node);
                }
            }
        }

    }

    /**
     * 遍历画线
     */
    TopoClass.pt.paintingLinks=function(){
         for(var i=0;i<this.config.links.length;i++){
             var link=this.config.links[i];
             var layerId=$("#"+link.deviceId).attr("layerId");
             var lineId="line-"+link.deviceId+"-"+link.nbDeviceId;
             this.paintingLink(layerId,link.deviceId,link.nbDeviceId,lineId);
         }
    }
    /**
     * 自动旋转
     */
    TopoClass.pt.autoRotate=function(){
        if(this.config.layerParams.autoPlay) {//若为自动旋转，鼠标移动不做操作
            if($(".stageAll").hasClass("animationClass")){
                $(".stageAll").css('animation-play-state', 'running');
            }else{
                $(".stageAll").addClass("animationClass");

            }

        }else{
            $(".stageAll").css('animation-play-state', 'paused');
          //  $(".stageAll").removeClass("animationClass");
        }

    }

    /*
    * 鼠标按下且移动时触发，
    * */
   TopoClass.pt.move=function(){
           //var initX=60;
           var box = document.querySelector("."+this.config.layerParams.mouseMoveLayerClass);
           var x = 0,y = 0,z = 0;
           var xx = 0,yy = 0;
           var xArr = [],yArr = [];
           var that=this;
           window.onmousedown = function (e) {//鼠标按下事件
               xArr[0] = e.clientX/2;//获取鼠标点击屏幕时的坐标
               yArr[0] = e.clientY/2;
               if(that.config.layerParams.autoPlay){//若为自动旋转，鼠标移动不做操作
                   window.onmousemove = null;
               }else{
                   window.onmousemove = function (e) {//鼠标移动事件————当鼠标按下且移动时触发
                       xArr[1] = e.clientX/2;//获取鼠标移动时第一个点的坐标
                       yArr[1] = e.clientY/2;
                       yy += xArr[1] - xArr[0];//获得鼠标移动的距离
                       xx += yArr[1] - yArr[0];
                       //将旋转角度写入transform中
                       if(yy!=0&&xx!=0){
                           var eleId=e.srcElement.id;
                           if(eleId=="speedMoveBlock"){//滑块
                               var left= getNumV($(e.srcElement).css("left"));
                               var width=getNumV($("#speedLine").css("width"));
                            //  $(e.srcElement).css("left",left+)
                           }
                           box.style.transform = "rotatex("+(that.config.layerParams.initX+(-xx)*that.config.layerParams.mouseMoveSpeed)+"deg) rotatey(0deg) rotatez("+(-yy*that.config.layerParams.mouseMoveSpeed)+"deg)";
                           xArr[0] = e.clientX/2;
                           yArr[0] = e.clientY/2;
                       }

                   }
               }
           };
           window.onmouseup = function () {//鼠标抬起事件————用于清除鼠标移动事件，
               window.onmousemove = null;
           }
   }

    /**
     * 初始化工具箱
     */
    TopoClass.pt.initBar=function(){
        //自动旋转控制条
        this.config.speedLine.top= getNumV($(".speedLine").css("top"));
        this.config.speedLine.left= getNumV($(".speedLine").css("left"));
        this.config.speedLine.width=getNumV($(".speedLine").css("width"));
        //自动旋转控制条上的滑块
       $(".speedMoveBlock").css("top",(this.config.speedLine.top-3)+"px");
       $(".speedMoveBlock").mousedown(function(){
           var xx = 0,yy = 0;
           var xArr = [],yArr = [];
           window.onmousemove = function (e) {//鼠标移动事件————当鼠标按下且移动时触发
               xArr[1] = e.clientX/2;//获取鼠标移动时第一个点的坐标
               yArr[1] = e.clientY/2;
               yy += xArr[1] - xArr[0];//获得鼠标移动的距离
               xx += yArr[1] - yArr[0];
               //将旋转角度写入transform中
               if(yy!=0&&xx!=0){
                   box.style.transform = "rotatex("+(that.config.layerParams.initX+(-xx)*that.config.layerParams.mouseMoveSpeed)+"deg) rotatey(0deg) rotatez("+(-yy*that.config.layerParams.mouseMoveSpeed)+"deg)";
                   xArr[0] = e.clientX/2;
                   yArr[0] = e.clientY/2;
               }

           }
       });

    }

    window.Topo=Topo;

// 主入口
    ready.init = function(){
        $ = jQuery;
        win = $(window);

        Topo.create = function(url,stage){
            var topo = new TopoClass(url,stage);
            topo.config.layerParams.autoPlay=true;
            topo.create();
           // topo.move();
            topo.autoRotate();

            return topo;
        };
    };

    'function' === typeof define ? define(function(){
        ready.init();
        return Topo;
    }) : function(){
        ready.init();
    }();

}(window);
