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
    
        // This creates and positions a free camera (non-mesh)
        let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(-12, 8, 12), scene);
    
        // This targets the camera to scene origin
        camera.setTarget(new BABYLON.Vector3(0, 5, 0));
    
        // This attaches the camera to the canvas
        camera.attachControl(canvasRef.current, true);
    
        // camera.keysUp.push(87);    //W
        // camera.keysLeft.push(65);  //A
        // camera.keysRight.push(68); //S
        // camera.keysDown.push(83)   //D
    
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