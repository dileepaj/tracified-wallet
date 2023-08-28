pipeline {
    agent any
    tools { nodejs 'nodejs-18' }

    stages {
        stage("Build") {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci'

                script {
                    scriptModule = load 'scripts/Upload.Groovy'
                }
            }
        }

        stage('Deploy to QA') {
            when {
                branch 'master'
            }
            steps {
                sh 'npm run build-qa'
                script {
                    scriptModule.uploadToGCB('gs://qa.wallet.tracified.com')
                }
            }
        }

        //stage('Deploy to Staging') {
        //    when {
        //        branch 'master'
        //    }
        //    steps {
        //        sh 'npm run build-staging'
        //        script {
        //            scriptModule.uploadToGCB('gs://staging.wallet.tracified.com')
        //        }
        //    }
        //}

    }
    post {
        always {
            echo 'Process finished'
            discordSend(
                description: "Tracified Wallet - ${currentBuild.currentResult}",
                footer: "#${env.BUILD_ID} ${currentBuild.getBuildCauses()[0].shortDescription}",
                link: env.BUILD_URL,
                result: currentBuild.currentResult,
                title: JOB_NAME,
                webhookURL: env.DISCORD_BUILD
            )
        }
    }
}