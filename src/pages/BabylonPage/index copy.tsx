import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import BabylonScene from "../../components/Guide/BabylonScene";
// BABYLON.STLFileLoader.DO_NOT_ALTER_FILE_COORDINATES = true;

const BabylonPage = () => {
    const onSceneMount = (canvas, scene, engine) => {
        debugger;
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;
        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        // var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
        const octo = BABYLON.SceneLoader.ImportMesh(null, "./", "aria.stl", scene, function(sceneArg){
            // const octo = BABYLON.SceneLoader.ImportMesh(null, "./", "CuteOcto.stl", scene, function(scene){
                debugger
            sceneArg[0].showBoundingBox = true;
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
        camera.attachControl(canvas, true);
    
        camera.keysUp.push(87);    //W
        camera.keysLeft.push(65);  //A
        camera.keysRight.push(68); //S
        camera.keysDown.push(83)   //D
    
        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
    
        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });
    }
    return <BabylonScene onSceneMount={(canvas, scene, engine) => onSceneMount(canvas, scene, engine)}/>
}
export default BabylonPage;