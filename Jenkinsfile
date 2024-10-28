pipeline {
    agent any 
    
    stages { 
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/AdiGithub23/Smart-Agro-Server.git'
                }
            }
        }
        stage('Build Docker Image') {
            steps {  
                bat 'docker build -t adhidocker23/smart-server-1:%BUILD_NUMBER% .'
            }
        }
        stage('Verify Docker Image') {
            steps {
                script {
                    bat 'docker images'
                }
            }
        }
        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'test-dockerhubpwd', variable: 'test_dockerhubpwd')]) {
                    script {
                        bat "docker login -u adhidocker23 -p %test_dockerhubpwd%"
                    }
                }
            }
        }
        stage('Push Image') {
            steps {
                bat 'docker push adhidocker23/smart-server-1:%BUILD_NUMBER%'
            }
        }
    }
    post {
        always {
            echo 'Cleaning up...'
            bat 'docker logout'
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
