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
    var camera, scene, renderer;
    var raycaster = new THREE.Raycaster(),INTERSECTED;
    var mouse = new THREE.Vector2(), isShiftDown = false;
    var circle;
    var mouseX = 0, mouseY = 0;
    var rollOverGeo,rollOverMesh, rollOverMaterial;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var SelectStatesObject=[];
    var loadFont=undefined;//加载字体对象

    //初始化配置
    var params={
        version:2,
        renderer:{
            color:0x000000
        },
        //模型
        model:{
            scale:{x:10,y:10,z:10},
            visible:false,
            objType:[{type:'Cloud',value:['cloud_p1','cloud_p2']},{type:'Firewall',value:['Firewall']},{type:'Infered_switch',value:['Infered_switch']},{type:'Switch',value:['Switch']},{type:'Router',value:['Router']},{type:'host',value:['host']},{type:'Routing Switch',value:['Routing Switch']}],
            path:"modules/"
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
            Hover: 0.5//上移高度
        },
        //选中
        pointCircle:{
          color: 0x156289,
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
            fontContVisible:true//设备上的字体是否显示
        },
        //相机
        camera:{
            autoRotate:true,
            autoRotateSpeed:1,
            position:{
                x:0,y:400,z:500
            }
        },
        //灯光
        light:{
            color:0xffffff,
            pointLightPosition:[
                {x:0,y:200,z:0},
                {x:100,y:200,z:100},
                {x:-100,y:200,z:-100}
            ]
        },

        //平面
        plane:{
            h:40,//平面之间的高度
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
        }
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
    var FontMaterial = new THREE.MeshPhongMaterial( {
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
        this.parentId=options.parentId;
        this.Nodes=options.Nodes;
        this.Links=options.Links;
        this.onlyView=options.onlyView;
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
            //设备上的字体是否显示
            deviceNameVisible : params.equipment.fontContVisible
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



            /*var axes=new THREE.AxisHelper(100);
            axes.position.y=0.1;
            axes.name="axes"
            scene.add(axes);*/
            //camera
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
            camera.position.z = params.camera.position.z;
            camera.position.y = params.camera.position.y;
            //加载平面
            this.InitPlane("plane");
            //加载灯光
            this.InitLights();

            /**
             * 初始化加载对象的工具
             */
            var onProgress = function ( xhr ) {
                if ( xhr.lengthComputable ) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    console.log( Math.round(percentComplete, 2) + '% downloaded' );
                }
            };

            var onError = function ( xhr ) { };

            THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

            this.LoadObj(onProgress,onError,function(){
                this.PaintingNodes(function(){
                    this.PaintingLinks();
                    this.PaintingDeviceCont();
                },this);
            },this);


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
                renderer.domElement.addEventListener( 'keydown', onDocumentKeyDown, false );
                renderer.domElement.addEventListener( 'keyup', onDocumentKeyUp, false );
                //工具栏
                this.InitGUI();
            }



            //旋转
            var orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
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

                    var intersect = intersects[ 0 ].object.parent.parent;
                    if(intersect.name.indexOf("Node_")!=-1&&scene.getObjectByProperty('deviceId',"selectState_"+intersect.name)==undefined) {
                        var selected = scene.getObjectByName("selectState").clone();
                        selected.deviceId="selectState_"+intersect.name
                        var deviceId=intersect.name.split("Node_")[1];
                        reportOfDevice.showTip(deviceId);
                        scene.add(selected)
                    }
                    render();

                }

            }


            function onDocumentKeyDown( event ) {

                switch( event.keyCode ) {

                    case 16: isShiftDown = true; break;

                }

            }

            function onDocumentKeyUp( event ) {

                switch ( event.keyCode ) {

                    case 16: isShiftDown = false; break;

                }

            }

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

                if ( intersects.length > 0 && FilterNoRaycasterObject(intersects[ 0 ].object)&& intersects[ 0 ].object.parent!=undefined) {
                    if ( INTERSECTED != intersects[ 0 ].object.parent.parent ) {
                        INTERSECTED = intersects[0].object.parent.parent;
                        if(INTERSECTED.name.indexOf("Node_")!=-1){
                            circle.visible=true;
                            circle.position.x=INTERSECTED.position.x;
                            circle.position.y=INTERSECTED.position.y-params.pointCircle.positionDown;
                            circle.position.z=INTERSECTED.position.z;
                        }

                      //  console.log("hitting something" + INTERSECTED.name);
                    }

                }else{
                    circle.visible=false;
                    INTERSECTED=null
                }

                for(var i=0; i<textlabels.length; i++) {
                    textlabels[i].updatePosition();
                }

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
            addShape( arcShape,         extrudeSettings,  { color: 0x156289, side: THREE.DoubleSide,transparent:true,opacity:params.pointCircle.outSideOpacity },  0,    0, 0, 0, 0, 0, 1 );

            var arcShape1 = new THREE.Shape();
            //arcShape.moveTo( 50, 10 );
            arcShape1.absarc( 0, 0, 18, 0,Math.PI * 2 , false );

            var holePath1 = new THREE.Path();
            // holePath.moveTo( 10, 10 );
            holePath1.absarc( 0, 0, 17,  0, Math.PI * 2, true );
            arcShape1.holes.push( holePath1 );
            arcShape1.name="midSide";
            addShape( arcShape1,         extrudeSettings,  { color: 0x156289, side: THREE.DoubleSide,transparent:false },  0,    0, 0, 0, 0, 0, 1 );

            var arcShape2 = new THREE.Shape();
            //arcShape.moveTo( 50, 10 );
            arcShape2.absarc( 0, 0, 14,0, Math.PI, false );

            var holePath2 = new THREE.Path();
            // holePath.moveTo( 10, 10 );
            holePath2.absarc( 0, 0, 12, 0, Math.PI, false );
            arcShape2.holes.push( holePath2 );
            arcShape2.name="innerSide";
            addShape( arcShape2,         extrudeSettings, { color: 0x156289, side: THREE.DoubleSide,transparent:true,opacity:0.4 },  0,    0, 0,0, 0, 0, 1 );



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
        var that=this;
        gui.add(this.controls,'deviceNameVisible').onChange(function(value){
            if(value){
                that.PaintingDeviceCont();
            }else{
                that.RemoveDeviceCont();
            }
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
                var m=scene.getObjectByName("Model_"+params.model.objType[i]);
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
            if(model!=undefined){
                var object=model.clone();
                object.visible=true;
                object.position.x=node.tuoPuX*params.equipment.multipleOfLayout-params.plane.height/4;
                object.position.y=positionY;
                object.position.z=node.tuoPuY*params.equipment.multipleOfLayout-params.plane.width/4;
                object.name="Node_"+node.deviceId;
                //objects.push(object);
                reportMap.put(node.deviceId,node);

               /* var text = this._createTextLabel();
                text.setHTML(node.deviceName);
                text.setParent(object);
                textlabels.push(text);
                container.appendChild(text.element);*/

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
        PaintingDeviceCont: function () {
            var i=0;
           createNodeText();
            var group;
            function createNodeText(){
               if(i<reportMap.elements.length){
                   var node=reportMap.elements[i].value;
                   var fontText=node.deviceName;
                   group=scene.getObjectByName("Node_"+node.deviceId);
                   if(!isDeviceContVisible(group)){
                       if(loadFont==undefined){
                           var loader = new THREE.FontLoader();
                           loader.load( 'fonts/' + params.fontOptoins.font + '_' + params.fontOptoins.weight + '.typeface.json', function ( font ) {
                               loadFont=font;
                               createText(fontText);
                               i++;
                               setTimeout(function(){
                                   createNodeText();
                               },1000)

                           } );
                       }else{
                           createText(fontText);
                           i++;
                           setTimeout(function(){
                               createNodeText();
                           },1000)

                       }
                   }else{
                       i++;
                       createNodeText();
                   }

               }
            }

            function createText(fontText){
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
            function isDeviceContVisible(group){
                var cont=group.getObjectByName("deviceCont");
                if(cont==undefined)return false;
                else{
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
       paintingCheckedIdentify:function(deviceId){},
        //删除选中状态的标志
       removeCheckedIdentify:function(deviceId){
            var stat=scene.getObjectByProperty('deviceId',"selectState_Node_"+deviceId);
           scene.remove(stat);
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


    /**
     * 初始化灯光
     */
    InitLights : function(){
        var ambient = new THREE.AmbientLight( params.light.color );
        scene.add( ambient );

        //点光源
        var lights = [];
        for(var i=0;i<params.light.pointLightPosition.length;i++){
            lights[ i ] = new THREE.PointLight( params.light.color, 1, 0 );
            /*lights[ i ].castShadow = true;
            lights[ i ].shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 70, 1, 200, 2000 ) );
            lights[ i ].shadow.bias = -0.000222;
            lights[ i ].shadow.mapSize.width = 1024;
            lights[ i ].shadow.mapSize.height = 1024;*/
            lights[ i ].position.set( params.light.pointLightPosition[i].x, params.light.pointLightPosition[i].y, params.light.pointLightPosition[i].z );
            scene.add( lights[ i ] );
        }
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
                groupChild.position.x=-params.plane.height+Math.round(Math.random()*params.plane.width);
                groupChild.position.y=Math.round(Math.random()*h);
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

    function updateGroupGeometry( mesh, geometry ) {

        mesh.children[ 0 ].geometry.dispose();
        mesh.children[ 1 ].geometry.dispose();

        mesh.children[ 0 ].geometry = new THREE.WireframeGeometry( geometry );
        mesh.children[ 1 ].geometry = geometry;

        // these do not update nicely together if shared

    }


    exports.TopoClass = TopoClass;
    exports.SelectStatesClass=SelectStatesClass;
    Object.defineProperty(exports, '__esModule', { value: true });

})));





