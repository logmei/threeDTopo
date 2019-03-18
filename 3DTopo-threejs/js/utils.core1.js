/**
 * Created by logmei on 2017/3/6.
 */
var stageEffect=$(".stageEffect");
var Utils_Topo3D = {
    params:{//挪动层
        initRotateX:60,
        autoPlay:true,
        mouseMoveSpeed:0.25,
        initAutoMoveSpeed:60,//初始化自动转速60s/圈
        autoMoveSpeed:60,//当前转速
        optionsLeft:0,//操作工具箱位置
        optionAndMenuWidth:0,//工具箱与menu之间的宽度
        scale:1,//缩放倍数
        scaleTimes:0,//缩放次数
        initScale:2,
        lastscale:1,//上一次缩放
        scaleDifflen:20//缩放差额
    },
    moveEventLists:[
        "speedMoveBlock","reportTool"
    ],//需要存在鼠标点击移动事件
    speedLine:{//速度条
        top:0,
        left:0,
        width:0,
        offsetBlock:10
    },
    scaleLine:{//速度条
        top:0,
        left:0,
        width:0,
        offsetBlock:10,
        marks:{}
    },
    speedMoveBlock:{//速度块
        obj:{},
        top:0,
        left:0
    },
    scaleMoveBlock:{//缩放
        obj:{},
        top:0,
        left:0
    },
    initSpeedMoveBlock:function(){
        Utils_Topo3D.params.optionsLeft=$(".optionsClass").offset().left;
        Utils_Topo3D.params.optionAndMenuWidth=$("#speedLine").offset().left-Utils_Topo3D.params.optionsLeft;
        Utils_Topo3D.speedLine.top=$("#speedLine").offset().top;
        Utils_Topo3D.speedLine.left=$("#speedLine").offset().left-Utils_Topo3D.params.optionsLeft;
        Utils_Topo3D.speedLine.width=getNumV($("#speedLine").css("width"));
        $("#speedMoveBlock").css("top", Utils_Topo3D.speedLine.top-Utils_Topo3D.speedLine.offsetBlock+"px");
        $("#speedMoveBlock").css("left",(Utils_Topo3D.speedLine.left)+"px");
        Utils_Topo3D.speedMoveBlock.top= Utils_Topo3D.speedLine.top-Utils_Topo3D.speedLine.offsetBlock;
        Utils_Topo3D.speedMoveBlock.left= Utils_Topo3D.speedLine.left;
        Utils_Topo3D.speedMoveBlock.obj=$("#speedMoveBlock");
    },
    initScaleMoveBlock:function(){
        Utils_Topo3D.params.optionsLeft=$(".optionsClass").offset().left;
        Utils_Topo3D.scaleLine.top=$("#scaleLine").offset().top;
        Utils_Topo3D.scaleLine.left=$("#scaleLine").offset().left-Utils_Topo3D.params.optionsLeft;
        Utils_Topo3D.scaleLine.width=getNumV($("#scaleLine").css("width"));
        $("#scaleMoveBlock").css("top",Utils_Topo3D.scaleLine.top-Utils_Topo3D.scaleLine.offsetBlock+"px");
        $("#scaleMoveBlock").css("left",Utils_Topo3D.scaleLine.left+Utils_Topo3D.scaleLine.width/2+"px");
        Utils_Topo3D.scaleMoveBlock.top= Utils_Topo3D.scaleLine.top-Utils_Topo3D.scaleLine.offsetBlock;
        Utils_Topo3D.scaleMoveBlock.left= Utils_Topo3D.scaleLine.left+Utils_Topo3D.scaleLine.width/2;
        Utils_Topo3D.scaleMoveBlock.obj=$("#scaleMoveBlock");

        $("#scaleUl>li").first().bind("click",function(){
            Utils_Topo3D.scaleMoveRedueAndAdd(-Utils_Topo3D.params.scaleDifflen);
        });
        $("#scaleUl>li").last().bind("click",function(){
            Utils_Topo3D.scaleMoveRedueAndAdd(Utils_Topo3D.params.scaleDifflen);
        });

       // $(".scaleLine li:before").css("top",Utils_Topo3D.scaleMoveBlock.top);
    },
    initLayers:function(){
        var cont="";
        for(var i=0;i<layers.length;i++){
             cont+='<tr><td>'+layers[i].id+'</td><td><span onclick="Utils_Topo3D.optionLayers(this)">关闭</span></td></tr>';
        }
        $(".LayerTableClass>tbody").append(cont);
    },
    optionLayers:function(obj){
       var layerId=$(obj).parent().prev().text();
       if($(obj).text()=="关闭"){
           $("#"+layerId).css("width","0").css("height","0");
           $(obj).text("打开");
       }else{
           $("#"+layerId).css("width","100%").css("height","100%");
           $(obj).text("关闭");
       }
    },
    scaleMoveRedueAndAdd:function(yy){
        Utils_Topo3D.params.scaleTimes=Utils_Topo3D.params.scaleTimes+1;
        var moveSet=Utils_Topo3D.scaleMoveBlock.left+yy;
        if(moveSet<=Utils_Topo3D.scaleLine.left){
            moveSet=Utils_Topo3D.scaleLine.left;
        }
        if(moveSet>=(Utils_Topo3D.scaleLine.left+Utils_Topo3D.scaleLine.width)){
            moveSet=Utils_Topo3D.scaleLine.left+Utils_Topo3D.scaleLine.width;
        }
        Utils_Topo3D.scaleMoveBlock.left=moveSet;
        Utils_Topo3D.scaleMoveBlock.obj.css("left",moveSet+"px");
        var scale=moveSet/(Utils_Topo3D.scaleLine.left+Utils_Topo3D.scaleLine.width/2);
        Utils_Topo3D.scaleModel(scale/Utils_Topo3D.params.lastscale);
        Utils_Topo3D.params.lastscale=scale;
    },
    scaleModel:function(scale){
        var transformCss=$(".stageEffect").css("transform");
        if(transformCss.indexOf("scale")!=-1){
            $(".stageEffect").css("transform",transformCss);
            transformCss.replace(new RegExp(/(scale\(\S+\))/g),"scale3d("+scale+","+scale+","+scale+")");
            $(".stageEffect").css("transform",transformCss);
        }else{
            $(".stageEffect").css("transform",transformCss+" scale3d("+scale+","+scale+","+scale+")");
        }
    },
    isHadMovefun:function(controlObjClassName){
        var move=false;
        for(var i=0;i<this.moveEventLists.length;i++){
            if(controlObjClassName.indexOf(this.moveEventLists[i])!=-1)move=true;
        }
        return move;
    },
    move:function(){
        var x = 0,y = 0,z = 0;
        var xx = 0,yy = 0;
        var xArr = [],yArr = [];
        var that=this;
        this.controlObjId="stageEffect";
        window.onmousedown = function (e) {//鼠标按下事件
            xArr[0] = e.clientX/2;//获取鼠标点击屏幕时的坐标
            yArr[0] = e.clientY/2;
            var controlObjId=e.srcElement.id;
            var controlObjClassName=e.srcElement.className;

            if(Utils_Topo3D.params.autoPlay){//若为自动旋转，鼠标移动不做操作
                window.onmousemove = null;
            }else{

                if($(e.srcElement).parents("#stageEffect").length==0&&!Utils_Topo3D.isHadMovefun(controlObjClassName))  {
                    window.onmousemove = null;
                    return;
                }else{
                    window.onmousemove = function (e) {//鼠标移动事件————当鼠标按下且移动时触发
                        xArr[1] = e.clientX/2;//获取鼠标移动时第一个点的坐标
                        yArr[1] = e.clientY/2;
                        yy += xArr[1] - xArr[0];//获得鼠标移动的距离
                        xx += yArr[1] - yArr[0];
                        //将旋转角度写入transform中
                        if(yy!=0&&xx!=0){
                            //  var eleId=e.srcElement.id;

                                if(controlObjClassName=='speedMoveBlock') {
                                    //速度滑块
                                    //查看范围
                                    var moveSet=Utils_Topo3D.speedMoveBlock.left+yy*2;
                                    if(moveSet<=Utils_Topo3D.speedLine.left){
                                        moveSet=Utils_Topo3D.speedLine.left;
                                    }
                                    if(moveSet>=(Utils_Topo3D.speedLine.left+Utils_Topo3D.speedLine.width)){
                                        moveSet=Utils_Topo3D.speedLine.left+Utils_Topo3D.speedLine.width;
                                    }
                                    Utils_Topo3D.params.autoMoveSpeed=toDecimal(((Utils_Topo3D.params.initAutoMoveSpeed*(moveSet-Utils_Topo3D.params.optionAndMenuWidth))/Utils_Topo3D.speedLine.width));
                                    Utils_Topo3D.speedMoveBlock.obj.css("left",moveSet+"px");
                                    $(".speedTip").html((Utils_Topo3D.params.autoMoveSpeed+Utils_Topo3D.params.initAutoMoveSpeed).toFixed(2)+"&nbsp;秒/圈");
                                    $(".animationClass").css("animation","spin "+(Utils_Topo3D.params.autoMoveSpeed+Utils_Topo3D.params.initAutoMoveSpeed)*1000+"ms linear 0s infinite")
                                    // $(".animationClass")
                                    //Utils_Topo3D.speedMoveBlock.obj.css("title",Utils_Topo3D.params.autoMoveSpeed);
                                }
                                else if(controlObjClassName=="'scaleMoveBlock'") {//缩放滑块

                                }else if(controlObjClassName=="reportTool") {//弹出框
                                    var top=getNumV($(e.srcElement).css("top"));
                                    var left=getNumV($(e.srcElement).css("left"));
                                    $(e.srcElement).css("top",(top+xx*2)+"px");
                                    $(e.srcElement).css("left",(left+yy*2)+"px");
                                }else{
                                    var box=$("#stageEffect")[0];
                                    box.style.transform = "rotatex("+(Utils_Topo3D.params.initRotateX+(-xx)*Utils_Topo3D.params.mouseMoveSpeed)+"deg) rotatey(0deg) rotatez("+(-yy*Utils_Topo3D.params.mouseMoveSpeed)+"deg)";
                                }
                            xArr[0] = e.clientX/2;
                            yArr[0] = e.clientY/2;
                        }

                    }
                }


            }
        };
        window.onmouseup = function () {//鼠标抬起事件————用于清除鼠标移动事件，
            window.onmousemove = null;
        }
    }
}