let defaultTarget = 'http://localhost:5000';
module.exports = [
  {
    context: ['/api/**'],
    target: defaultTarget,
    secure: false,
  }
];