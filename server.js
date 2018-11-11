const app = require('./server/index');
const { zserver } = require('./server/zserver');

const { port } = require('./config');

app.listen(port, () => console.log(`Listening on port ${port}!`));
