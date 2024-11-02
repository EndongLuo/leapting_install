<template>
  <div id="container">
    <!-- <div id="container"></div> -->
    <!-- object区域 -->
    <object ref="objectRef" tabindex="-1" type="text/html" aria-hidden="true" data="about:blank" style="display: block; 
            position: absolute; 
            top: 0px; 
            left: 0px; 
            width: 100%; 
            height: 100%; 
            border: none; 
            padding: 0px; 
            margin: 0px; 
            opacity: 0; 
            z-index: -1000; 
            pointer-events: none;">
    </object>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as THREE from "three";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import gsap from "gsap"; // 导入动画库
import ROSLIB from "roslib/src/RosLib";
let transforms = [
  {
    child_frame_id: "base_arm",
    transform: {
      rotation: { y: -0.023953751815756746, x: -0.01263971765023428, z: -0.11616840271765423, w: 0.9928601903197148 },
      translation: { y: 0.22960672748231425, x: -0.9876049593204282, z: -0.33639902950190259 }
    }
  },
  {
    child_frame_id: "link_1",
    transform: {
      rotation: { y: -0.008210107771176877, x: -0.025815693856549585, z: 0.6166795934254456, w: 0.7867480048488952 },
      translation: { y: 0.23446089481852445, x: -0.9971750398707624, z: -0.28827703120003797 }
    }
  },
  {
    child_frame_id: "link_2",
    transform: {
      rotation: { y: -0.6441493376497155, x: -0.3323355477073564, z: 0.16081810822919154, w: 0.6698971940537355 },
      translation: { y: 0.5694412523732717, x: -0.9452668231853263, z: 0.2903753488948912 }
    }
  },
  {
    child_frame_id: "link_3",
    transform: {
      rotation: { y: -0.6448408424829656, x: -0.3309918025123512, z: 0.15942105269032059, w: 0.6702310366542228 },
      translation: { y: 1.282452425624788, x: -0.6985149943756066, z: 1.165717911436868 }
    }
  },
  {
    child_frame_id: "link_4",
    transform: {
      rotation: { y: -0.5771395804664744, x: -0.7011076923671675, z: -0.34609392562934105, w: 0.23574754082501026 },
      translation: { y: 2.015172540089084, x: -0.6016969487282604, z: 0.683753441899478 }
    }
  },
  {
    child_frame_id: "link_5",
    transform: {
      rotation: { y: -0.44627620624174424, x: -0.5790478771016361, z: 0.43383079120601, w: 0.526623155936133 },
      translation: { y: 2.2849251631944947, x: -0.5841391447582419, z: 0.4514637610105058 }
    }
  },
  {
    child_frame_id: "link_6",
    transform: {
      rotation: { y: -0.6257569738292328, x: -0.7790869420377798, z: -0.008638498244933667, w: -0.03710960520371138 },
      translation: { y: 2.263796123429619, x: -0.5165812363834075, z: 0.2860234615226485 }
    }
  },
  {
    child_frame_id: "tool0",
    transform: {
      rotation: { y: 0.020131909532110245, x: -0.03234751314540283, z: 0.9933745032102814, w: 0.10842251142464311 },
      translation: { y: 2.248105392757048, x: -0.49658785394669336, z: -0.0532325313131546 }
    }
  },
];

// let list = {
//   base: { color: 0x659e1b },
//   front_left: { color: 0x58596b },
//   front_right: { color: 0x58596b },
//   back_left: { color: 0x58596b },
//   back_right: { color: 0x58596b },
//   base_arm: { color: 0xfd8d3a },
//   link_1: { color: 0xfd8d3a },
//   link_2: { color: 0xfd8d3a },
//   link_3: { color: 0xfd8d3a },
//   link_4: { color: 0xfd8d3a },
//   link_5: { color: 0xfd8d3a },
//   link_6: { color: 0xfd8d3a },
//   tool: { color: 0x96999e },
// };
let list = {
  base_arm: { color: 0xfd8d3a },
  link_1: { color: 0xfd8d3a },
  link_2: { color: 0xfd8d3a },
  link_3: { color: 0xfd8d3a },
  link_4: { color: 0xfd8d3a },
  link_5: { color: 0xfd8d3a },
  link_6: { color: 0xfd8d3a },
  tool: { color: 0x96999e },
};

const modelAxesHelper = new THREE.AxesHelper(1); // 参数表示坐标轴的长度
modelAxesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff); // 设置坐标轴的显示颜色（红、绿、蓝）

let angle = 0; //用于圆周运动计算的角度值
const R = 50; //相机圆周运动的半径

const group = new THREE.Object3D();
group.position.set(0, 0);

function poselist(link, item) {
  // console.log(link, item);

  var { rotation, translation } = item.transform;
  if (!link.mash) return;
  link.mash.position.set(translation.x, translation.y, translation.z-1);
  link.mash.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
}
export default {
  data() {
    return {
      mesh: null,
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      carPosition: { x: 0, y: 0, z: 0 },
      farScreen: true,
      ip: null
    };
  },
  mounted() {
    this.init();

    // 视角切换
    this.$bus.$on('farScreen', (data) => {
      this.farScreen = data;
      console.log(this.farScreen);
    });

    this.$refs["objectRef"].contentDocument.defaultView.addEventListener("resize", () => {
      // this.$chart.resize();
      // console.log(1);
      const element = document.getElementById("container");
      // console.log(element.clientWidth,element.clientHeight);
      // 添加窗口变化监听器
      // addEventListener('resize', () => {
      // 更新修改相机比例
      this.camera.aspect = element.clientWidth / element.clientHeight;
      // 更新摄像机的投影矩阵
      this.camera.updateProjectionMatrix();
      // 更新画布大小
      this.renderer.setSize(
        element.clientWidth, // 宽度
        element.clientHeight // 高度
      );

      this.renderer.setPixelRatio(element.devicePixelRatio);// 更新画布像素比
      // });
    });

    // // 监听鼠标双击事件
    // addEventListener('dblclick', () => {
    //   // 获取当前状态
    //   const fullscreenElement = document.fullscreenElement
    //   if (fullscreenElement) document.exitFullscreen();
    //   // 请求画布全屏
    //   else this.renderer.domElement.requestFullscreen()
    // })
  },
  computed: {
    ...mapState("ros", ["ros"]),
  },
  // beforeDestory() {
  //   console.log(1);
  //   cancelAnimationFrame();
  //   console.log(2);
  // },
  methods: {
    rosAction() {

      // var cancel = new ROSLIB.Topic({
      //   ros: this.ros,
      //   name: "/tf2_web_republisher/cancel",
      //   messageType: "actionlib_msgs/GoalID",
      // });

      // cancel.publish({ id: ""})


      var actionClient = new ROSLIB.ActionClient({
        ros: this.ros,
        actionName: "/tf2_web_republisher/TFSubscriptionAction",
        serverName: "/tf2_web_republisher",
      });


      // create a goal
      var Goal = new ROSLIB.Goal({
        actionClient: actionClient,
        goalMessage: {
          source_frames: [
            'base_arm',
            "link_1",
            "link_2",
            "link_3",
            "link_4",
            "link_5",
            "link_6",
            "tool0",
          ],
          target_frame: "base_arm",
          angular_thres: 0.001,
          trans_thres: 0.001,
          rate: 10,
        },
      });

      Goal.send();

      Goal.on("feedback", (feedback) => {
        // console.log("feedback: ", feedback);
        transforms = feedback.transforms;
        // if (transforms.length == 13) localStorage.setItem('p', JSON.stringify(transforms))
        console.log("transforms: ", transforms);



      });

      Goal.on("result", (result) => {
        console.log("result: ", result);
      });
    },
    regexip(ws) {
      const regex = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
      return ws.match(regex)[1];
    },
    // 初始化
    init() {
      this.rosAction(); // rosAction
      this.createScene(); // 创建场景
      this.loadSTL(); // 加载STL模型
      this.createLight(); // 创建光源
      this.createPlane(); // 创建平面
      this.createCamera(); // 创建相机
      this.createRender(); // 创建渲染器
      this.createControls(); // 创建控件对象
      this.render(); // 渲染
    },
    // 创建场景
    createScene() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x000);

      // 坐标轴
      // let axes = new THREE.AxesHelper(20);
      // this.scene.add(axes);
    },

    // 创建平面
    createPlane() {

      // 添加贴图
      var textureLoader = new THREE.TextureLoader();
      var meshFloorTexture = textureLoader.load("/img/led9.png");
      // create the ground plane
      var planeGeometry = new THREE.PlaneGeometry(200, 200);
      var planeMaterial = new THREE.MeshPhongMaterial({
        transparent: true,
        map: meshFloorTexture,
        side: THREE.DoubleSide
      });
      var plane = new THREE.Mesh(planeGeometry, planeMaterial);

      // rotate and position the plane
      // plane.rotation.x = -0.5 * Math.PI;
      plane.receiveShadow = true;

      // add the plane to the scene
      // this.scene.add(plane);
      // this.scene.add(new THREE.GridHelper(20,20))
    },
    // 清理group中的所有子对象
    clearGroup() {
      console.log(group.children.length);
      while (group.children.length) {
        group.remove(group.children[0]);
      }
    },

    // 加载STL模型
    loadSTL() {
      this.clearGroup(); // 清理group中的所有子对象
      const loader = new STLLoader();
      // 车子模型
      // this.ip = this.regexip(this.ros.socket.url)
      // if (this.ip == '10.168.5.247') this.selectModel('hc', loader)
      // else if (this.ip == '10.168.5.246') this.selectModel('dkk', loader)
      this.selectModel('hc', loader);

      this.scene.add(group);
    },

    // 选择
    selectModel(name, loader) {
      for (const key in list) {
        loader.load(`/${name}/${key}.STL`, (geometry) => {
          const material = new THREE.MeshLambertMaterial({ color: list[key].color });
          list[key].mash = new THREE.Mesh(geometry, material);

          if (key == 'tool') {
            console.log(key);
            list[key].mash.add(modelAxesHelper); // 将坐标轴添加到模型的坐标系中
          }
          list[key].mash.castShadow = true;
          group.add(list[key].mash);
        });
      }
    },

    createLight() {
      // 环境光
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 创建环境光
      this.scene.add(ambientLight); // 将环境光添加到场景

      const spotLight = new THREE.SpotLight(0xffffff, 1); // 创建聚光灯
      spotLight.position.set(200, 200, 200);
      spotLight.castShadow = true;
      this.scene.add(spotLight);
    },
    // 创建相机
    createCamera() {
      const element = document.getElementById("container");
      const width = element.clientWidth; // 窗口宽度
      const height = element.clientHeight; // 窗口高度
      const k = width / height; // 窗口宽高比
      // PerspectiveCamera( fov, aspect, near, far )
      this.camera = new THREE.PerspectiveCamera(70, k, 0.1, 1000);
      this.camera.position.set(3,2,3); // 设置相机位置
      // this.camera.position.set(11, 4, 3); // 设置相机位置
      this.camera.up.set(0, 0, 1);

      // this.camera.lookAt({ x: 10, y: 10, z:10 }); // 设置相机方向
      this.scene.add(this.camera);
    },
    // 创建渲染器
    createRender() {
      const element = document.getElementById("container");
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(window.devicePixelRat);
      this.renderer.setSize(element.clientWidth, element.clientHeight); // 设置渲染区域尺寸
      this.renderer.shadowMap.enabled = true; // 显示阴影
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setClearColor(0x3f3f3f, 1); // 设置背景颜色
      element.appendChild(this.renderer.domElement);
    },

    render() {
      requestAnimationFrame(this.render);
      if (transforms) {
        transforms.forEach((item) => {
          var name = item.child_frame_id;

          switch (name) {
            case "base_arm": poselist(list.base_arm, item); break;
            case "link_1": poselist(list.link_1, item); break;
            case "link_2": poselist(list.link_2, item); break;
            case "link_3": poselist(list.link_3, item); break;
            case "link_4": poselist(list.link_4, item); break;
            case "link_5": poselist(list.link_5, item); break;
            case "link_6": poselist(list.link_6, item); break;
            case "tool0": poselist(list.tool, item); break;
          }
        });
      }
      this.renderer.render(this.scene, this.camera);
    },
    // 创建控件对象
    createControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.minDistance = 1;
      this.controls.maxDistance = 100;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.1;

      // this.camera.position.z = 20;
      this.controls.update();
    },

  },
};
</script>
<style>
#container {
  position: absolute;
  width: 100%;
  height: 100%;
  /* height: 100vh; */
}
</style>
