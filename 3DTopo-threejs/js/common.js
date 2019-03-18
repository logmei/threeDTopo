var myCharts


//获取整数值
function getNumV(v){
    if(v==undefined){
        return 20;
    }else{
        var v1= v.split("px");
        return parseInt(v1[0]);
    }

}
/**
 *
 * @param lineDiv
 * @param w:总宽度
 * @param s:总时间
 * @param index:次数
 */
function animatePaintLine(lineDiv,w,s,index){
    setTimeout(function () {
        var width=(w*200/s)*index++;
        width = parseFloat(width.toFixed(1));
        if (width >= w) {
            width=w;
        } else {
            animatePaintLine(lineDiv,w,s,index);
        }
        lineDiv.css({ width: width + 'px' });
    }, 200);
}

//等待numberMillis毫秒后继续
function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

//求角度
function getAngle(x1, y1, x2, y2) {
    // 直角的边长
    var x = Math.abs(x1 - x2);
    var y = Math.abs(y1 - y2);
    // 斜边长
    var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    // 余弦
    var cos = y / z;
    // 弧度
    var radina = Math.acos(cos);
    // 角度
    var angle =  180 / (Math.PI / radina);

    if(x2<x1&&y2>y1)angle=-angle;
    if(x2<x1&&y2<y1)angle=angle+180;
    if(x2>x1&&y2<y1)angle=-(angle+180);
    return angle;
}

//根据长度求角度c:长，h:高
function getAngleBottoms(c, h) {
    // 斜边长
    var z = Math.sqrt(Math.pow(c, 2) + Math.pow(h, 2));
    // 余弦
    var cos = c / z;
    // 弧度
    var radina = Math.acos(cos);
    // 角度
    var angle =  180 / (Math.PI / radina);
    if(h>0)angle=-angle;

    return angle;
}
//求斜边
function getHypotenuse(x1, y1, x2, y2) {
    // 直角的边长
    var x = Math.abs(x1 - x2);
    var y = Math.abs(y1 - y2);
    // 斜边长
    var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    return z;
}

//根据直角边求斜边
//c:平面长，h：高
function getHypotenuseBySide(c,h){
    var z = Math.sqrt(Math.pow(c, 2) + Math.pow(h, 2));
    return z;
}

//保留两位小数
//功能：将浮点数四舍五入，取小数点后2位
function toDecimal(x) {
    var f = parseFloat(x);
    if (isNaN(f)) {
        return;
    }
    f = Math.round(x*100)/100;
    return f;
}



//关闭工具
$(document).ready(function(){
    var h = $(window).height();
    var w = $(window).width();
    $(".on").css("top",h*0.48+"px");
    $(".off").css("top",h*0.48+"px");
    //工具打开
    $(".on").click(function(){
        $("body nav").animate({
            opacity:1,
            right:'0px'
        },1500);
        $(".on").css("display","none");
        $("body nav .off").delay(1500).fadeIn();
    });
    //工具关闭
    $(".off").click(function(){
        $("body nav").animate({
            opacity:0,
            right:'-300px'
        },1500);
        $(".off").css("display","none");
        $("body .on").delay(1500).fadeIn();
    });
    
});
//初始化进度条
function initPaintingProgress(){
    var object=new Object();
    object.$progress=$('.progress');
    object.$bar=$('.progress__bar');
    object.$text=$('.progress__text');
    $('.progress').addClass('progress--active');
    progressBar.initSetting(object);
}

//进度条
function paintingProgress(){
    var speed=200;
    var  percent = Math.random() * 1.8;
    var  timer = setTimeout(function () {
       progressBar.update(percent);
       speed = Math.floor(Math.random() * 900);
        if(progressBar.config.percent<=100)paintingProgress();
    }, speed);
}


//拓扑窗口缩放

$(window).resize(function() {    //窗口改变大小进行刷新
    var h = $(window).height();
    var w = $(window).width();
    $("body").css({
        height:h+"px",
        width:w+"px"
    });
});

$(function(){
    var h = $(window).height();
    var w = $(window).width();
    var hh = h/1000-0.2;
    var ww = w/1600-0.5;
    $("body").css({
        height:h+"px",
        width:w+"px"
    });
    $(".stageEffect").css({
        //transform: 'rotateY(0deg) rotateX(60deg) rotateZ(0deg) scale3d('+ww+','+hh+','+ww+')'
        /*-webkit-transform: 'rotateY(0deg) rotateX(60deg) rotateZ(0deg) scale3d(0.7,0.7,0.7)',
        -moz-transform: 'rotateY(0deg) rotateX(60deg) rotateZ(0deg) scale3d(0.7,0.7,0.7)',
        -o-transform: 'rotateY(0deg) rotateX(60deg) rotateZ(0deg) scale3d(0.7,0.7,0.7)',
        -ms-transform: 'rotateY(0deg) rotateX(60deg) rotateZ(0deg) scale3d(0.7,0.7,0.7)'*/
    });
});
