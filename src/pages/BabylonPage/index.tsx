import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import {useEffect, useRef} from 'react';

const BabylonPage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engine = useRef();
    const scene = useRef();
    const sceneToRender = useRef();
    
    
    const createScene = () => {
        const canvas = document.getElementById('canvas');
        scene.current = new BABYLON.Scene(engine.current);
        // const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 2.2, 100, BABYLON.Vector3.Zero(), scene.current);
        // const camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(65), 4.7, BABYLON.Vector3.Zero(), scene.current);
        var camera = new BABYLON.ArcRotateCamera("Camera", 1.9, 1.5, 80, BABYLON.Vector3.Zero(), scene.current);
        camera.useFramingBehavior = true;

        camera.attachControl(canvas, true);
        let light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene.current);
        BABYLON.SceneLoader.ImportMesh(null, "./", "01_strocchi_LV.stl", scene.current, function(sceneArg){
            // BABYLON.STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES = true;
            // sceneArg[0].showBoundingBox = true;
            const boundingInfo = sceneArg[0].getBoundingInfo();
            const ratio = 9.0/boundingInfo.boundingSphere.radius;

            sceneArg[0].position.y = (0 - boundingInfo.minimum.y) * ratio;
            sceneArg[0].scaling.x = ratio;
            sceneArg[0].scaling.y = ratio;
            sceneArg[0].scaling.z = ratio;
            camera.setTarget(sceneArg[1]);
        });
        
        // ==============================================================================================
        // Ok, now for the fun camera controls.  This hacks the internals of ArcRotateCamera so that
        // the target location can be smoothly updated while other animating camera movements are 
        // taking place in response to mouse wheel.
        // ==============================================================================================

        const Epsilon = 0.001;

        var lookingAtPosition = new BABYLON.Vector3(0, 0, 0);
        var inertialTargetDrift = 0;

        camera._originalCheckInputs = camera._checkInputs;

        // this is where new camera position can be interpolated during an update tick.
        camera._checkInputs = function() {

            if (inertialTargetDrift > Epsilon){
                inertialTargetDrift *= 0.7;
                // move camera target slightly towards the lookingAtPosition.
                var up = camera.upVector;
                var direction = lookingAtPosition.subtract(camera.target);
                var len =  direction.length();
                if (len > 0.1) {
                    direction.scaleInPlace(0.2 / len);
                    camera.setTarget(camera.target.add(direction));
                    console.log("adjusting camera target by " + len);
                }
            }
            else {
                inertialTargetDrift = 0;
            }

            camera._originalCheckInputs();
        }

        // we are also going to listen to the mouse wheel so we can set our own
        // inertial camera drift towards the current "lookingAtPosition"
        var wheelInput = camera.inputs.attached["mousewheel"];
        var wheelPrecision = wheelInput.wheelPrecision;

        var mywheel = function(p, s) {
            var event = p.event;
            var wheelDelta = 0;
            if (event.wheelDelta) {
                wheelDelta = event.wheelDelta;
            } else {
                wheelDelta = -(event.deltaY || event.detail) * 60;
            }

            var delta = wheelDelta / (wheelPrecision * 40);
            if (delta) {
                //camera.inertialRadiusOffset += delta;
                inertialTargetDrift += delta;
            }
        }
        
        // and we need to watch mouse move to cast a ray into the scene to see what the
        // user is looking at with the mouse.  But we can avoid having to depend on "pick"
        // mesh hit detection by moving our own little target object to a computed position 
        // in the scene.  This object is called "target" and is only required 
        scene.current.onPointerMove = (evt, pickInfo) => {
            if (pickInfo.ray){
                var length = camera.position.length();
                var pos = camera.position.add(pickInfo.ray.direction.scale(length));
                lookingAtPosition = pos;
            }
        }

        const POINTERWHEEL = 0x08;
        scene.current.onPointerObservable.add(mywheel, POINTERWHEEL);

        return scene.current;
    };
    const createDefaultEngine = () => {
        const canvas = document.getElementById('canvas');
        return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); 
    };
    const startRenderLoop = (engine, canvas) => {
        engine.runRenderLoop(function () {
            if (sceneToRender.current && sceneToRender.current.activeCamera) {
                sceneToRender.current.render();
            }
        });
    }
    const initFunction = async () => {
        const asyncEngineCreation = async () => {
            try {
                return createDefaultEngine();
            } catch(e) {
                console.log('the available createEngine function failed. Creating the default engine instead')
                return createDefaultEngine();
            }
        }
        engine.current = await asyncEngineCreation();
        if(!engine.current) throw 'engin should not be null';
        startRenderLoop(engine.current, canvasRef.current);
        scene.current = createScene();
    }
    const onResizeWindow = () => {
        engine.current.resize();
    };
    useEffect(() => {
        initFunction().then(() => {sceneToRender.current = scene.current});
        window.addEventListener('resize', onResizeWindow);
    }, []);
    return <canvas id="canvas" style={{width: '800px', height: '600px'}}></canvas>
}
export default BabylonPage;