/**
 * Created by logmei on 2017/3/29.
 */
var progressBar={
    config:{
        $progress :null,
        $bar: null,
        $text : null,
        speed :200,
        orange :30,
        yellow :55,
        green :85,
        percent : 0,
        timer:0
        },
    initSetting:function(config){
        this.config.percent=0;
        this.config.$progress=config.$progress;
        this.config.$bar=config.$bar;
        this.config.$text=config.$text;
    },
    update : function (percent) {//更新进度
            this.config.percent = percent;
            this.config.percent = parseFloat(this.config.percent.toFixed(1));
            this.config.$text.find('em').text(this.config.percent + '%');
            if (this.config.percent >= 100) {
                this.config.percent = 100;
                this.config. $progress.addClass('progress--complete');
                this.config.$bar.addClass('progress__bar--blue');
                this.config.$text.find('em').text('Complete');
            } else {
                 if (this.config.percent >= this.config.green) {
                    this.config.$bar.addClass('progress__bar--green');
                } else if (this.config.percent >= this.config.yellow) {
                    this.config.$bar.addClass('progress__bar--yellow');
                } else if (this.config.percent >= this.config.orange) {
                    this.config.$bar.addClass('progress__bar--orange');
                }
            }
            this.config. $bar.css({ width: this.config.percent + '%' });
    },
    resetColors:function () {
        this.config.$bar.removeClass('progress__bar--green').removeClass('progress__bar--yellow').removeClass('progress__bar--orange').removeClass('progress__bar--blue');
        this.config.$progress.removeClass('progress--complete');
    }
}
