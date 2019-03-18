/**
 * Created by logmei on 2017/6/14.
 */
var SnmpManager_Util={
    id_of_setintervalList:[],//进程列表
    tip:{
      left:20,
      top:300
    },
    snmpInfoMap : {},
    Init : function(){
        this.snmpInfoMap=new Map();
        this.snmpInfoMap.put("cpu",[]);
        this.snmpInfoMap.put("memory",[]);
        this.snmpInfoMap.put("interface",[]);
    },
    PushValue : function(type,value){//赋值
        if(this.snmpInfoMap.get(type)!=undefined){
            var list=this.snmpInfoMap.get(type);
            this.snmpInfoMap.put(type,this.SortListValues(list));
        }else{
            this.snmpInfoMap.put(type,[value]);
        }
    },
    ShowTip:function(type){
        var w=getNumV($(".alarmContent").css("width"))+52;
        this.InitTipPosition();
        $(".showSnmpRanking").fadeOut(400);
        $(".showAlarmInfo").animate({
            opacity:1,
            width: w+"px"
        }, 1000 );
        $(".alarmLeft").delay(1000).fadeIn(400);

        /*for(var i=0;i< this.snmpInfoMap.elements.length;i++){
            this.ShowRanking(this.snmpInfoMap.elements[i].key);
        }*/

        //tipDiv.show("slow");
       /* setInterval(function () {
          var list=this.snmpInfoMap.get(type);
          for(var i=0;i<list.length;i++){
              tipDiv.append("<div><span>"+list[i].ip+"</span><span>"+list[i].value+"</span></div>")
          }

        }, 2000);*/
    },
    CloseTip:function(){
        $(".alarmLeft").hide('fast');
        $(".showSnmpRanking").delay(1000).fadeIn(400);
        $(".showAlarmInfo").animate({
            opacity:0,
            width: "0px"
        }, 1000 );

    },
    InitTipPosition:function(){
        var showSnmpRanking_h=getNumV($(".showSnmpRanking").css("height"));
        var showSnmpRanking_top=getNumV($(".showSnmpRanking").css("top"));
        var alarmContent_h=getNumV($(".alarmContent").css("height"))+20;
        var top=showSnmpRanking_top-(alarmContent_h-showSnmpRanking_h)/2;
        $(".showAlarmInfo").css("top",top+"px");
        $(".alarmLeft").css("margin-top",((alarmContent_h-showSnmpRanking_h)/2-20)+"px");
    },
    ShowRanking:function(type){
        var tipDiv=$("<div style='width:200px;height:300px;border:1px solid;float:left;' id='snmp_Tip_"+type+"'></div>");
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")
        tipDiv.append("<div><span>10.99.1.2</span><span>4</span></div>")

        $(".showSnmpRanking").append(tipDiv);
    },
    SortListValues : function(list){//为列表排序
        list.sort(function(s,t){
            return s.value- t.value;
        });
        return list;
    }

}

