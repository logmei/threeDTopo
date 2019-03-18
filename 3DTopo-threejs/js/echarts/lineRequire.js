/**
 * Created by logmei on 2017/3/28.
 *
 * 折线
 */

;!function(window, undefined){
    "use strict";

    var $, win, ready = {

    };

// 默认内置方法。
    var LineRequire = {
        v: '1.0'
    };



    /*
     定义对象：LineClass
     */
    var LineClass = function(paramConfig){
        var that = this;
         that.now=+new Date(1997, 9, 3);//当前时间
         that.oneDay=24 * 3600 * 1000;
         that.myChart=null;
         that._myChart=null;
         that.data=[];
         that.option={
            grid: {
                show:true,//
                    borderColor:'#D9EAF4',//边框颜色
                    left:0,
                    right:0,
                    top:0,
                    bottom:0,
                backgroundColor:'rgba(0,166,173,0.05)'

            },

            xAxis: {
                type: 'time',
                    splitLine: {
                    show: false,
                        lineStyle: {
                        // 使用深浅的间隔色
                        color: ['#D9EAF4']
                    }
                },
                axisLabel:{
                    show:false
                },
                axisLine:{
                    show:false
                },
                axisTick:{
                    show:false
                }
            },
            yAxis: {
                type: 'value',
                    boundaryGap: [0, '100%'],
                    max:100,
                    splitLine: {
                    show: false
                },
                axisLabel:{
                    show:false
                },
                axisLine:{
                    show:false
                },
                axisTick:{
                    show:false
                }
            },
            series: [{
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data:[],
                lineStyle:{
                    normal:{
                        color:'#1278b8',
                        width:1
                    }
                },
                areaStyle:{
                    normal:{
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#3db0f4' // 0% 处的颜色
                        }, {offset: 1, color: '#2e8fd7' // 100% 处的颜色#F1F6FA
                        }], false),
                        opacity:0.5
                    }
                }
            },
                {
                    type: 'line',
                    showSymbol: false,
                    hoverAnimation: false,
                    data:[],
                    lineStyle:{
                        normal:{
                            color:'#1278b8',
                            width:1
                        }
                    },
                    areaStyle:{
                        normal:{
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: '#3db0f4' // 0% 处的颜色
                            }, {offset: 1, color: '#2e8fd7' // 100% 处的颜色#F1F6FA
                            }], false),
                            opacity:0.5
                        }
                    }
                }]
        }

        that.reload(paramConfig);
    };

    LineClass.pt = LineClass.prototype;

    //默认配置
    LineClass.pt.config = {
        high:80,
        middle:50
    };
    //加载数据
    LineClass.pt.reload = function(paramConfig){
        this.paramConfig=paramConfig;
        this.myChart=paramConfig.myChart;
        this._myChart=echarts.init( this.myChart);
        // this._myChart=echarts.init( this.myChart);
        this.option.series[0].areaStyle.normal.color=new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color:  paramConfig.areaColor.low.offset0 }, {offset: 1, color: paramConfig.areaColor.low.offset1  }], false);
        this.option.series[0].lineStyle.normal.color=paramConfig.lineColor;
        this.option.grid.borderColor=paramConfig.lineColor;
        this.option.grid.backgroundColor=paramConfig.gridBackgroundColor;
        //初始化60秒数据
        for (var i = 0; i < 60; i++) {
            this.data.push(this.randomData(0,0,true));
        }
        this.option.series[0].data=this.data;
    }

    LineClass.pt.randomData=function randomData(max,min, init) {
        this.now = new Date(+this.now + this.oneDay);
         var  value =  Math.random()*(max-min)+min;
        value=init?0:value;
        return {
            name: this.now.toString(),
            value: [
                [this.now.getFullYear(), this.now.getMonth() + 1, this.now.getDate()].join('/'),
                Math.round(value)
            ]
        }
    }

    LineClass.pt.changeColor=function(data){
        if(data.value[1]<=this.config.middle){
            this.option.series[0].areaStyle.normal.color=new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: this.paramConfig.areaColor.low.offset0 }, {offset: 1, color:this.paramConfig.areaColor.low.offset1  }], false);
           // this.option.series[0].lineStyle.normal.color=this.paramConfig.lineColor;
        }
        if(data.value[1]>this.config.middle&&data.value[1]<=this.config.high){
            // _myChart=echarts.init( line_echartRequire.myChart);
            this.option.series[0].areaStyle.normal.color=new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color:this.paramConfig.areaColor.middle.offset0  }, {offset: 1, color:this.paramConfig.areaColor.middle.offset1  }], false);
           // this.option.series[0].lineStyle.normal.color='yellow';
        }
        if(data.value[1]>this.config.high){
            this.option.series[0].areaStyle.normal.color=new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: this.paramConfig.areaColor.high.offset0 }, {offset: 1, color: this.paramConfig.areaColor.high.offset1  }], false);
           // this.option.series[0].lineStyle.normal.color='red';
        }
    }

    LineClass.pt.render=function(){
        //console.log(JSON.stringify(this.option));
        this._myChart.setOption(this.option);

    }


    window.LineRequire=LineRequire;

// 主入口
    ready.init = function(){
        $ = jQuery;
        win = $(window);

        LineRequire.init = function(config){
            var lineRequire = new LineClass(config);
            lineRequire.render();
            return lineRequire;
        };
    };

    'function' === typeof define ? define(function(){
        ready.init();
        return LineRequire;
    }) : function(){
        ready.init();
    }();

}(window);
