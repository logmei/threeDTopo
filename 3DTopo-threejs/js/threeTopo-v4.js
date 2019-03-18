(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
            typeof define === 'function' && define.amd ? define(['exports'], factory) :
        (factory((global.THREE_TOPO = global.THREE_TOPO || {})));
}(this, (function (exports) { 'use strict';

    // Polyfills

    if ( Number.EPSILON === undefined ) {

        Number.EPSILON = Math.pow( 2, - 52 );

    }

    if ( Number.isInteger === undefined ) {

        // Missing in IE
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

        Number.isInteger = function ( value ) {

            return typeof value === 'number' && isFinite( value ) && Math.floor( value ) === value;

        };

    }

    //

    if ( Math.sign === undefined ) {

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

        Math.sign = function ( x ) {

            return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : + x;

        };

    }

    if ( Function.prototype.name === undefined ) {

        // Missing in IE
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

        Object.defineProperty( Function.prototype, 'name', {

            get: function () {

                return this.toString().match( /^\s*function\s*([^\(\s]*)/ )[ 1 ];

            }

        } );

    }

    if ( Object.assign === undefined ) {

        // Missing in IE
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

        ( function () {

            Object.assign = function ( target ) {

                'use strict';

                if ( target === undefined || target === null ) {

                    throw new TypeError( 'Cannot convert undefined or null to object' );

                }

                var output = Object( target );

                for ( var index = 1; index < arguments.length; index ++ ) {

                    var source = arguments[ index ];

                    if ( source !== undefined && source !== null ) {

                        for ( var nextKey in source ) {

                            if ( Object.prototype.hasOwnProperty.call( source, nextKey ) ) {

                                output[ nextKey ] = source[ nextKey ];

                            }

                        }

                    }

                }

                return output;

            };

        } )();

    }
    var container, stats;
    var objects = [],textlabels=[];
    var camera, scene, renderer,orbitControls;
    var raycaster = new THREE.Raycaster(),INTERSECTED;
    var mouse = new THREE.Vector2(), isShiftDown = false,isCtrlDown=false,isShiftAndCtrlDown=false;
    var circle;
    var mouseX = 0, mouseY = 0;
    var rollOverGeo,rollOverMesh, rollOverMaterial;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var SelectStatesObject=[];
    var loadFont=undefined;//加载字体对象
    var earthMesh,starfieldMesh;
    //初始化配置
    var params={
        version:3,
        renderer:{
            color:0x000000
        },
        //模型
        model:{
            scale:{x:10,y:10,z:10},
            visible:false,
            objType:[{type:'Cloud',value:['cloud_p1','cloud_p2']},{type:'Firewall',value:['Firewall']},{type:'Infered_switch',value:['Infered_switch']},{type:'Switch',value:['Switch']},{type:'Router',value:['Router']},{type:'host',value:['host']},{type:'Routing Switch',value:['Routing Switch']}],
            path:TopoAddr+"modules/",
            noType:'Infered_switch'
        },
        fontOptoins:{
            size : 0.3,
            height : 0.05,
            curveSegments : 12,
            font : "helvetiker",
            weight : "regular",
            bevelEnabled : false,
            bevelThickness : 1,
            bevelSize : 0.5,
            bevelSegments : 3,
            Hover: 0.5,//上移高度
            color:"#ffffff",
            path:TopoAddr+"fonts/"
        },
        //选中
        pointCircle:{
          visitedColor: 0x156289,//选中的颜色
          hoverColor:0xeddc46,//指向颜色
          positionDown:3,//位置下移
          rotationSpeed:0.1,
          outSideOpacitySpeed:0.001,//透明度
          outSideOpacity:0.2,
          outSideSmallSpeed:1,//变大的速度
          outSideSmall:16,
          outSideLarge:22,
          outSideOpacityDirection:'reduce'
        },
        //设备
        equipment:{
            transparent:false,
            opacity:0.5,
            multipleOfLayout:0.6,//节点位置的扩展倍数
            fontContVisible:true,//设备上的字体是否显示
            deviceTile:"deviceName"
        },
        //相机
        camera:{
            autoRotate:true,
            autoRotateSpeed:1,
            position:{
                x:0,y:270,z:800
            },
            target:{
                x:0,y:0,z:0
            }
        },
        earth:{
          rotateSpeed:0.02,
          moveSpeed:0.1,
          farPosition:{x:-200,y:-200,z:-200},
          nearPosition:{x:200,y:200,z:200},
          direction:{x:"add",y:"add",z:"add"},
          initPosition:{x:-50,y:100,z:-300},
          visible:true
        },
        //灯光
        light:{
            color:0xffffff,
            lightType:["DirectinalLight","SpotLight","PointLight"],
            pointLightPosition:[
                {x:0,y:200,z:0},
                {x:100,y:200,z:100},
                {x:-100,y:200,z:-100}
            ],
            spotLightPositions:[
                {x:0,y:300,z:0},
                {x:500,y:0,z:0},
                {x:-500,y:0,z:0},
                {x:0,y:-300,z:0}
            ],
            directinalLightPosition:{x:0,y:500,z:500}
        },

        //平面
        plane:{
            h:50,//平面之间的高度
            visible:true,
            color:0xffffff,
            width:650,//1928/1048
            height:1100,
            transparent:true,
            opacity:0.4,
            position:{
                x:0,y:0,z:0
            },
            rotationX:-0.5*Math.PI,
            modelType:['host','Router','Switch,Routing Switch,Infered_switch','Firewall','Cloud'],
            planeType:[
                {type:'host',index:0},
                {type:'Switch,Routing Switch,Infered_switch',index:1},
                {type:'Router',index:2},
                {type:'Firewall',index:3},
                {type:'Cloud',index:4}
            ],

            side:THREE.DoubleSide
        },
        //线 用gui的配置
        line:{
            extrusionSegments: 20,
            radiusSegments: 30,
            closed: false,
            radius:0.5,
            color:0x156289,
            wire:{
                transparent:true,
                color:[255,255,255,0.5],
                wireframe:true
            }
        },
        //接口塞
        interPlug:{
            visible:false,
            spereGeometry:{
                radius:0.3,
                segmentsWidth:32,
                segmentsHeight:32,
                color:0x156289
            }
        },
        axesVisible:false
    };
    //线材质
    var _lineMaterial={
        getMaterial : function(){
            return new THREE.MeshPhongMaterial( {name:"_lineMaterial",color: params.line.color,
                emissive: 0x072534,
                side: THREE.DoubleSide,
                shading: THREE.FlatShading  } )
        },
        getWireframeMaterial : function(){
            var color="rgb("+params.line.wire.color[0]+","+params.line.wire.color[1]+","+params.line.wire.color[2]+")";
            var alpha=params.line.wire.color[3];
            new THREE.MeshBasicMaterial( {name:"_wireframeMaterial",color: color,
                transparent: params.line.wire.transparent,
                opacity: alpha, wireframe: params.line.wire.wireframe} )
        }
    }

    var linematerial = new THREE.MeshPhongMaterial( {color: 0x156289,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading  } );
    var wireframeMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff,
        transparent: true,
        opacity: 0.5, wireframe: true} );

    /**
     * 字体
     * @param options
     * @constructor
     */
    var FontMaterial = new THREE.MeshBasicMaterial( {
        color: 0x156289,
        side: THREE.DoubleSide
    } )



    //不被监控的对象name
    var FilterNoRaycasterObject=function(obj){
        var ret = true;
        var NoRaycasterObject=['scene','axes'];
        for(var i=0;i<NoRaycasterObject.length;i++){
            if(obj.name==NoRaycasterObject[i]){
                ret = false;
                break;
            }
        }
        return ret;
    }

    /**
     * topo
     * @param options
     * {parentId:
     *  width:
     *  height:
     *  onlyView
     *  }
     * @constructor
     */
    function TopoClass(options){
        this.that=this;
        this.parentId=options.parentId;
        this.Nodes=options.Nodes;
        this.Links=options.Links;
        this.onlyView=options.onlyView;
        this.cameraZ=options.cameraZ;
        this.centerX=options.centerX;
        this.centerZ=options.centerY;
        //params.camera.position.z=Math.ceil((1916*options.width)/800);
        params.camera.autoRotate=options.autoRotate;
        this.controls={
            autoRotate : params.camera.autoRotate,
            autoRotateSpeed : params.camera.autoRotateSpeed,
            planeVisible : params.plane.visible,
            planeColor : params.plane.color,
            planeTransparent : params.plane.transparent,
            planeOpacity : params.plane.opacity,
            planeHigh : params.plane.h,
            plane1Type :params.plane.planeType[0].type,
            plane2Type :params.plane.planeType[1].type,
            plane3Type :params.plane.planeType[2].type,
            plane4Type :params.plane.planeType[3].type,
            plane5Type :params.plane.planeType[4].type,
            //线的设置
            lineMaterialColor : params.line.color,
            wireVisible : params.line.wire.transparent,
            wireLineColor : params.line.wire.color,
            //模型
            modelVisible : params.model.visible,
            planeHeight : params.plane.h,
            //设备上的字体是否显示
            deviceContVisible : params.equipment.fontContVisible,
            deviceTitle: params.equipment.deviceTile,
            TitleColor:params.fontOptoins.color,
            //layer调整
            layerChange:0,

            //光照选择
            light:params.light.lightType[0],
            backgroundVisible:params.earth.visible,
            //坐标轴
            AxesVisible:params.axesVisible,
            //查看状态
            visitedColor:params.pointCircle.visitedColor,
            hoverColor:params.pointCircle.hoverColor,
            //摄像机的位置
            cameraX:params.camera.position.x,
            cameraY:params.camera.position.y,
            cameraZ:params.camera.position.z


        }

    }
    Object.assign(TopoClass.prototype,{
        Init : function() {
            var that=this;
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;
            container = document.createElement('div');
            document.getElementById(this.parentId).appendChild(container);
            scene = new THREE.Scene();
            raycaster=new THREE.Raycaster();
            //camera
            this.InitCamera();
            //加载平面
            this.InitPlane("plane");
            //加载灯光
            this.InitLights();
            this.PointingEarth();
            this.PointingStarfield();
          /*  this.LoadObj(onProgress,onError,function(){
                this.PaintingNodes(function(){
                    this.PaintingLinks();
                    if(this.controls.deviceContVisible){
                        var that=this;
                        this.PaintingDeviceCont(this.controls.deviceTitle,that);
                    }
                },this);
            },this);
*/
            //渲染
            renderer = new THREE.WebGLRenderer();
            renderer.setClearColor(params.renderer.color, 1);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
           // renderer.shadowMap.enabled = true;
            container.appendChild(renderer.domElement);
            this.LoadSelectState();//加载选中状态
            if(!this.onlyView){
                // stats
                stats = new Stats();
                container.appendChild(stats.dom);

                renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
                renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
                //工具栏
                this.InitGUI();
            }
            document.addEventListener( 'keydown', onDocumentKeyDown, false );
            document.addEventListener( 'keyup', onDocumentKeyUp, false );
            //旋转
             orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
            orbitControls.autoRotate=params.camera.autoRotate;
            orbitControls.autoRotateSpeed=params.camera.autoRotateSpeed;
            var clock = new THREE.Clock();

            new THREE.TrackballControls(camera, renderer.domElement);


            //改变窗口大小
            //document.addEventListener( 'mousemove', onDocumentMouseMove, false );

            window.addEventListener('resize', onWindowResize, false);

            animate();

            function animate() {

                requestAnimationFrame(animate);
                render(that);
                if(!that.onlyView) {
                    stats.update();
                }
            }

            function onDocumentMouseMove(event){
                event.preventDefault();

                mouse.x=(event.clientX/window.innerWidth)*2-1;
                mouse.y=-(event.clientY/window.innerHeight)*2+1;
            }
            function onDocumentMouseDown( event ) {

                event.preventDefault();

                mouse.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

                raycaster.setFromCamera( mouse, camera );


                    var intersects = raycaster.intersectObjects(  scene.children,true );

                    if ( intersects.length > 0 && FilterNoRaycasterObject(intersects[ 0 ].object) && intersects[ 0 ].object.parent!=undefined) {
                        var intersect = intersects[ 0 ].object.parent
                        if(intersect.name!=null&&intersect.name.indexOf("Node_")==-1)intersect = intersects[ 0 ].object.parent.parent;
                        if(intersect!=null&&intersect.name!=null&&intersect.name.indexOf("Node_")!=-1) {
                            var deviceId=intersect.name.split("Node_")[1];
                            if(isCtrlDown){//按住ctrl键进行选择
                                if(scene.getObjectByProperty("deviceId","selectState_Node_"+deviceId)!=undefined)topo.removeCheckedIdentify(deviceId);
                                else topo.paintingCheckedIdentify(deviceId);
                            }else{//查看报告
                                reportOfDevice.showTip(deviceId);
                                if(scene.getObjectByProperty('deviceId',"selectState_Node_"+intersect.name)==undefined) topo.paintingCheckedIdentify(deviceId);
                            }
                        }
                        render();

                    }



            }


            function onDocumentKeyDown( event ) {

                switch( event.keyCode ) {

                    case 16: isShiftDown = true; break;
                    case 17:isCtrlDown =true;break;
                }

            }

            function onDocumentKeyUp( event ) {

                switch ( event.keyCode ) {

                    case 16: isShiftDown = false; break;
                    case 17:isCtrlDown=false;break;
                }

            }
            var step=0;
            function render() {

                //        camera.position.x += ( mouseX - camera.position.x ) * .05;
                //        camera.position.y += ( - mouseY - camera.position.y ) * .05;
                var delta = clock.getDelta();
                orbitControls.update(delta);
                orbitControls.autoRotate= that.controls.autoRotate;
                orbitControls.autoRotateSpeed= that.controls.autoRotateSpeed;
                camera.lookAt(scene.position);

                camera.updateMatrixWorld();

                scene.traverse(function(e){
                    //选中状态
                    if( e.name=="selectState"){
                        e.DynamicRotate()
                    }
                });
                raycaster.setFromCamera(mouse,camera);
                var intersects = raycaster.intersectObjects( scene.children,true);
                if(!isCtrlDown) {//按住ctrl键只进行选择
                    if (intersects.length > 0 && FilterNoRaycasterObject(intersects[ 0 ].object) && intersects[ 0 ].object.parent != undefined) {
                        if (INTERSECTED != intersects[ 0 ].object.parent.parent && intersects[ 0 ].object.parent.parent != null) {
                            INTERSECTED = intersects[0].object.parent.parent;
                            if (INTERSECTED.name != null && INTERSECTED.name.indexOf("Node_") != -1) {
                                circle.visible = true;
                                circle.position.x = INTERSECTED.position.x;
                                circle.position.y = INTERSECTED.position.y - params.pointCircle.positionDown;
                                circle.position.z = INTERSECTED.position.z;
                            }

                            //  console.log("hitting something" + INTERSECTED.name);
                        }

                    } else {
                        circle.visible = false;
                        INTERSECTED = null
                    }
                }

                /**
                 * 地球运动
                 */
                if(that.controls.backgroundVisible)that.RotateEarth();

                renderer.render(scene, camera);

            }


            /**
             * 改变窗口大小
             */
            function onWindowResize() {

                this.windowHalfX = window.innerWidth / 2;
                this.windowHalfY = window.innerHeight / 2;

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }


        },
        InitCamera:function(){
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
            camera.name="camera";
            camera.position.z = this.cameraZ;
            camera.position.y = params.camera.position.y;

         /*  var cameraPerspectiveHelper = new THREE.CameraHelper( camera );
            scene.add( cameraPerspectiveHelper );

            var SCREEN_WIDTH = window.innerWidth;
            var SCREEN_HEIGHT = window.innerHeight;
            var aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
            var frustumSize = 600;
            var cameraOrtho = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );

           var cameraOrthoHelper = new THREE.CameraHelper( cameraOrtho );
            scene.add( cameraOrthoHelper );*/

        },
        reSetCameraPosition: function(){
            camera.position.z=this.cameraZ;
        },
        CreateAxes : function(){
            var axes=new THREE.AxisHelper(100);
            axes.position.y=0.1;
            axes.name="axes"
            scene.add(axes);
        },
        ClearDevice:function(){//清除设备
            var NewChild=[];
            for(var i=0;i<scene.children.length;i++){
                if( scene.children[i].name.indexOf("Node_")==-1&&scene.children[i].name.indexOf("Line-")==-1&&scene.children[i].deviceId==undefined){
                    NewChild.push(scene.children[i]);
                    //scene.children.splice(i,1);
                }
            }

            scene.children=NewChild;
            scene.getObjectByName("selectState").visible=false;
            NewChild=[];
        },
        FocusOnEquiment:function(){
            var pos=scene.getObjectByName("Node_r10000000000").position;
          camera.lookAt(pos);
          camera.position.x=pos.x;
          camera.position.y=pos.y+100;
          camera.position.z=pos.z+100;
            orbitControls.target=pos.clone();

        },
        ClearLinks:function(){//清除设备
            var NewChild=[];
            for(var i=0;i<scene.children.length;i++){
                if(scene.children[i].name.indexOf("Line-")==-1){
                    NewChild.push(scene.children[i]);
                    //scene.children.splice(i,1);
                }
            }

            scene.children=NewChild;
            NewChild=[];
        },
        //加载选中状态
        LoadSelectState:function(){
            //选中注释
            circle = new SelectStatesClass();
            circle.position.y = 5;
            circle.name="selectState";
            circle.rotation.x=params.plane.rotationX;
            circle.visible=false;
            scene.add( circle );

            var arcShape = new THREE.Shape();
            //arcShape.moveTo( 50, 10 );
            arcShape.absarc( 0, 0, params.pointCircle.outSideLarge, 0, Math.PI * 2, false );

            var holePath = new THREE.Path();
            // holePath.moveTo( 10, 10 );
            holePath.absarc( 0, 0, params.pointCircle.outSideSmall, 0, Math.PI * 2, true );
            arcShape.holes.push( holePath );
            arcShape.name="outSide";
            var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
            addShape( arcShape,         extrudeSettings,  { color: this.controls.hoverColor, side: THREE.DoubleSide,transparent:true,opacity:params.pointCircle.outSideOpacity },  0,    0, 0, 0, 0, 0, 1 );

            var arcShape1 = new THREE.Shape();
            //arcShape.moveTo( 50, 10 );
            arcShape1.absarc( 0, 0, 18, 0,Math.PI * 2 , false );

            var holePath1 = new THREE.Path();
            // holePath.moveTo( 10, 10 );
            holePath1.absarc( 0, 0, 17,  0, Math.PI * 2, true );
            arcShape1.holes.push( holePath1 );
            arcShape1.name="midSide";
            addShape( arcShape1,         extrudeSettings,  { color: this.controls.hoverColor, side: THREE.DoubleSide,transparent:false },  0,    0, 0, 0, 0, 0, 1 );

            var arcShape2 = new THREE.Shape();
            //arcShape.moveTo( 50, 10 );
            arcShape2.absarc( 0, 0, 14,0, Math.PI, false );

            var holePath2 = new THREE.Path();
            // holePath.moveTo( 10, 10 );
            holePath2.absarc( 0, 0, 12, 0, Math.PI, false );
            arcShape2.holes.push( holePath2 );
            arcShape2.name="innerSide";
            addShape( arcShape2,         extrudeSettings, { color: this.controls.hoverColor, side: THREE.DoubleSide,transparent:true,opacity:0.4 },  0,    0, 0,0, 0, 0, 1 );



            function addShape( shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ) {

                // flat shape with texture
                // note: default UVs generated by ShapeBufferGemoetry are simply the x- and y-coordinates of the vertices

                //var geometry = new THREE.ShapeBufferGeometry( shape );

                // flat shape

                var geometry = new THREE.ShapeBufferGeometry( shape );

                var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial(color ) );
                mesh.position.set( x, y, z );
                mesh.rotation.set( rx, ry, rz );
                mesh.scale.set( s, s, s );
                if(shape.name!=undefined)mesh.name=shape.name;
                circle.add( mesh );

                // extruded shape

                /*  var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

                 var mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: color } ) );
                 mesh.position.set( x, y, z);
                 mesh.rotation.set( rx, ry, rz );
                 mesh.scale.set( s, s, s );
                 circle.add( mesh );*/


            }
        },
    InitGUI:function(){
        var gui=new dat.GUI({ width: 300 } );
        gui.add(this.controls,'autoRotate');
        gui.add(this.controls,'autoRotateSpeed',0,2);
        gui.add(this.controls,'backgroundVisible').onChange(function(value){
            if(value&&earthMesh!=undefined){
                earthMesh.visible=true;
                starfieldMesh.visible=true;
            }
            if(value&&earthMesh==undefined){
                that.PointingEarth();
                that.PointingStarfield();
            }

            if(!value&&earthMesh!=undefined){
                earthMesh.visible=false;
                starfieldMesh.visible=false;
            }

        });
        gui.add(this.controls,'planeHeight',params.plane.h-10,70).step(1).onChange(function(value){
            that.ClearLinks();
            that.MoveNodes(that.PaintingLinks(),that);

        });
        gui.add(this.controls,'light',{SunLight:params.light.lightType[0],SpotLight:params.light.lightType[1],PointLight:params.light.lightType[2]}).onChange(function(){
           that.ChooseLight();
        });
        gui.add(this.controls,'AxesVisible').onChange(function(value){
            if(value){
                if(scene.getObjectByName("axes")!=undefined){
                    scene.getObjectByName("axes").visible=true;
                }else{
                    that.CreateAxes();
                }
            }else{
                scene.getObjectByName("axes").visible=false;
            }
        });
        var that=this;
        var equiment=gui.addFolder('equiment');
        equiment.add(this.controls,'deviceContVisible').onChange(function(value){
            if(value){
                that.PaintingDeviceCont(that.controls.deviceTitle,that);
            }else{
                that.RemoveDeviceCont(that.controls.deviceTitle);
            }
        })
        equiment.add(this.controls,'deviceTitle',{deviceName:'deviceName',IP:'mgmtIp'}).onChange(function(value){
            that.PaintingDeviceCont(value,that);
        });
        equiment.addColor(this.controls,'TitleColor').onChange(function(value){
            that.PaintingDeviceCont(that.controls.deviceTitle,that);
        });
        var lastchangeVal=0;
        equiment.add(this.controls,'layerChange',-1,1).step(1).onChange(function(value){
            that.ClearLinks();
            that.PaintingLinks()
            if((value==1||value==0||value==-1)&&lastchangeVal!=value){
                for(var i=0;i<checkArr.length;i++){
                    var obj= scene.getObjectByName("Node_"+checkArr[i]);
                    var checkObj=scene.getObjectByProperty("deviceId","selectState_Node_"+checkArr[i]);
                    if(value>0) {
                        obj.position.y+=that.controls.planeHeight;
                        checkObj.position.y+=that.controls.planeHeight;
                    }
                    if(value==0&&value>lastchangeVal){
                        obj.position.y+=that.controls.planeHeight;
                        checkObj.position.y+=that.controls.planeHeight;
                    }
                    if(value==0&&value<lastchangeVal){
                        obj.position.y-=that.controls.planeHeight;
                        checkObj.position.y-=that.controls.planeHeight;
                    }
                    if(value<0){
                        obj.position.y-=that.controls.planeHeight;
                        checkObj.position.y-=that.controls.planeHeight;
                    }
                }
            }
            lastchangeVal=value
        });

        var selectStates=gui.addFolder('select-States');
        selectStates.addColor(this.controls,'hoverColor').onChange(function(value){
            var children=scene.getObjectByName("selectState").children;
            for(var i=0;i<children.length;i++){
                children[i].material.color=new THREE.Color( value);
            }
        });
        selectStates.addColor(this.controls,'visitedColor').onChange(function(value){
            for(var i=0;i<scene.children.length;i++){
                if(scene.children[i].isSelectStates!=undefined&&scene.children[i].deviceId!=undefined){
                    var state=scene.children[i].children;
                    for(var j=0;j<state.length;j++){
                        state[j].material.color=new THREE.Color( value);
                    }
                }
            }
        })
        var cameraFolder=gui.addFolder("camera");
        cameraFolder.add(this.controls,'cameraX',0,1000).step(1).onChange(function(value){
            camera.position.x=value;
        })
        cameraFolder.add(this.controls,'cameraZ',0,1000).step(1).onChange(function(value){
            camera.position.z=value;
        })
        cameraFolder.add(this.controls,'cameraY',0,1000).step(1).onChange(function(value){
            camera.position.y=value;
        })


        //平面
       /* var plane=gui.addFolder('plane');
        plane.add(this.controls,'planeVisible');
        plane.addColor(this.controls,'planeColor');
        plane.add(this.controls,'planeTransparent').onChange( function( value ) {
            var plane=scene.getObjectByName("plane");
            plane.material.transparent=value;
        } );;
        plane.add(this.controls,'planeOpacity',0,1).onChange( function( value ) {
            var plane=scene.getObjectByName("plane");
            plane.material.opacity=value;
        } );
       var planesGroup=plane.addFolder('group');
        planesGroup.add(this.controls,'planeHigh',10,50).step(1);
        planesGroup.add(this.controls,'plane1Type');
        planesGroup.add(this.controls,'plane2Type');
        planesGroup.add(this.controls,'plane3Type');
        planesGroup.add(this.controls,'plane4Type');
        planesGroup.add(this.controls,'plane5Type');
        //连线
        var line=gui.addFolder("line");
        line.addColor(this.controls,'lineMaterialColor');
        line.add(this.controls,'wireVisible');
        line.addColor(this.controls,'wireLineColor');*/

        //模型
       var model=gui.addFolder("model");
        model.add(this.controls,"modelVisible").onChange(function(value){
            for(var i=0;i<params.model.objType.length;i++){
                var m=scene.getObjectByName("Model_"+params.model.objType[i].type);
                m.visible=value;
            }
        });

    },
        /**
         * 画所有节点
         * @constructor
         */
       PaintingNodes : function(callback,callbackObject){
        //画节点
        for(var i=0;i<this.Nodes.length;i++){
            var node=this.Nodes[i];
            //根据分层来画点
            for(var j=0;j<params.plane.planeType.length;j++){
                var layer=params.plane.planeType[j];
                var type=","+layer.type+",";
                if(type.indexOf(","+node.deviceType+",")!=-1){
                    this.PaintingNode(layer.index,node);
                }
            }
        }
           if(typeof callback ==="function")callback.apply(callbackObject)
     },
    MoveNodes : function(callback,callbackObject){
        //画节点
        for(var i=0;i<this.Nodes.length;i++){
            var node=this.Nodes[i];
            //根据分层来画点
            for(var j=0;j<params.plane.planeType.length;j++){
                var layer=params.plane.planeType[j];
                var type=","+layer.type+",";
                if(type.indexOf(","+node.deviceType+",")!=-1){
                    var positionY=layer.index*callbackObject.controls.planeHeight;
                    var Node=scene.getObjectByName("Node_"+node.deviceId);
                    if(Node!=undefined)Node.position.y=positionY;
                }
            }
        }
        if(typeof callback ==="function")callback.apply(callbackObject)
    },
        /**
         * 画所有连线
         */
    PaintingLinks:function(){
        for(var i=0;i<this.Links.length;i++){
            var link=this.Links[i];
            var lineId="Line-"+link.deviceId+"-"+link.nbDeviceId;
            this.PaintingLink(link.deviceId,link.nbDeviceId,lineId);
        }
    },
        /**
         * 画节点
         * @param layerIndex
         * @param node
         * @constructor
         */
        PaintingNode : function(layerIndex,node){
          var positionY=layerIndex*params.plane.h;
          var model=scene.getObjectByName("Model_"+node.deviceType);
            if(model==undefined)model=scene.getObjectByName("Model_"+params.model.noType)
            if(model!=undefined){
                var object=model.clone();
                object.visible=true;
                object.position.x=node.tuoPuX-this.centerX;
                object.position.y=positionY;
                object.position.z=node.tuoPuY-this.centerZ;
                object.name="Node_"+node.deviceId;
                //objects.push(object);
                reportMap.put(node.deviceId,node);
                scene.add(object);
            }

        },

        /**
         * 显示立体字体
         * @param mesh
         * @param fontText
         * @param group
         * @constructor
         */
        PaintingDeviceCont: function (deviceTitle,that) {
            var i=0;
           createNodeText();
            var group;
            function createNodeText(){
               if(i<reportMap.elements.length){
                   var node=reportMap.elements[i].value;
                   var fontText=node[deviceTitle];
                   group=scene.getObjectByName("Node_"+node.deviceId);
                   if(group!=undefined&&!isDeviceContVisible(group,node)){
                       if(loadFont==undefined){
                           var loader = new THREE.FontLoader();
                           loader.load( params.fontOptoins.path + params.fontOptoins.font + '_' + params.fontOptoins.weight + '.typeface.json', function ( font ) {
                               loadFont=font;
                               Create2DText(fontText);
                               i++;
                               createNodeText();

                           } );
                       }else{
                           Create2DText(fontText);
                           i++;
                           createNodeText();

                       }
                   }else{
                       i++;
                       createNodeText();
                   }

               }
            }

            /**
             * 创建2D文字
             * @param text
             * @param group
             * @constructor
             */
              function Create2DText(text){
                var textOptions={text:text,color:that.controls.TitleColor}
                var dynamicText2d = new THREEx.DynamicText2DObject(textOptions);
                dynamicText2d.position.z=0.2;
                dynamicText2d.position.y=0.6;
                dynamicText2d.name="deviceCont"
                group.add(dynamicText2d)
                dynamicText2d.dynamicTexture.texture.anisotropy = renderer.getMaxAnisotropy();
            }
            /**
             * 创建立体字体
             * @param fontText
             */
            function create3DText(fontText){
                var geometry = new THREE.TextGeometry( fontText, {
                    font: loadFont,
                    size: params.fontOptoins.size,
                    height: params.fontOptoins.height,
                    curveSegments: params.fontOptoins.curveSegments,
                    bevelEnabled: params.fontOptoins.bevelEnabled,
                    bevelThickness: params.fontOptoins.bevelThickness,
                    bevelSize: params.fontOptoins.bevelSize,
                    bevelSegments: params.fontOptoins.bevelSegments
                } );
                geometry.center();
                var mesh = new THREE.Mesh(
                    geometry,FontMaterial
                )
                mesh.name="deviceCont";
                mesh.position.y=params.fontOptoins.Hover;
                //updateGroupGeometry( mesh, geometry );
                group.add(mesh);
            }

            /**
             * 判断设备内容是否已存在
             */
            function isDeviceContVisible(group,node){
                var cont=group.getObjectByName("deviceCont");
                if(cont==undefined)return false;
                else{
                    var fontText=node[deviceTitle];
                    if(deviceTitle=="mgmtIp"){
                        fontText = (fontText==undefined||fontText=="")?node["deviceName"]:fontText;
                    }

                    cont.parameters.text=fontText==undefined?"":fontText;
                    cont.parameters.fillStyle=that.controls.TitleColor;
                    cont.dynamicTexture.clearTextCooked();
                    cont.dynamicTexture.drawTextCooked(cont.parameters);
                    cont.visible=true;
                    return true;
                }
            }

        },
        _createTextLabel: function() {
            var div = document.createElement('div');
            div.className = 'text-label';
            div.style.position = 'absolute';
            div.style.width = 100;
            div.style.height = 100;
            div.innerHTML = "hi there!";
            div.style.top = -1000;
            div.style.left = -1000;
            div.style.color="#ffffff"

            var _this = this;

            return {
                element: div,
                parent: false,
                position: new THREE.Vector3(0,0,0),
                setHTML: function(html) {
                    this.element.innerHTML = html;
                },
                setParent: function(threejsobj) {
                    this.parent = threejsobj;
                },
                updatePosition: function() {
                    if(parent) {
                        this.position.copy(this.parent.position);
                    }

                    var coords2d = this.get2DCoords(this.position, camera);
                    this.element.style.left = coords2d.x + 'px';
                    this.element.style.top = coords2d.y + 'px';
                },
                get2DCoords: function(position, camera) {
                    var vector = position.project(camera);
                    vector.x = (vector.x + 1)/2 * window.innerWidth;
                    vector.y = -(vector.y - 1)/2 * window.innerHeight;
                    return vector;
                }
            };
        },

        /**
         * 不显示立体字体
         * @constructor
         */
        RemoveDeviceCont :function(){
            for(var i=0;i<reportMap.elements.length;i++){
                var node=reportMap.elements[i].value;
                var fontText=node.deviceId;
                var group=scene.getObjectByName("Node_"+node.deviceId);
                group.getObjectByName("deviceCont").visible=false;
            }
        },

        /**
         * 画连线
         * @param startNode
         * @param endNode
         * @param lineId
         * @constructor
         */
        PaintingLink:function(startNode,endNode,lineId){
           var node=new Array();
            var node1=scene.getObjectByName("Node_"+startNode);
            var node2=scene.getObjectByName("Node_"+endNode);
            if(node1!=undefined&&node2!=undefined){
                node[0]=node1.position;
                node[1]=node2.position;
                this.AddTube(node,lineId);
            }

        },
        //画选中标志   原topo中的方法  暂时不用
       paintingCheckedIdentify:function(deviceId){
           var state=scene.getObjectByProperty("deviceId","selectState_Node_"+deviceId);
           if(state!=undefined){
               if(!state.visible)state.visible=true;
               state.position.y+=params.pointCircle.positionDown;
               return;
           }
           var selected = scene.getObjectByName("selectState").clone();
           selected.children[0].material.color=new THREE.Color( this.controls.visitedColor );
           selected.children[1].material.color=new THREE.Color( this.controls.visitedColor  );
           selected.children[2].material.color=new THREE.Color( this.controls.visitedColor  );
           selected.deviceId="selectState_Node_"+deviceId
           var pos=scene.getObjectByName("Node_"+deviceId).position;
           selected.position.x=pos.x;
           selected.position.z=pos.z+params.pointCircle.positionDown;
           selected.position.y=pos.y;
           selected.visible=true;
           scene.add(selected)
           checkArr.push(deviceId);
       },
        //删除选中状态的标志
       removeCheckedIdentify:function(deviceId){
            var stat=scene.getObjectByProperty('deviceId',"selectState_Node_"+deviceId);
           scene.remove(stat);
           for(var i=0;i<checkArr.length;i++){
               if(deviceId==checkArr[i])checkArr.splice(i, 1);
           }
        },

        /**
     * 是否增加平面
     */
    InitPlane : function(name){
       /* var planeGeometry=new THREE.PlaneBufferGeometry(params.plane.height,params.plane.width,1,1);
        var planeMaterial=new THREE.MeshLambertMaterial({color:params.plane.color});
        planeMaterial.transparent=params.plane.transparent;
        planeMaterial.opacity=params.plane.opacity;
        planeMaterial.side=params.plane.side;
        var plane=new THREE.Mesh(planeGeometry,planeMaterial);
        plane.receiveShadow=true;
        plane.rotation.x=params.plane.rotationX;
        plane.position.x=params.plane.position.x;
        plane.position.y=params.plane.position.y;
        plane.position.z=params.plane.position.z;
        plane.name=name;
        scene.add(plane);*/

       /* var planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
        planeGeometry.rotateX( - Math.PI / 2 );
        var planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2 } );

        var plane = new THREE.Mesh( planeGeometry, planeMaterial );
        plane.position.y = -200;
        plane.receiveShadow = true;
        scene.add( plane );

        var helper = new THREE.GridHelper( 2000, 100 );
        helper.position.y = - 199;
        helper.material.opacity = 0.25;
        helper.material.transparent = true;
        scene.add( helper );

        var axis = new THREE.AxisHelper();
        axis.position.set( -500, -500, -500 );
        scene.add( axis );*/
    },
    PointingEarth:function(){
        //1、
        var geometry   = new THREE.SphereGeometry(6, 32, 32)
        var material  = new THREE.MeshPhongMaterial()
         earthMesh = new THREE.Mesh(geometry, material)
        earthMesh.position.set(params.earth.initPosition.x,params.earth.initPosition.y,params.earth.initPosition.z)
        scene.add(earthMesh)
        //2、
        material.map    = new THREE.TextureLoader().load('images/earth/earthmap1k.jpg')
        //3、
        material.bumpMap    =  new THREE.TextureLoader().load('modules/images/earth/earthbump1k.jpg')
        material.bumpScale = 0.05
        //4
        material.specularMap    =new THREE.TextureLoader().load('modules/images/earth/earthspec1k.jpg')
        material.specular  = new THREE.Color('grey')
        //5
        /* var geometry   = new THREE.SphereGeometry(0.51, 32, 32)
         var material  = new THREE.MeshPhongMaterial({
         map     : new THREE.Texture(canvasCloud),
         side        : THREE.DoubleSide,
         opacity     : 0.8,
         transparent : true,
         depthWrite  : false,
         })
         var cloudMesh = new THREE.Mesh(geometry, material)
         earthMesh.add(cloudMesh)*/
    },
    RotateEarth:function(){
        earthMesh.rotation.x+=params.earth.rotateSpeed;
       // earthMesh.rotation.y+=params.earth.rotateSpeed;
       // earthMesh.rotation.z+=params.earth.rotateSpeed;

        if(earthMesh.position.x<=params.earth.farPosition.x)params.earth.direction.x="add";
        else if(earthMesh.position.x>=params.earth.nearPosition.x)params.earth.direction.x="reduce";

        if(earthMesh.position.y<=params.earth.farPosition.y)params.earth.direction.y="add";
        else if(earthMesh.position.y>=params.earth.nearPosition.y)params.earth.direction.y="reduce";

        if(earthMesh.position.z<=params.earth.farPosition.z)params.earth.direction.z="add";
        else if(earthMesh.position.z>=params.earth.nearPosition.z)params.earth.direction.z="reduce";

        /*if(params.earth.direction.x=="add") earthMesh.position.x+=params.earth.moveSpeed;
        if(params.earth.direction.x=="reduce") earthMesh.position.x-=params.earth.moveSpeed;
        if(params.earth.direction.y=="add") earthMesh.position.y+=params.earth.moveSpeed;
        if(params.earth.direction.y=="reduce") earthMesh.position.y-=params.earth.moveSpeed;
        if(params.earth.direction.z=="add") earthMesh.position.z+=params.earth.moveSpeed;
        if(params.earth.direction.z=="reduce") earthMesh.position.z-=params.earth.moveSpeed;*/
    },
    PointingStarfield:function(){
        var geometry  = new THREE.SphereGeometry(900, 32, 32);
// create the material, using a texture of startfield
        var material  = new THREE.MeshBasicMaterial()
        material.map   = THREE.ImageUtils.loadTexture('modules/images/earth/galaxy_starfield.png')
        material.side  = THREE.BackSide
// create the mesh based on geometry and material
         starfieldMesh  = new THREE.Mesh(geometry, material);
        scene.add(starfieldMesh)
    },


    /**
     * 初始化灯光
     */
    InitLights : function(){

        var ambient = new THREE.AmbientLight( 0xffffff );
        scene.add( ambient );
        this.ChooseLight();
    },
    ChooseLight : function(){
        var that=this;
        var LightGroup=scene.getObjectByName("light");
        if(LightGroup==undefined){
            LightGroup=new THREE.Group();
            LightGroup.name="light";
        }else{
            LightGroup.children.length=0;
        }
        if(that.controls.light=="DirectinalLight"){
            var light = new THREE.DirectionalLight( 0xFFFFFF );
            light.position.set(0,500,500);
            light.intensity=1.5;
            LightGroup.add(light);
           /* var helper = new THREE.DirectionalLightHelper( light, 5 );

            LightGroup.add( helper );*/

        }else if(that.controls.light=="PointLight"){
            //点光源
            for(var i=0;i<params.light.pointLightPosition.length;i++){
                var light = new THREE.PointLight( params.light.color, 1, 0 );
                light.position.set( params.light.pointLightPosition[i].x, params.light.pointLightPosition[i].y, params.light.pointLightPosition[i].z );
                LightGroup.add(light);
               /* var sphereSize = 1;
                var pointLightHelper = new THREE.PointLightHelper(  light, sphereSize );
                LightGroup.add( pointLightHelper );*/
            }
        }else if(that.controls.light=="SpotLight"){
            for(var i=0;i<params.light.spotLightPositions.length;i++){
                var spotLight=new THREE.SpotLight(0xffffff);
                spotLight.position.set(params.light.spotLightPositions[i].x,params.light.spotLightPositions[i].y,params.light.spotLightPositions[i].z);
                //  spotLight.castShadow=true;
                var target=new THREE.Object3D();
                target.position.set(0,0,0)
                spotLight.target=target;
                LightGroup.add(spotLight)
              /*  var spotLightHelper = new THREE.SpotLightHelper( spotLight );
                LightGroup.add( spotLightHelper );*/
            }
        }
        scene.add(LightGroup)
    },

    /**
     * 加载
     */
    LoadObj : function(onProgress,onError,callback,callbackObject){
        var h=params.plane.h;
        var mtlLoader = new THREE.MTLLoader();
        var i=0;
        load();

        function load(){
            if(i<params.model.objType.length){
                var path=params.model.path+ params.model.objType[i].type+'/';
                mtlLoader.setPath(path);
               // var nodes=new Array();
                var groupChild=new THREE.Group();
                groupChild.name="Model_"+ params.model.objType[i].type;
              //  groupChild.position.x=-params.plane.height+Math.round(Math.random()*params.plane.width);
                groupChild.position.y=30*i;
                groupChild.visible=params.model.visible;
                // object.position.z=-20+Math.round(Math.random()*40);
                //object.castShadow=true;
                groupChild.scale.set(params.model.scale.x,params.model.scale.y,params.model.scale.z);
                var v=0;
                loadChild(v,path,groupChild);

            }else{//加载完模型之后掉回掉函数
                if(typeof callback ==="function")callback.apply(callbackObject);
            }
        }

        /**
         * 加载子项
         * @param path
         * @param groupChild
         */
        function loadChild(v,path,groupChild){
            var objTypeValue=params.model.objType[i].value;
            if(v<objTypeValue.length){
                mtlLoader.load( objTypeValue[v]+'.mtl', function( materials ) {
                    materials.preload();
                    var objLoader = new THREE.OBJLoader();
                    objLoader.setMaterials( materials );
                    objLoader.setPath(path);
                    objLoader.load(  objTypeValue[v]+'.obj', function ( object ) {
                        groupChild.add(object);
                        v++;
                        loadChild(v,path,groupChild);
                    }, onProgress, onError );

                });
            }else{
                scene.add(groupChild);
                i++;
                load();
            }
        }
    },



    /**
     * 获取单位向量
     * @param nodes:为两个节点方向为指向第二个节点
     * @param multiple:默认为1
     * @returns {Object}
     */
    GetUnitVector : function(nodes,multiple){
        if(multiple==undefined)multiple=1;
        var x=nodes[1].x-nodes[0].x;
        var y=nodes[1].y-nodes[0].y;
        var z=nodes[1].z-nodes[0].z;
        var mold=Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
        var object=new Object();
        object.x=(x*multiple)/mold;
        object.y=(y*multiple)/mold;
        object.z=(z*multiple)/mold;
        object.mold=mold;
        return object;
    },

    /**
     * 添加两点直接的线
     * @param nodes：节点坐标
     */
    AddTube : function(nodes,lineId){
        var pipeSpline = new THREE.CatmullRomCurve3( [
            nodes[0], nodes[1]
        ] );
        var tubeGeometry = new THREE.TubeBufferGeometry( pipeSpline, params.line.extrusionSegments, params.line.radius, params.line.radiusSegments, params.line.closed );
        var group = THREE.SceneUtils.createMultiMaterialObject( tubeGeometry, [ linematerial ] );
        group.name=lineId;
        scene.add(group);
    },

    /**
     * 添加节点上的塞子
     * @param nodes
     * @param unitVector
     */
    AddPlug : function(nodes,unitVector){
        var geometrySphere = new THREE.SphereGeometry( params.interPlug.spereGeometry.radius, params.interPlug.spereGeometry.segmentsWidth, params.interPlug.spereGeometry.segmentsHeight );
        var materialSphere = new THREE.MeshPhongMaterial( {color: params.interPlug.spereGeometry.color} );
        var sphere = new THREE.Mesh( geometrySphere, materialSphere );
        sphere.position.x=nodes[0].x- unitVector.x;
        sphere.position.y=nodes[0].y- unitVector.y;
        sphere.position.z=nodes[0].z- unitVector.z;
        scene.add( sphere);
        var sphere1 = sphere.clone();
        sphere1.position.x=nodes[1].x+ unitVector.x;
        sphere1.position.y=nodes[1].y+ unitVector.y;
        sphere1.position.z=nodes[1].z+ unitVector.z;
        scene.add( sphere);
    },

    /**
     * 两点直接存在多条线
     * @param lines
     */
    MultiTube : function(lines){
        var n = 2,m = 5;
        var mold=Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
        var x=((lines[1].x-lines[0].x)/2)+lines[0].x+random(n,m);
        var y=((lines[1].y-lines[0].y)/2)+lines[0].y+random(n,m);
        var z=((lines[1].z-lines[0].z)/2)+lines[0].z+random(n,m);
        var pipeSpline = new THREE.CatmullRomCurve3( [
            lines[0],new THREE.Vector3(x,y,z) ,lines[1]
        ] );
        //material.color=new THREE.Color( 0xff0000 );
        var tubeGeometry = new THREE.TubeBufferGeometry( pipeSpline, params.line.extrusionSegments, params.line.radius, params.line.radiusSegments, params.line.closed );
        var group = THREE.SceneUtils.createMultiMaterialObject( tubeGeometry, [ _lineMaterial.getMaterial(),_lineMaterial.getWireframeMaterial() ] );
        scene.add(group);
    },

    /**
     * 取随机数
     * @param start
     * @param end
     * @param isInt:true只要整数，false:也需要负数
     */
    Random : function(start,end,isInt){
        if(isInt!=undefined&&isInt)return Math.random()*(start-end)+end;
        else return Math.random()>0.5?Math.random()*(start-end)+end:Math.random()*(end-start)-end;
    }
    })



    /**
     * 选中状态
     * @constructor
     */
    function SelectStatesClass(){
        THREE.Group.call(this);

    }
    (function(){
        // 创建一个没有实例方法的类
        var Super = function(){};
        Super.prototype =  THREE.Group.prototype;
        //将实例作为子类的原型
        SelectStatesClass.prototype = new Super();
    })();
    SelectStatesClass.prototype = Object.create(  THREE.Group.prototype );
    SelectStatesClass.prototype.isSelectStates = true;
    SelectStatesClass.prototype.constructor = SelectStatesClass;
    Object.assign(SelectStatesClass.prototype,{
        rotateSpeed:params.pointCircle.rotationSpeed,
        outSideOpacity : params.pointCircle.outSideOpacity,
        outSideOpacitySpeed:params.pointCircle.outSideOpacitySpeed,
        outSideOpacityDirection:params.pointCircle.outSideOpacityDirection,

        /**
         * 动态旋转
         * @param e
         * @constructor
         */
        DynamicRotate:function(){
            var selectStates=this;
            selectStates.rotation.y=0;
            selectStates.rotation.z+=this.rotateSpeed;
            if(selectStates.getObjectByName("outSide").material.opacity<=0){
                this.outSideOpacityDirection='add';
                // selectStates.getObjectByName("outSide").material.opacity=params.pointCircle.outSideOpacity;
            }else  if(selectStates.getObjectByName("outSide").material.opacity>=this.outSideOpacity){
               this.outSideOpacityDirection='reduce';
            }
            if(this.outSideOpacityDirection=='add') selectStates.getObjectByName("outSide").material.opacity+=this.outSideOpacitySpeed+0.003;
            if(this.outSideOpacityDirection=='reduce') selectStates.getObjectByName("outSide").material.opacity-=this.outSideOpacitySpeed;
        }
    });

    SelectStatesClass.prototype.copy = function ( source ) {
        THREE.Group.prototype.copy.call( this, source );
        this.children[0].material=source.children[0].material.clone();
        this.children[1].material=source.children[1].material.clone();
        this.children[2].material=source.children[2].material.clone();
        return this;
    };


    function updateGroupGeometry( mesh, geometry ) {

        mesh.children[ 0 ].geometry.dispose();
        mesh.children[ 1 ].geometry.dispose();

        mesh.children[ 0 ].geometry = new THREE.WireframeGeometry( geometry );
        mesh.children[ 1 ].geometry = geometry;

        // these do not update nicely together if shared

    }

    /**
     * 搜索
     * @constructor
     */
    function SearchClass(){
        this.resultHtml='<li><input name="searchResult" type="checkbox"> <span></span></li>';
        this.resultClass='resultUl';
    }
    Object.assign(SearchClass.prototype,{
        Init:function(){
            $(".searchInput").bind("keydown",function(event){
                if(event.keyCode==13)$("#search").click();
            })
            $(".searchInput").bind("keyup",function(event){
                if($(this).val()==""){
                    $(".resultList").hide("slow");
                    search.ClearResult();
                }
            })
            //搜索
            $("#search").bind("click",function(){
                var cont=$(this).prev().val();
                if($.trim(cont)==""){
                    alert("请输入内容！");
                    $(this).prev().focus();
                }else{
                    $(".resultList").show("slow");
                    search.ClearResult();
                    search.SearchCont(cont);
                }
            });


            //全选
           $("[name='checkAll']").bind("click",function(){
               if($(this).is(":checked"))search.CheckAll();
               else search.CheckNone()
           });
           //反选
           $("[name='reverse']").bind("click",function(){
               search.ReverseSelection();
           })
           //整体反选
            $("[name='AllReverse']").bind("click",function(){
                search.AllReverseSelection();
            })
            //取消选择
           $("[name='cancelSelect']").bind("click",function(){
               search.CancelSelection();
           })
            //收起与展开
            $(".closeResultList").bind("click",function(){
                $(this).toggleClass("Up");
                $(this).toggleClass("UpAnimal");
                if($(this).hasClass("Up")){
                    $(this).css("background-position-y","0px")
                    $(".resultDiv").slideUp("slow");
                }else{
                    $(this).css("background-position-y","-20px")
                    $(".resultDiv").slideDown("slow");
                }
            })

        },
       SearchCont:function(cont){
           $("[name='checkAll']").prop("checked",true);
           var arr=reportMap.elements;
           var resultArr=new Array();
           var n=0;
           for(var i=0;i<arr.length;i++){
               if(this.IsExistCont(cont,arr[i].value)){
                   this.PaintingResult(arr[i].value);
                   n++;
               }
           }
           $(".CountNum").html("共"+n+"条");
           this.bindResultList();
       },
       ClearResult : function(){
         $("."+this.resultClass).html("");
         for(var i=0;i<checkArr.length;i++){
             var obj=scene.getObjectByProperty("deviceId","selectState_Node_"+checkArr[i]);
             scene.remove(obj);
         }
       },
       ClearSearchHtml:function(){
           $(".resultList").hide("slow");
           $("."+this.resultClass).html("");
       },
       IsExistCont : function(cont,node){
          if(node.deviceName.indexOf(cont)!=-1)return true;
          else if(node.mgmtIp.indexOf(cont)!=-1)return true;
          else if(node.deviceType.indexOf(cont)!=-1)return true;
           else return false;
       },
       PaintingResult : function(node){
           var result=$(this.resultHtml);
           result.find("input").prop("checked",true)
           result.find("input").val(node.deviceId);
           result.find("span").text(node.deviceName);
           $("."+this.resultClass).append(result);
           topo.paintingCheckedIdentify(node.deviceId);
       },
       CheckAll:function(){
           $("[name='searchResult']").each(function(){
               if(!$(this).is(":checked")){
                   $(this).click();
               }
           });
       },
        CheckNone:function(){
            $("[name='searchResult']").each(function(){
                    if($(this).is(":checked")){
                        $(this).click();
                    }
            })
        },
        ReverseSelection:function(){//反选
            $("[name='searchResult']").each(function(){
                $(this).click();
            });
        },
        AllReverseSelection:function(){//整体反选
            var vals=this.CheckedVals();
            $.each(reportMap.elements,function(i,o){
                var deviceId=o.key;
                if(vals.indexOf(","+deviceId+",")==-1) {
                    topo.paintingCheckedIdentify(deviceId);
                }else{
                    topo.removeCheckedIdentify(deviceId);
                }
            });
        },
        CheckedVals:function(){
            var vals="";
            $("[name='searchResult']:checked").each(function(i){
               if(i==0)vals=","+$(this).val()+",";
                else vals+=$(this).val()+",";
            });
            return vals;
        },
        CancelSelection:function(){
            $.each(reportMap.elements,function(i,o){
                var deviceId=o.key;
                topo.removeCheckedIdentify(deviceId);
            });

            $("[name='searchResult']:checked").removeAttr("checked")
        },
        bindResultList:function(){//绑定
            //选择某一项
            $("[name='searchResult']").bind("click",function(){
                if($(this).is(":checked")){
                    topo.paintingCheckedIdentify($(this).val());
                }else{
                    topo.removeCheckedIdentify($(this).val());
                }
                if($("[name='searchResult']").not(":checked").size()==0) {
                    if(!$("[name='checkAll']").is(":checked"))$("[name='checkAll']").click();
                }else{
                    if($("[name='checkAll']").is(":checked"))$("[name='checkAll']").removeAttr("checked");
                }
            })

            $(".resultUl>li").bind("click",function(){
                var input=$(this).find("input");
                if(input.is(":checked")){
                    var deviceId=input.val();
                    reportOfDevice.showTip(deviceId);
                }
               // topo.FocusOnEquiment();
            })
            $('.resultDiv').getNiceScroll().show();
            $('.resultDiv').getNiceScroll().resize();
        }


    });




    exports.TopoClass = TopoClass;
    exports.SelectStatesClass=SelectStatesClass;
    exports.SearchClass=SearchClass;
    Object.defineProperty(exports, '__esModule', { value: true });

})));





