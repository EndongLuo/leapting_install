const schedule = require('node-schedule');
const { getTimedTask, updateTimedTaskState, setTaskInfo } = require('../models/task');
const { robotArr } = require('../socket/XJnsp');

const TimedTaskFn = async () => {
  try {
    const now = new Date();
    const tasks = await getTimedTask(0, 0, 0, 0, 0);

    if (tasks.length === 0) {
      // console.log('没有需要执行的定时任务');
      return;
    }

    // 过滤和排序任务
    const pastTasks = tasks
      .filter(task => new Date(task.start_time) <= now)
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    if (pastTasks.length > 0) {
      const nearestTask = pastTasks[0];

      if (pastTasks.length > 1) {
        const pastTaskIds = pastTasks.slice(1).map(task => task.id);
        await updateTimedTaskState(pastTaskIds, 3); // 批量更新状态
      }

      if (nearestTask) {
        const { ip } = nearestTask.task.robot;
        const { id, taskId, task: { nodes, done_nodes, task_name, recognition_type, isback } } = nearestTask;

        console.log("最接近的任务ID:", id, taskId, ip);

        const nodeList = nodes.split(',');
        const taskDetail = {
          id, task_type: 1,
          recognition_type: Number(recognition_type),
          task_name,
          task_nodes: nodeList,
          back_node: isback,
        }
        if (recognition_type == 5) {
          const doneNodeList = done_nodes.split(',');

          // 利用Set和数组方法来获取补集
          const resultSet = new Set(nodeList.filter(x => !doneNodeList.includes(x)));
          taskDetail.task_nodes = Array.from(resultSet);
        }

        if (robotArr[ip]?.rosConnect) {
          try {
            await new Promise((resolve, reject) => {
              robotArr[ip].taskState(msg => {
                // console.log('taskState msg', msg.task_type);
                if (msg.task_type == 1 || msg.task_type == 2) reject('任务执行中');
                else resolve();
                // resolve()
              });
            });

            robotArr[ip].sendTask(taskDetail);

            await setTaskInfo({ id, task_odom: 0, task_state: 1, taskId });

            var da = await updateTimedTaskState([id], 2); // 更新最近任务的状态
            console.log('定时任务执行成功:', da);

          } catch (error) {
            console.log('发送任务失败:', error);
            await updateTimedTaskState([id], 3); // 更新最近任务的状态
          }
        } else {
          console.log('机器人未连接');
          await updateTimedTaskState([id], 3); // 更新最近任务的状态
        }
      }
    }
  } catch (error) {
    console.error('定时任务执行失败:', error);
  }
}

const scheduleDataUpdate = () => {
  schedule.scheduleJob('1 * * * * *', TimedTaskFn);

  schedule.scheduleJob('31 * * * * *', TimedTaskFn);
}

module.exports = scheduleDataUpdate;