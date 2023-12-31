/**
   * @author Luke Luo
   */
  
  /**
   * flexbe
   *
   * @constructor
   * @param options - 具有以下键的对象:
   *   * ros-ROSLIB.ros 连接手柄
   *   * serverName（可选）- 用于导航的操作服务器名称，如“/flexbe/execute_behavior”
   *   * actionName（可选）- 导航操作名称，如“flexbe_msgs/BehaviorExecutionAction”
   *   * rootObject（可选）- 要向其中添加单击侦听器和渲染robot标记的根对象
   *   * withOrientation（可选）- 如果导航器应考虑机器人方向（默认值：false）
   */
  Flexbe = function(options) {
    var that = this;
    options = options || {};
    var ros = options.ros;
    var serverName = options.serverName || '/flexbe/execute_behavior';
    var actionName = options.actionName || 'flexbe_msgs/BehaviorExecutionAction';
    var withOrientation = options.withOrientation || false;
    this.rootObject = options.rootObject || new createjs.Container();
    var goalMessage = options.goalMessage || {};
  
    // setup the actionlib client
    var actionClient = new ROSLIB.ActionClient({
      ros : ros,
      actionName : actionName,
      serverName : serverName
    });

    var goal = new ROSLIB.Goal({
        actionClient : actionClient,
        goalMessage : goalMessage 
      });

    goal.send();
    // goal.cancel(); 

    goal.on('feedback', function(feedback) {
        console.log('Feedback: ', feedback);
    });

    // goal.on('status', function(status) {
    //     console.log('status: ', status);
    // });

    goal.on('result', function(result) {
        console.log('Final Result: ', result);
    });

    /**
     * Send a goal to the navigation stack with the given pose.
     *
     * @param pose - the goal pose
     */
    // function sendGoal(pose) {
    //   // create a goal
    //   var goal = new ROSLIB.Goal({
    //     actionClient : actionClient,
    //     goalMessage : {
    //         behavior_name : 'door_open'
    //     }
    //   });
    //   goal.send();
  
    //   // create a marker for the goal
    //   var goalMarker = new ROS2D.NavigationArrow({
    //     size : 15,
    //     strokeSize : 1,
    //     fillColor : createjs.Graphics.getRGB(255, 64, 128, 0.66),
    //     pulse : true
    //   });
    //   goalMarker.x = pose.position.x;
    //   goalMarker.y = -pose.position.y;
    //   goalMarker.rotation = stage.rosQuaternionToGlobalTheta(pose.orientation);
    //   goalMarker.scaleX = 1.0 / stage.scaleX;
    //   goalMarker.scaleY = 1.0 / stage.scaleY;
    //   that.rootObject.addChild(goalMarker);
  
    //   goal.on('result', function() {
    //     that.rootObject.removeChild(goalMarker);
    //   });
    // }
  
    // // get a handle to the stage
    // var stage;
    // if (that.rootObject instanceof createjs.Stage) {
    //   stage = that.rootObject;
    // } else {
    //   stage = that.rootObject.getStage();
    // }
  
    // // marker for the robot
    // var robotMarker = new ROS2D.NavigationArrow({
    //   size : 25,
    //   strokeSize : 1,
    //   fillColor : createjs.Graphics.getRGB(255, 128, 0, 0.66),
    //   pulse : true
    // });
    // // wait for a pose to come in first
    // robotMarker.visible = false;
    // this.rootObject.addChild(robotMarker);
    // var initScaleSet = false;
  
    // // setup a listener for the robot pose
    // var poseListener = new ROSLIB.Topic({
    //   ros : ros,
    //   name : '/robot_pose',
    //   messageType : 'geometry_msgs/Pose',
    //   throttle_rate : 100
    // });
    // poseListener.subscribe(function(pose) {
    //   // update the robots position on the map
    //   robotMarker.x = pose.position.x;
    //   robotMarker.y = -pose.position.y;
    //   if (!initScaleSet) {
    //     robotMarker.scaleX = 1.0 / stage.scaleX;
    //     robotMarker.scaleY = 1.0 / stage.scaleY;
    //     initScaleSet = true;
    //   }
  
    //   // change the angle
    //   robotMarker.rotation = stage.rosQuaternionToGlobalTheta(pose.orientation);
  
    //   robotMarker.visible = true;
    // });
  
    // if (withOrientation === false){
    //   // setup a double click listener (no orientation)
    //   this.rootObject.addEventListener('dblclick', function(event) {
    //     // convert to ROS coordinates
    //     var coords = stage.globalToRos(event.stageX, event.stageY);
    //     var pose = new ROSLIB.Pose({
    //       position : new ROSLIB.Vector3(coords)
    //     });
    //     // send the goal
    //     sendGoal(pose);
    //   });
    // } else { // withOrientation === true
    //   // setup a click-and-point listener (with orientation)
    //   var position = null;
    //   var positionVec3 = null;
    //   var thetaRadians = 0;
    //   var thetaDegrees = 0;
    //   var orientationMarker = null;
    //   var mouseDown = false;
    //   var xDelta = 0;
    //   var yDelta = 0;
  
    //   var mouseEventHandler = function(event, mouseState) {
  
    //     if (mouseState === 'down'){
    //       // get position when mouse button is pressed down
    //       position = stage.globalToRos(event.stageX, event.stageY);
    //       positionVec3 = new ROSLIB.Vector3(position);
    //       mouseDown = true;
    //     }
    //     else if (mouseState === 'move'){
    //       // remove obsolete orientation marker
    //       that.rootObject.removeChild(orientationMarker);
          
    //       if ( mouseDown === true) {
    //         // if mouse button is held down:
    //         // - get current mouse position
    //         // - calulate direction between stored <position> and current position
    //         // - place orientation marker
    //         var currentPos = stage.globalToRos(event.stageX, event.stageY);
    //         var currentPosVec3 = new ROSLIB.Vector3(currentPos);
  
    //         orientationMarker = new ROS2D.NavigationArrow({
    //           size : 25,
    //           strokeSize : 1,
    //           fillColor : createjs.Graphics.getRGB(0, 255, 0, 0.66),
    //           pulse : false
    //         });
  
    //         xDelta =  currentPosVec3.x - positionVec3.x;
    //         yDelta =  currentPosVec3.y - positionVec3.y;
            
    //         thetaRadians  = Math.atan2(xDelta,yDelta);
  
    //         thetaDegrees = thetaRadians * (180.0 / Math.PI);
            
    //         if (thetaDegrees >= 0 && thetaDegrees <= 180) {
    //           thetaDegrees += 270;
    //         } else {
    //           thetaDegrees -= 90;
    //         }
  
    //         orientationMarker.x =  positionVec3.x;
    //         orientationMarker.y = -positionVec3.y;
    //         orientationMarker.rotation = thetaDegrees;
    //         orientationMarker.scaleX = 1.0 / stage.scaleX;
    //         orientationMarker.scaleY = 1.0 / stage.scaleY;
            
    //         that.rootObject.addChild(orientationMarker);
    //       }
    //     } else if (mouseDown) { // mouseState === 'up'
    //       // if mouse button is released
    //       // - get current mouse position (goalPos)
    //       // - calulate direction between stored <position> and goal position
    //       // - set pose with orientation
    //       // - send goal
    //       mouseDown = false;
  
    //       var goalPos = stage.globalToRos(event.stageX, event.stageY);
  
    //       var goalPosVec3 = new ROSLIB.Vector3(goalPos);
          
    //       xDelta =  goalPosVec3.x - positionVec3.x;
    //       yDelta =  goalPosVec3.y - positionVec3.y;
          
    //       thetaRadians  = Math.atan2(xDelta,yDelta);
          
    //       if (thetaRadians >= 0 && thetaRadians <= Math.PI) {
    //         thetaRadians += (3 * Math.PI / 2);
    //       } else {
    //         thetaRadians -= (Math.PI/2);
    //       }
          
    //       var qz =  Math.sin(-thetaRadians/2.0);
    //       var qw =  Math.cos(-thetaRadians/2.0);
          
    //       var orientation = new ROSLIB.Quaternion({x:0, y:0, z:qz, w:qw});
          
    //       var pose = new ROSLIB.Pose({
    //         position :    positionVec3,
    //         orientation : orientation
    //       });
    //       // send the goal
    //       sendGoal(pose);
    //     }
    //   };
  
    //   this.rootObject.addEventListener('stagemousedown', function(event) {
    //     mouseEventHandler(event,'down');
    //   });
  
    //   this.rootObject.addEventListener('stagemousemove', function(event) {
    //     mouseEventHandler(event,'move');
    //   });
  
    //   this.rootObject.addEventListener('stagemouseup', function(event) {
    //     mouseEventHandler(event,'up');
    //   });
    // }
  };