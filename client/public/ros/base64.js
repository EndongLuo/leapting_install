/**
 * @author Luke Luo
 */

/**
 * OccupancyGrid可以将ROS占用网格消息转换为createjs Bitmap对象。
 * 
 * @constructor
 * @param options - 具有以下键的对象:
 *   * message - 占位网格信息 
 */

ROS2D.OccupancyGrid = function (options) {
    options = options || {};
    var message = options.message;

    // console.time("time")
  
    // 内部绘图画布
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
  
    //  保存我们需要的元数据
    this.pose = new ROSLIB.Pose({
      position: message.info.origin.position, // 位置
      orientation: message.info.origin.orientation  // 方向
    });
  
    // 设置大小
    this.width = message.info.width;
    this.height = message.info.height;
    canvas.width = this.width;
    canvas.height = this.height;
  
    if (typeof message.data === 'string') {
      var image = new Image();
      image.src = message.data;
      image.onload = function () {
        context.drawImage(image, 0, 0);
      };
      // console.timeEnd("time")
    } else {
      var imageData = context.createImageData(this.width, this.height);
      for (var row = 0; row < this.height; row++) {
        for (var col = 0; col < this.width; col++) {
          // 确定地图数据的索引
          var mapI = col + ((this.height - row - 1) * this.width);
          // 确定值
          var data = message.data[mapI];
          var val;
          if (data === 100) {
            val = 0;
          } else if (data === 0) {
            val = 255;
          } else {
            val = 127;
          }
  
          // 确定图像数据数组的索引
          var i = (col + (row * this.width)) * 4;
          imageData.data[i] = val;
          imageData.data[++i] = val;
          imageData.data[++i] = val;
          imageData.data[++i] = 255;
        }
      }
      context.putImageData(imageData, 0, 0);
    }
  
    // 创建 bitmap
    createjs.Bitmap.call(this, canvas);
    // 改变Y轴方向
    this.y = -this.height * message.info.resolution;
  
    // 缩放图片
    this.scaleX = message.info.resolution;
    this.scaleY = message.info.resolution;
    this.width *= this.scaleX;
    this.height *= this.scaleY;
  
    // 设置姿态
    this.x += this.pose.position.x;
    this.y -= this.pose.position.y;
    // console.timeEnd("time")
  };
  ROS2D.OccupancyGrid.prototype.__proto__ = createjs.Bitmap.prototype;

/**
 * @author Luke Luo
 */

/**
 * 监听给定占位网格主题的地图。
 * 
 * 发出以下事件：
 *   * 'change' - 地图中有更新或更改
 * @constructor
 * @param options - 具有以下键的对象:
 *   * ros - the ROSLIB.Ros 连接
 *   * topic (optional) - 要接收的地图topic
 *   * rootObject (optional) - 要将此标记添加到的根对象
 *   * continuous (optional) - 如果映射应连续加载（例如，对于SLAM）
 */

ROS2D.Base64MapClient = function (options) {
    var that = this;
    options = options || {};
    var ros = options.ros;
    var topic = options.topic || '/map';
    this.continuous = options.continuous;
    this.rootObject = options.rootObject || new createjs.Container();

    // 显示的当前网格.
    // 创建一个空形状开始，以便顺序保持正确。
    this.currentGrid = new createjs.Shape();
    this.rootObject.addChild(this.currentGrid);
    // 解决easeljs中的错误——需要第二个对象来正确渲染
    this.rootObject.addChild(new ROS2D.Grid({ size: 1 }));

    // 订阅该主题
    var rosTopic = new ROSLIB.Topic({
        ros: ros,
        name: topic,
        messageType: 'scheduling_msgs/MapStream'
    });

    rosTopic.subscribe(function (message) {
        // 检查旧地图
        var index = null;
        if (that.currentGrid) {
            index = that.rootObject.getChildIndex(that.currentGrid);
            that.rootObject.removeChild(that.currentGrid);
        }

        that.currentGrid = new ROS2D.OccupancyGrid({
            message: message
        });
        if (index !== null) {
            that.rootObject.addChildAt(that.currentGrid, index);
        }
        else {
            that.rootObject.addChild(that.currentGrid);
        }

        that.emit('change');

        // 检查我们是否应该取消订阅
        if (!that.continuous) {
            // rosTopic.unsubscribe();
        }

    });
};
ROS2D.Base64MapClient.prototype.__proto__ = EventEmitter2.prototype;


/**
 * @author Luke Luo
 */

/**
 * Base64ClientNav使用Base64Client创建地图以供导航器使用。
 *
 * @constructor
 * @param options - 具有以下键的对象:
 *   * ros - the ROSLIB.Ros 连接 handle
 *   * topic (optional) - 要接收的地图topic
 *   * rootObject (optional) - 要将此标记添加到的根对象
 *   * continuous (optional) - 如果映射应连续加载（例如，对于SLAM）
 *   * serverName (optional) - 用于导航的操作服务器名称，如“/move_base”
 *   * actionName (optional) - 导航操作名称，如“move_base_msgs/MoveBaseAction”
 *   * rootObject (optional) - 要向其中添加单击侦听器和渲染robot标记的根对象
 *   * withOrientation (optional) - 如果导航器应考虑机器人方向（默认值：false）
 *   * viewer - 要渲染到的主查看器
 */
NAV2D.Base64ClientNav = function (options) {
    var that = this;
    options = options || {};
    this.ros = options.ros;
    var topic = options.topic || '/map';
    var continuous = options.continuous;
    this.serverName = options.serverName || '/move_base';
    this.actionName = options.actionName || 'move_base_msgs/MoveBaseAction';
    this.rootObject = options.rootObject || new createjs.Container();
    this.viewer = options.viewer;
    this.withOrientation = options.withOrientation || false;

    this.navigator = null;

    // console.log('Base64ClientNav++++topic+++', topic)
    // console.time("time")


    var client = new ROS2D.Base64MapClient({
        ros: this.ros,
        rootObject: this.rootObject,
        continuous: continuous,
        topic: topic
    });

    client.on('change', function () {
        that.navigator = new NAV2D.Navigator({
            ros: that.ros,
            serverName: that.serverName,
            actionName: that.actionName,
            rootObject: that.rootObject,
            withOrientation: that.withOrientation
        });

        // 缩放查看器以适应地图
        that.viewer.scaleToDimensions(client.currentGrid.width, client.currentGrid.height);
        that.viewer.shift(client.currentGrid.pose.position.x, client.currentGrid.pose.position.y);
    });
    // console.timeEnd("time")

};