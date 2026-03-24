const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');

User.hasMany(Job, { foreignKey: 'postedById', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'postedById', as: 'postedBy' });

User.hasMany(Application, { foreignKey: 'applicantId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'applicantId', as: 'applicant' });

Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

module.exports = { User, Job, Application };
