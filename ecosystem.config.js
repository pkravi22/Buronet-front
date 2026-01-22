module.exports = {
  apps : [{
    name: "buronet-app",
    script: "npm",
    args: "start",
    env: {
        NEXT_PUBLIC_DOTNET_BACKEND_BASE: "http://buronet-service-env.eba-btarxmsr.eu-north-1.elasticbeanstalk.com/api"
        NEXT_PUBLIC_JOBS_BACKEND_BASE: 'http://buronet-jobs-env.eba-btarxmsr.eu-north-1.elasticbeanstalk.com/api'
        NEXT_PUBLIC_BYTES_BACKEND_BASE: 'http://buronet-bytes-service.eba-btarxmsr.eu-north-1.elasticbeanstalk.com/api'
        NEXT_PUBLIC_MESSAGING_BACKEND_BASE: 'http://buronet-messaging-env.eba-btarxmsr.eu-north-1.elasticbeanstalk.com/api'
        NEXT_PUBLIC_MESSAGE_SERVICE_BASE_URL: 'http://buronet-messaging-env.eba-btarxmsr.eu-north-1.elasticbeanstalk.com'
        MONGO_URI: 'mongodb+srv://shobhit9887:0aX62ECWzZ4sOrzb@cluster0.uo5qhgj.mongodb.net/job_postings_db?retryWrites=true&w=majority&appName=Cluster0'
    }
  }]
}