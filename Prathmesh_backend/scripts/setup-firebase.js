const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Firebase Setup Wizard');
console.log('----------------------');

const questions = [
  {
    name: 'project_id',
    message: 'Enter your Firebase project ID:'
  },
  {
    name: 'private_key_id',
    message: 'Enter your private key ID:'
  },
  {
    name: 'private_key',
    message: 'Enter your private key (it will be hidden):',
    hidden: true
  },
  {
    name: 'client_email',
    message: 'Enter your client email:'
  },
  {
    name: 'client_id',
    message: 'Enter your client ID:'
  },
  {
    name: 'auth_uri',
    message: 'Enter auth URI (press Enter for default):',
    default: 'https://accounts.google.com/o/oauth2/auth'
  },
  {
    name: 'token_uri',
    message: 'Enter token URI (press Enter for default):',
    default: 'https://oauth2.googleapis.com/token'
  },
  {
    name: 'auth_provider_x509_cert_url',
    message: 'Enter auth provider cert URL (press Enter for default):',
    default: 'https://www.googleapis.com/oauth2/v1/certs'
  },
  {
    name: 'client_x509_cert_url',
    message: 'Enter client cert URL:'
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    // All questions answered, create the file
    const config = {
      type: 'service_account',
      ...answers,
      universe_domain: 'googleapis.com'
    };

    const configDir = path.join(__dirname, '..', 'src', 'config');
    const filePath = path.join(configDir, 'serviceAccountKey.json');

    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Write the config file
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    console.log(`\n✅ Firebase configuration saved to: ${filePath}`);
    console.log('\n📝 Please add the following to your .env file:');
    console.log(`FIREBASE_STORAGE_BUCKET=${answers.project_id}.appspot.com\n`);
    
    rl.close();
    return;
  }

  const question = questions[index];
  const prompt = question.message + (question.default ? ` [${question.default}]` : '') + ': ';
  
  rl.question(prompt, (answer) => {
    if (answer || question.default) {
      answers[question.name] = answer || question.default;
      // Clean up private key formatting
      if (question.name === 'private_key') {
        answers[question.name] = answers[question.name].replace(/\\n/g, '\n');
      }
    }
    askQuestion(index + 1);
  });
}

// Start asking questions
askQuestion(0);
