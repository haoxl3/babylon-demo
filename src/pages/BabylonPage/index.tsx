import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import {useEffect, useRef} from 'react';

const BabylonPage = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engine = useRef();
    
    const initHandle = () => {
        engine.current = new BABYLON.Engine(canvasRef.current, true);
        const scene = new BABYLON.Scene(engine.current);
        let light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
        // Default intensity is 1. Let's dim the light a small amount
        // light.intensity = 0.7;
        BABYLON.SceneLoader.ImportMesh(null, "./", "01_strocchi_LV.stl", scene, function(sceneArg){
            // BABYLON.STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES = true;
            // sceneArg[0].showBoundingBox = true;
            const boundingInfo = sceneArg[0].getBoundingInfo();
            const ratio = 5.0/boundingInfo.boundingSphere.radius;

            sceneArg[0].position.y = (0 - boundingInfo.minimum.y) * ratio;
            sceneArg[0].scaling.x = ratio;
            sceneArg[0].scaling.y = ratio;
            sceneArg[0].scaling.z = ratio;
        });
    
        let camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, -100, new BABYLON.Vector3(1, 2, -3), scene);
        // This targets the camera to scene origin
        camera.setTarget(new BABYLON.Vector3(0, 5, 0));
    
        // This attaches the camera to the canvas
        camera.attachControl(canvasRef.current, true);
    
        // camera.keysUp.push(87);    //W
        // camera.keysLeft.push(65);  //A
        // camera.keysRight.push(68); //S
        // camera.keysDown.push(83)   //D

        const Epsilon = 0.001;

        var lookingAtPosition = new BABYLON.Vector3(0, 0, 0);
        var inertialTargetDrift = 0;

        camera._originalCheckInputs = camera._checkInputs;
        // this is where new camera position can be interpolated during an update tick.
        camera._checkInputs = function() {

            if (inertialTargetDrift > Epsilon)
            {
                inertialTargetDrift *= 0.7;
                // move camera target slightly towards the lookingAtPosition.
                let up = camera.upVector;
                let direction = lookingAtPosition.subtract(camera.target);
                let len =  direction.length();
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
        let wheelInput = camera.inputs.attached["mousewheel"];
        let wheelPrecision = wheelInput.wheelPrecision;

        const mywheel = (p, s) => {
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
        scene.onPointerMove = function(evt, pickInfo){
            if (pickInfo.ray){
                var length = camera.position.length();
                var pos = camera.position.add(pickInfo.ray.direction.scale(length));
                lookingAtPosition = pos;
            }
        }

        const POINTERWHEEL = 0x08;
        scene.onPointerObservable.add(mywheel, POINTERWHEEL);
    
        engine.current.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });
    };
    const onResizeWindow = () => {
        engine.current.resize();
    };
    useEffect(() => {
        initHandle();
        window.addEventListener('resize', onResizeWindow);
    }, []);
    return <canvas ref={canvasRef} style={{width: '800px', height: '600px'}}></canvas>
}
export default BabylonPage;