<template>
  <div>
    <!-- {{ mapHeight }} -->
    <!-- <div v-if="ros.isConnected"> -->
      <div id="map" :style="height= mapHeight"></div>
    <!-- </div> -->
    <!-- <el-empty v-else :image-size="mapHeight-200" description="暂无地图" image="/img/empty.png"></el-empty> -->

    <!-- edit site dialog -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="60%">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <!-- sitename -->
      <el-form-item label="stiename" label-width="132px" prop="name">
        <el-col :span="23"><el-input v-model="ruleForm.name" ></el-input></el-col>
      </el-form-item>

      <!-- position -->
      <el-form-item label="position(x,y,z)" label-width="132px" required>
        <el-col :span="5">
          <el-form-item prop="pose.position.x">
            <el-input type="number" v-model.number="ruleForm.pose.position.x"></el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1">-</el-col>
        <el-col :span="5">
          <el-form-item prop="pose.position.y">
            <el-input type="number" v-model.number="ruleForm.pose.position.y"></el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1">-</el-col>
        <el-col :span="5">
          <el-form-item prop="pose.position.z">
            <el-input type="number" v-model.number="ruleForm.pose.position.z"></el-input>
          </el-form-item>
        </el-col>
      </el-form-item>

      <!-- orientation -->
      <el-form-item label="orientation(w,x,y,z)" label-width="132px" required>
        <el-col :span="5">
          <el-form-item prop="pose.orientation.w">
            <el-input type="number" v-model.number="ruleForm.pose.orientation.w"></el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1">-</el-col>
        <el-col :span="5">
          <el-form-item prop="pose.orientation.x">
            <el-input type="number" v-model.number="ruleForm.pose.orientation.x"></el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1">-</el-col>
        <el-col :span="5">
          <el-form-item prop="pose.orientation.y">
            <el-input type="number" v-model.number="ruleForm.pose.orientation.y"></el-input>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="1">-</el-col>
        <el-col :span="5">
          <el-form-item prop="pose.orientation.z">
            <el-input type="number" v-model.number="ruleForm.pose.orientation.z"></el-input>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item class="threeBtn" style="display: flex; justify-content: center;">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
        <el-button type="primary" @click="editForm('ruleForm')">edit</el-button>
      </el-form-item>
    </el-form>
    </el-dialog>

    <el-card v-if="elcard" class="elcard" shadow="always">
      <span style="font-size: 22px;">正在导航：前往{{ navSite }} </span>
      <el-button type="text" @click="cancelNav"><span style="color: #F56C6C;font-size: 22px;"> 取消导航</span></el-button>
    </el-card>
  </div>
</template>
    
<script>
import L, { marker } from "leaflet";
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

import i_marker from "./img/marker3.png"
import r_marker from "./img/robot1.png"

// import r_marker from "./img/marker3.png"
// import i_marker from "./img/robot1.png"
import MiniMap from "leaflet-minimap"; //鹰眼
//引入样式
import "leaflet-minimap/dist/Control.MiniMap.min.css";
import { mapState } from "vuex";
export default {
  data() {
    return {
      map: null,
      boundary: [],
      markerUrl: L.icon({
        iconUrl: i_marker,
        iconSize: [32, 32],
        iconAnchor: [12, 25],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
      markerRobot: L.icon({
        iconUrl: r_marker,
        iconSize: [32, 32],
        iconAnchor: [12, 25],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
      grid_sub:null,
      miniMap: null,
      drawnItems:null,
      drawControl:null,
      imageBounds: null,
      imageUrl: null,
      mapLayer:null,
      pathLayer:null,
      robotMarker:null,
      siteMarker:null,
      siteMarkers:[],
      dialogVisible:false,
      ruleForm: {
          name: '',
          pose:{
            position:{x:0,y:0,z:0},
            orientation:{w:0,x:0,y:0,z:0}
          },
          marker:null
      },
      rules: {
          name: [
            { required: true, message: '请输入site name', trigger: 'blur' },
            { min: 1, max: 16, message: '长度在 1 到 16 个字符', trigger: 'blur' }
          ],
          pose:[
            { required: true, message: 'pose不能为空'},
            { type: 'number', message: 'pose必须为数字值'}
          ]
      },
      mapHeight: window.innerHeight - 120,
      elcard:false,
      navSite:'P1站点',
      NavSiteGoal:null,
      poses: [
        {
          pose: {
            orientation:{y:0,x:0,z:0,w:0},
            position: {y:20,x:20,z:0}
          },
        },
        {
          pose: {
            orientation:{y:0,x:0,z:0,w:0},
            position: {y:21,x:20,z:0}
          },
        },
        {
          pose: {
            orientation:{y:0,x:0,z:0,w:0},
            position: {y:22,x:20,z:0}
          },
        },
        {
          pose: {
            orientation:{y:0,x:0,z:0,w:0},
            position: {y:23,x:20,z:0}
          },
        },
        {
          pose: {
            orientation:{y:0,x:0,z:0,w:0},
            position: {y:24,x:20,z:0}
          },
        },
        {
          pose: {
            orientation:{y:0,x:0,z:0,w:0},
            position: {y:25,x:20,z:0}
          },
        },
      ],
      plan_sub:null,
      polyline:null,
      NavFlag: true,
      img: new Image(),
      imgUrl: require('@/assets/empty.png'),
      w: null,
      h: null,
      mapGroup: null,
      basicMap: null,
      bounds: [],
    };
  },
  computed: {
    ...mapState("ros", ["ros",]),
  },
  mounted() {
    this.$nextTick(() => {
      // this.initMap();
      
      // this.drawMap()
    })
    this.connect();
    this.robotPose();// 机器人pose实时定位
    this.siteCollection();// 所有站点信息

    window.onresize = () => {
      this.mapHeight = window.innerHeight - 120;
    };

    window.deleteSite = this.deleteSite;
    window.editSite = this.editSite;
    window.NavSite = this.NavSite;

  },
  methods: {
    // 连接初始化
    connect() {

      // var m = window.q
      // if (condition) {
        
      // }

      // 在“map”div中创建一个地图，将视图设置到给定的位置并缩放
      this.map = L.map("map", {
        crs: L.CRS.Simple,
        minZoom: 3,
        maxZoom: 8,
        attributionControl: false,
        doubleClickZoom: false,  
        maxBoundsViscosity: 0.5, // 边界
      });
      

      // L.tileLayer('https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}').addTo(this.map);
      // var imageBounds = [[30.659269, 119.927920], [30.657906, 119.929502]];
      // var imageBounds = [[10, 10], [30, 30]];
      // var led = L.imageOverlay('img/led9.png', imageBounds, { opacity :0.5,zIndex: 1}).addTo(this.map);
      // console.log(led);

      this.map.getContainer().style.height =this.mapHeight+'px';
      window.onresize=()=>{ 
        this.map.getContainer().style.height =this.mapHeight +'px';
      };

      this.$bus.$on("mapName", () => this.changeMap());
      this.changeMap();
      this.setMarker()
      this.$bus.$on("pathLayers", (flag) => this.addDisplay(flag));

      this.$bus.$on("drawLayer", (isDraw) =>this.drawLayer(isDraw));

      // 图层
      // L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.jpg').addTo(this.map);

      // this.drawLayer();// 绘制图层
      
    },
    // 初始化地图
    initMap () {
      L.CRS.Simple.transformation = new L.transformation(1, 0, 1, 0) // 坐标原点切换为左上角
      this.map = L.map('map', {
        center: [0, 0],
        crs: L.CRS.Simple,
        zoomSnap: 0.1, // 比例可小数
        zoom: 0.5,
        maxZoom: 5,
        minZoom: -5,
        attributionControl: false
      })
      this.mapGroup = new L.LayerGroup()
    },
    // 导入地图
    drawMap () {
      this.img.src = this.imgUrl
      console.log(this.img);
      // 图片导入后操作
      this.img.onload = () => {
        // 设定图片像素范围为坐标范围
        this.w = this.img.width
        this.h = this.img.height
      console.log(this.w,this.h);

        this.bounds = [[0,0],[this.h,this.w]]
        this.basicMap = L.imageOverlay(this.imgUrl, this.bounds)
        this.mapGroup.addLayer(this.basicMap)
        this.map.addLayer(this.mapGroup)
      }
    },

    drawLayer(isDraw){
      // 创建绘制图层
      if(this.drawnItems) this.drawnItems.remove()
      this.drawnItems = new L.FeatureGroup();
      if(isDraw) this.map.addLayer(this.drawnItems);

      if(this.drawControl) this.drawControl.remove();
      // 添加绘制工具条
      this.drawControl = new L.Control.Draw({
        edit: {
          featureGroup: this.drawnItems
        },
        draw: {
          circle: true,
          circlemarker: true,
          polygon: {
            allowIntersection: false,
            showArea: true
          },
          polyline: true,
          rectangle: true,
          marker: true
        }
      });
      if(isDraw) this.map.addControl(this.drawControl);

      // 监听绘制完成事件
      this.map.on('draw:created', (event) => {
        const layer = event.layer;

        console.log(1)
        // 添加绘制的图层到图层组
        this.drawnItems.addLayer(layer);
      });
    },

    // delete站点
    deleteSite(id){
      const index = this.siteMarkers.findIndex((m)=>m.id==id);
        if(index > -1){
          this.$confirm(`此操作将永久删除该文件: ${id}`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            center: true,
            type: 'warning'
          }).then(() => {
            var del_site = new ROSLIB.Topic({ ros: this.ros, name: '/trig', messageType: 'std_msgs/Header'})
            console.log(this.siteMarkers[index].marker)
            this.map.removeLayer(this.siteMarkers[index].marker);

            del_site.publish({frame_id:`delete_site:${id}`});
            this.siteMarkers.splice(index,1);
            this.$message.success('删除成功!');
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            });          
          });
        }
    },

    // edit
    editForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var {name,pose,marker}=this.ruleForm;
          var {x,y}=pose.position;

          var change_site = new ROSLIB.Topic({
            ros: this.ros,
            name: '/trig',
            messageType: 'std_msgs/Header'
          })
          var poseJSON=JSON.stringify(pose);
          console.log(pose)
          var poseMsg = new ROSLIB.Message({seq:201,frame_id:`{"${name}":{"frame_id":"map","pose":${poseJSON}}}`});
          // console.log(poseMsg); 
          change_site.publish(poseMsg);
          this.map.removeLayer(marker);
          var siteMarker = L.marker([y, x], { icon:this.markerUrl,riseOnHover: true, }).addTo(this.map);
          siteMarker.bindPopup(`<b>${name}</b>`);
          this.dialogVisible=false;
        } else return false;
        });
      },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    // edit站点
    editSite(id){
      const markerData = this.siteMarkers.find((m)=>m.id==id);
      if(markerData){
        var pose =markerData.pose;
        var marker =markerData.marker;
        pose ={name:id,pose,marker}
        this.ruleForm = pose;
        this.dialogVisible = true;
      }
    },

    NavSite(id){
      this.navSite = id;
      const path = [];

      const markerData = this.siteMarkers.find((m)=>m.id==id);
      if(markerData){
        var pose =markerData.pose;

        var actionClient = new ROSLIB.ActionClient({
          ros : this.ros,
          actionName : 'move_base_msgs/MoveBaseAction',
          serverName : 'move_base'
        });

        // create a goal
        this.NavSiteGoal = new ROSLIB.Goal({
          actionClient : actionClient,
          goalMessage : {
            target_pose : {
              header : {
                frame_id : '/map'
              },
              pose : pose
            }
          }
        });
        this.NavSiteGoal.send();
        this.elcard = true;
        
        // this.NavSiteGoal.on('feedback', (feedback)=> {
        //   // console.log('Feedback: ', feedback);
        // });

        this.NavSiteGoal.on('result', (result)=> {
          this.elcard = false;
          if(this.NavFlag) this.$message.success(`到达${id}, 导航结束！`);
          
          if(this.polyline) this.polyline.remove();
          this.plan_sub.unsubscribe();
          console.log('Final Result: ', result);
          this.plan_snb = null;
          this.polyline = null;
          path = [];
        });

        // 订阅 move base plan 
        this.plan_sub = new ROSLIB.Topic({
          ros: this.ros,
          name: '/move_base/GlobalPlanner/plan',
          messageType: 'nav_msgs/Plan'
        });

        
        this.plan_sub.subscribe((msg)=> {
          const dot = msg.poses.map(p=>{return [p.pose.position.y, p.pose.position.x]});
          path.push(dot);
          console.log(path);

         
          this.polyline = L.polyline(path, {color: '#1ed300', weight:5, opacity:0.5}).addTo(this.map)
          
          this.polyline = L.polyline(path, {color: '#d0d2d5', weight:5, opacity:0.5}).addTo(this.map)
        })
      }
    },

    cancelNav(){
      this.NavSiteGoal.cancel();  
      this.NavFlag = false;
      this.$message('已取消导航！');
      // this.elcard = false;
      if(this.polyline) this.polyline.remove();
      this.plan_sub.unsubscribe();
    },

    // 所有站点信息
    siteCollection(){
      // 订阅 robot's site 
      var site_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/flexbe/site_collection',
        messageType: 'std_msgs/String'
      });

      site_sub.subscribe((msg)=> {
        msg = JSON.parse(msg.data);
        var site = msg.flexbe_site;
        var newMarkers = []

        for (const key in site) {
          const p = site[key].pose.position;
          this.siteMarker = L.marker([p.y, p.x], { icon:this.markerUrl,riseOnHover: true, }).addTo(this.map);
          // this.siteMarker.bindPopup(`<b>${key}</b>
          // <button class="el-button" onclick="editSite('${key}')">编辑</button>
          // <button class="el-button" style="background=red" onclick="deleteSite('${key}')">删除</button>
          // <button class="el-button" onclick="NavSite('${key}')">到这里</button>
          // `);
          this.siteMarker.bindPopup(`<b>${key}</b>
          <button class="el-button" onclick="NavSite('${key}')">导 航</button>
          `);
          newMarkers.push({
            id:key,
            pose: site[key].pose,
            marker:this.siteMarker
          })
        }
        this.siteMarkers = newMarkers
      })
    },

    // 添加站点信息
    setMarker(){
      var that = this;
      var markerName = 1;
      // 将定位点坐标发给ros
      this.map.on("dblclick",  (e)=> {
        var lng = e.latlng.lng;
        var lat = e.latlng.lat;
        console.log(lng, lat);

        // 超出地图标记点无效
        var boundaryX = this.boundary[1];
        var boundaryY = this.boundary[0];
        // console.log(boundaryX, boundaryY);
        // if(lng > boundaryX || lng < 0 || lat > boundaryY || lat < 0) return;

        if (e.latlng) {
          var addSite = new ROSLIB.Message({
            header: {
              stamp: new Date(),
              frame_id: this.mapName,
            },
            pose: {
              position: { x: lat, y: lng, z: 0 },
              orientation: { x: 0, y: 0, z: 0, w: 1 },
            },
          });

          var goal_pub = new ROSLIB.Topic({
            ros: that.ros,
            name: "/move_base_simple/goal",
            messageType: "geometry_msgs/PoseStamped",
          });

          goal_pub.publish(addSite);

          var marker = L.marker([lat, lng], { 
            icon: that.markerUrl,
           }).addTo(this.map);
          marker.bindPopup(`<b>P${markerName}</b>`);
          markerName++;
        }
      });
    },

    // 机器人实时位置信息
    robotPose(){
      // 订阅 robot's pose 
      var pose_sub = new ROSLIB.Topic({
        ros : this.ros,
        name : '/robot_pose',
        messageType : 'geometry_msgs/Pose'
      });

      pose_sub.subscribe((msg)=> {
        if(this.robotMarker) this.map.removeLayer(this.robotMarker);
        this.robotMarker = L.marker([0, 0],{ icon: this.markerRobot }).addTo(this.map);
        // Update the marker's position
        this.robotMarker.setLatLng([msg.position.y, msg.position.x]);
      });
    },
    
    // 添加路径图层
    addDisplay(flag){
      var { map }= this;

      // 订阅地图
      var grid_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: '/map_ostream_display',
        messageType: "scheduling_msgs/MapStream",
      });

      grid_sub.subscribe( (message)=> {
        console.log(message);
        // 地图显示
        var width = message.info.width;
        var height = message.info.height;
        var originX = message.info.origin.position.x;
        var originY = message.info.origin.position.y;
        var resolution =Number(message.info.resolution.toFixed(3));
        // 边界点
        var boundaryX = originX + width * resolution;
        var boundaryY = originY + height * resolution;

        this.imageBounds = [ [originY, originX], [boundaryY, boundaryX] ];
        this.boundary = [boundaryY, boundaryX];
        this.imageUrl = message.data;
        // console.log(imageBounds)

        if (this.pathLayer) this.map.removeLayer(this.pathLayer);
        this.pathLayer = L.imageOverlay(this.imageUrl, this.imageBounds,{opacity:0.5});
        if(flag) this.pathLayer.addTo(map);
        map.fitBounds(this.imageBounds);  // 图片居中显示
        map.setMaxBounds(this.imageBounds);// 边界
      });
    },

    // 切换地图
    changeMap(){
      var { map }= this;
      // console.log(this.ros);

      // 订阅地图
      var grid_sub = new ROSLIB.Topic({
        ros: this.ros,
        name: localStorage.mapName,
        messageType: "scheduling_msgs/MapStream",
      });

      grid_sub.subscribe( (message)=> {
        // 地图显示
        var width = message.info.width;
        var height = message.info.height;
        var originX = message.info.origin.position.x;
        var originY = message.info.origin.position.y;
        var resolution =Number(message.info.resolution.toFixed(3));
        // 边界点
        var boundaryX = originX + width * resolution;
        var boundaryY = originY + height * resolution;

        this.imageBounds = [ [originY, originX], [boundaryY, boundaryX] ];
        this.boundary = [boundaryY, boundaryX];
        this.imageUrl = message.data;
        // console.log(imageBounds)

        if (this.mapLayer) this.map.removeLayer(this.mapLayer);
        this.mapLayer = L.imageOverlay(this.imageUrl, this.imageBounds);
        this.mapLayer.addTo(map);
        map.fitBounds(this.imageBounds);  // 图片居中显示
        map.setMaxBounds(this.imageBounds);// 边界

        // 创建和添加鹰眼图层
        var miniMapLayer = L.imageOverlay(this.imageUrl, this.imageBounds, {
          interactive: false, // 控制图层是否响应用户交互
          attribution: null, // 用于指定图层的版权信息或来源
        });

        if(this.miniMap) this.miniMap.remove();
        this.miniMap = new L.Control.MiniMap(miniMapLayer, { 
          toggleDisplay: true, 
          minimized: true, 
          collapsedWidth: 30, // 箭头大小
          collapsedHeight: 30,
          crs: L.CRS.Simple
        }).addTo(map);
      });
    }
  },
};
</script>
    
  <style lang="less" scoped>

.leaflet-container {
  width: 100% !important; 
  // background: #fff;
  font-size: 20px;
  // 去掉canvas下的空格 兼容性
  display: -webkit-box; /* OLD - iOS 6-, Safari 3.1-6 */
  display: -moz-box; /* OLD - Firefox 19- (buggy but mostly works) */
  display: -ms-flexbox; /* TWEENER - IE 10 */
  display: -webkit-flex; /* NEW - Chrome */
  display: flex; /* NEW, Spec - Opera 12.1, Firefox 20+ */
}
::v-deep input::-webkit-outer-spin-button,::v-deep input::-webkit-inner-spin-button{
  -webkit-appearance: none !important;
}
::v-deep input[type='number']{
  line-height: 1;
  // -moz-appearance: textfield !important;
}
.el-col-1{
  text-align: center !important;
}
::v-deep .threeBtn .el-form-item__content{margin-left: 0 !important;}

::v-deep .leaflet-draw{
  margin-top: 320px;
}
::v-deep .leaflet-top, .leaflet-bottom {
    z-index: -1 !important;
}
.elcard{
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%,30%);
}
</style>
    