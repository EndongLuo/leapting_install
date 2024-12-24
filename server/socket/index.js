const IO = require('socket.io');

const { XJNamespace } = require('./XJnsp');
const QS = require('./QSnsp');
function creatSocket(app) {
  const io = IO(app);

  XJNamespace(io);
  QS(io);

}

module.exports = creatSocket