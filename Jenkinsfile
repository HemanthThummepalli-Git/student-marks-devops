pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "hemanththummepalli/student-marks-backend"
    KUBE_NAMESPACE = "student-marks"
    KUBE_CONFIG_CRED_ID = "kubeconfig"
    DOCKER_CRED_ID = "dockerhub-creds"
  }

  options { timestamps() }

  stages {
    
    stage('Checkout') {
      steps { 
        checkout scm 
      }
    }

    stage('Install & Unit Test') {
      steps {
        sh 'npm ci'
        sh 'npm test'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          TAG = "${env.BUILD_NUMBER}"
          IMAGE_TAG = "${DOCKER_IMAGE}:${TAG}"
          sh "docker build -t ${IMAGE_TAG} ."
        }
      }
    }

    stage('Push Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_CRED_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh """
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
            docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest || true
            docker push ${DOCKER_IMAGE}:latest || true
          """
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: "${KUBE_CONFIG_CRED_ID}", variable: 'KUBECONFIG_FILE')]) {
          sh """
            mkdir -p \$HOME/.kube
            cp \$KUBECONFIG_FILE \$HOME/.kube/config
            
            kubectl get ns ${KUBE_NAMESPACE} || kubectl create namespace ${KUBE_NAMESPACE}

            kubectl set image deployment/student-marks-app student-marks-app=${DOCKER_IMAGE}:${BUILD_NUMBER} -n ${KUBE_NAMESPACE} || \
            kubectl apply -f k8s/app-deployment.yaml -n ${KUBE_NAMESPACE}

            kubectl apply -f k8s/mongo-deployment.yaml -n ${KUBE_NAMESPACE} || true
            kubectl apply -f k8s/mongo-service.yaml -n ${KUBE_NAMESPACE} || true

            kubectl apply -f k8s/app-service.yaml -n ${KUBE_NAMESPACE}

            kubectl rollout status deployment/student-marks-app -n ${KUBE_NAMESPACE} --timeout=120s
          """
        }
      }
    }

    stage('Integration Tests (Newman)') {
      steps {
        echo "Skipping cluster URL discovery for Windows Jenkins."

        sh """
          docker run --rm -v \$PWD:/etc/newman -t postman/newman:alpine \
          newman run /etc/newman/postman_collection.json \
          --reporters cli,junit
        """
      }
    }

  }

  post {
    success { echo "Pipeline finished successfully" }
    failure { echo "Pipeline failed — check logs" }
    always { 
      sh 'docker image prune -f || true' 
    }
  }
}
