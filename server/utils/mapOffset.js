const { getMapOffset } = require('../models/siteMap');

class MapTransformer {
  // static mapoffset = { tx: 0, ty: 0, theta: 0, to: 0 };
  static mapoffsets = {};

  // 获取地图偏移量
  static async loadSiteInfo(ctx) {
    const { siteId } = ctx.query;
    try {
      const res = await getMapOffset(siteId);
      if (!res || res.length === 0) {
        ctx.body = { code: 400, msg: '获取失败' };
        return;
      }
      
      // this.updateMapOffset(siteId, res[0].mapoffset);
      this.mapoffsets[siteId] = res[0].mapoffset;
      console.log(`updateMapOffset: ${siteId}`, this.mapoffsets);

      ctx.body = { code: 200, msg: '获取成功', data: res };
    } catch (error) {
      console.error(`loadSiteInfo: ${siteId}`, error);
      ctx.body = { code: 500, msg: '服务器错误' };
    }
  }

  static updateMapOffset(siteId, newMapOffset) {
    console.log(`updateMapOffset: ${siteId}`, newMapOffset);

    if (!this.mapoffsets[siteId]) {
      this.mapoffsets[siteId] = { tx: 0, ty: 0, theta: 0, to: 0 };
    }
    if (newMapOffset && typeof newMapOffset === 'object') {
      Object.keys(this.mapoffsets[siteId]).forEach(key => {
        if (key in newMapOffset) {
          this.mapoffsets[siteId][key] = parseFloat(newMapOffset[key]);
        }
      });
    }
    console.log(`mapoffsets: ${siteId}`, this.mapoffsets);
  }

  static getMapOffset(siteId) {
    // console.log('getMapOffset-------------', this.mapoffsets);
    return this.mapoffsets[siteId] || { tx: 0, ty: 0, theta: 0, to: 0 };
  }


  mapOffset(poses, points, siteId) {
    if (points) return points.map(i => this.poseFn(i, siteId));
    if (Array.isArray(poses)) return poses.map(i => ({
      pose: { position: this.poseFn(i.pose.position, siteId), orientation: this.orienteFn(i.pose.orientation, siteId) }
    }));
    else return { position: this.poseFn(poses.position, siteId), orientation: this.orienteFn(poses.orientation, siteId) };
  }

  mapInverseOffset(poses, siteId) {
    if (Array.isArray(poses)) return poses.map(i => ({
      pose: { position: this.poseInverseFn(i.pose.position, siteId), orientation: this.orienteInverseFn(i.pose.orientation, siteId) }
    }));
    else return { position: this.poseInverseFn(poses.position, siteId), orientation: this.orienteInverseFn(poses.orientation, siteId) };
  }

  // 点位正转换
  poseFn({ x, y }, siteId) {
    const { tx, ty, theta } = MapTransformer.getMapOffset(siteId);
    return {
      x: Math.cos(theta) * (x - tx) + Math.sin(theta) * (y - ty),
      y: -Math.sin(theta) * (x - tx) + Math.cos(theta) * (y - ty),
    };
  }

  // 点位逆转换
  poseInverseFn({ x, y }, siteId) {
    const { tx, ty, theta } = MapTransformer.getMapOffset(siteId);
    return {
      x: Math.cos(theta) * x - Math.sin(theta) * y + tx,
      y: Math.sin(theta) * x + Math.cos(theta) * y + ty,
      z: 0,
    };
  }

  // 方向正转换
  orienteFn(orientation, siteId) {
    const { theta, to } = MapTransformer.getMapOffset(siteId);
    // console.log('theta', theta, 'to', to, 'siteId', siteId); 

    var { yaw } = this.quaternionToEuler(orientation);
    yaw = -(yaw + theta) * 180 / Math.PI - to;
    return yaw;
  }

  // 方向逆转换
  orienteInverseFn(yaw, siteId) {
    const { theta, to } = MapTransformer.getMapOffset(siteId);
    yaw = -(yaw + to) * Math.PI / 180 - theta;
    return this.eulerToQuaternion(0, 0, yaw);
  }

  // 四元数到欧拉角的转换
  quaternionToEuler({ x, y, z, w }) {
    const roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (x ** 2 + y ** 2));
    const pitch = Math.asin(2 * (w * y - z * x));
    const yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y ** 2 + z ** 2));

    return { roll, pitch, yaw };
  }

  // 欧拉角到四元数的转换
  eulerToQuaternion(roll, pitch, yaw) {
    const cy = Math.cos(yaw / 2);
    const sy = Math.sin(yaw / 2);
    const cp = Math.cos(pitch / 2);
    const sp = Math.sin(pitch / 2);
    const cr = Math.cos(roll / 2);
    const sr = Math.sin(roll / 2);

    const w = cr * cp * cy + sr * sp * sy;
    const x = sr * cp * cy - cr * sp * sy;
    const y = cr * sp * cy + sr * cp * sy;
    const z = cr * cp * sy - sr * sp * cy;

    return { x, y, z, w };
  }
}

module.exports = MapTransformer;