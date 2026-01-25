const bcrypt = require('bcryptjs');

async function run() {
    const hash = await bcrypt.hash('1234', 10);
    console.log(`Hash for 1234: ${hash}`);
}

run();
