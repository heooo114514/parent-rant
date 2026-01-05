const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../parent-rant.config.json');

// Read config
function readConfig() {
  if (!fs.existsSync(configPath)) {
    console.error('Config file not found!');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Write config
function writeConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

const command = process.argv[2];
const arg = process.argv[3];

const config = readConfig();

switch (command) {
  case 'add-admin':
    if (!arg) {
      console.error('Please provide an email address.');
      process.exit(1);
    }
    if (config.security.adminEmails.includes(arg)) {
      console.log(`Email ${arg} is already an admin.`);
    } else {
      config.security.adminEmails.push(arg);
      writeConfig(config);
      console.log(`Added ${arg} to admin whitelist.`);
    }
    break;

  case 'remove-admin':
    if (!arg) {
      console.error('Please provide an email address.');
      process.exit(1);
    }
    if (!config.security.adminEmails.includes(arg)) {
      console.log(`Email ${arg} is not in the admin list.`);
    } else {
      config.security.adminEmails = config.security.adminEmails.filter(email => email !== arg);
      writeConfig(config);
      console.log(`Removed ${arg} from admin whitelist.`);
    }
    break;

  case 'list-admins':
    console.log('Current Admin Whitelist:');
    config.security.adminEmails.forEach(email => console.log(`- ${email}`));
    break;

  default:
    console.log('Usage:');
    console.log('  npm run manage add-admin <email>');
    console.log('  npm run manage remove-admin <email>');
    console.log('  npm run manage list-admins');
    break;
}