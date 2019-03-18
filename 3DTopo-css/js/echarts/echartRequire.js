/**
 * Created by logmei on 2017/3/23.
 */
var _myChart=null;
var pie_echartRequire={//饼图
    option : {
        tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:[]//颜色代表的内容
        },
        series: [
            {
                name:'',//标题
                type:'pie',
                selectedMode: 'single',
                radius: ['30%', '50%'],
                avoidLabelOverlap: false,
                labelLine:{
                    normal:{
                        length:3,
                        length2:8
                    }
                },
                data:[]
            }
        ],
        color:['#F3C246', '#CAE5E8','#6EC3C9','#00A6AD','#008489']
    },
    myChart:null,
    initSetting:function(config){//config:{seriesData:[],legendData:[],myChart:null,title:""}
       this.option.series[0].data=config.seriesData;
       this.option.legend.data=config.legendData;
        this.myChart=config.myChart;
       // this.option.title.text=config.title;
    },
    render:function(){
        var _myChart=echarts.init( this.myChart);
        _myChart.setOption(this.option);
    }
}

//折线图
var line_echartRequire={
    data:[],//数据
    now:+new Date(1997, 9, 3),//当前时间
    oneDay:24 * 3600 * 1000,
    myChart:null,
    _myChart:null,
    config:null,
    option : {
        grid: {
            show:true,//
            borderWidth:'0.5',//边框宽度
            borderColor:'#D9EAF4'//边框颜色
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                params = params[0];
                var date = new Date(params.name);
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
            },
            axisPointer: {
                animation: false
            }
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
        series: [{
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data:this.data,
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
    },
    initSetting:function(config){//config:{myChart:null,areaColor:{offset0:'#117DBB',offset1:'#117DBB'}}
        this.config=config;
        this.myChart=config.myChart;
        _myChart=echarts.init( this.myChart);
      // this._myChart=echarts.init( this.myChart);
        this.option.series[0].areaStyle.normal.color=new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color:  line_echartRequire.config.areaColor.low.offset0 }, {offset: 1, color:  line_echartRequire.config.areaColor.low.offset1  }], false);
        this.option.series[0].lineStyle.normal.color=config.lineColor;
        //初始化60秒数据
       // var value=Math.random()*(40-30+1)+30;
        for (var i = 0; i < 60; i++) {
            this.data.push(this.randomData(true));
        }
        this.option.series[0].data=this.data;
    },
    randomData:function randomData(init) {
        this.now = new Date(+this.now + this.oneDay);
        //var  value =  Math.random() * 100;
        var value=Math.random()*(40-30+1)+30
        value=init?0:value;
        return {
            name: this.now.toString(),
            value: [
                [this.now.getFullYear(), this.now.getMonth() + 1, this.now.getDate()].join('/'),
                Math.round(value)
            ]
        }
    },
    render:function(){
        _myChart.setOption(this.option);
        setInterval(function () {
            // for (var i = 0; i < 5; i++) {
            line_echartRequire.data.shift();
            var data=line_echartRequire.randomData();
            if(data.value[1]<=50){
                line_echartRequire.option.series[0].areaStyle.normal.color=new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: line_echartRequire.config.areaColor.low.offset0 }, {offset: 1, color:line_echartRequire.config.areaColor.low.offset1  }], false);
            }
            if(data.value[1]>50&&data.value[1]<=70){
               // _myChart=echarts.init( line_echartRequire.myChart);
                line_echartRequire.option.series[0].areaStyle.normal.color=new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color:line_echartRequire.config.areaColor.middle.offset0  }, {offset: 1, color:line_echartRequire.config.areaColor.middle.offset1  }], false);
            }
            if(data.value[1]>70){
                line_echartRequire.option.series[0].areaStyle.normal.color=new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: line_echartRequire.config.areaColor.high.offset0 }, {offset: 1, color: line_echartRequire.config.areaColor.high.offset1  }], false);
            }
            //var v=line_echartRequire.randomData();
            line_echartRequire.data.push(data);
            line_echartRequire.config.tip.find("._line_M").find(".performTitle>span").eq(1).text(data.value[1]+"%");
            //}
            //this.option.series[0].data=line_echartRequire.data;
            _myChart.setOption({
                series: [{
                    data: line_echartRequire.data,
                    areaStyle:{
                        normal:{
                            color:  line_echartRequire.option.series[0].areaStyle.normal.color
                        }
                    }
                }]
            });
        }, 2000);
    }
}
