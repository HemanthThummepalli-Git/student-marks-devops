pipeline {
  agent any
  environment {
    DOCKERHUB = credentials('dockerhub-credentials') // add in Jenkins credentials
    IMAGE_BACKEND = "${DOCKERHUB_USR}/backend:${env.BUILD_NUMBER}"
    IMAGE_FRONTEND = "${DOCKERHUB_USR}/frontend:${env.BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build images') {
      steps {
        sh "docker build -t ${IMAGE_BACKEND} ./backend"
        sh "docker build -t ${IMAGE_FRONTEND} ./frontend"
      }
    }
    stage('Push images') {
      steps {
        sh "echo ${DOCKERHUB_PSW} | docker login -u ${DOCKERHUB_USR} --password-stdin"
        sh "docker push ${IMAGE_BACKEND}"
        sh "docker push ${IMAGE_FRONTEND}"
      }
    }
    stage('Deploy to k8s') {
      steps {
        // requires kubectl configured in Jenkins agent or use Kubernetes plugin to run
        sh "kubectl set image deployment/backend backend=${IMAGE_BACKEND} --record || kubectl apply -f k8s/backend-deployment.yaml"
        sh "kubectl set image deployment/frontend frontend=${IMAGE_FRONTEND} --record || kubectl apply -f k8s/frontend-deployment.yaml"
      }
    }
  }
}
