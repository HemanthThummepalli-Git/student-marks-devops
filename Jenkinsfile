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
      steps { checkout scm }
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
          TAG = "${env.BUILD_NUMBER ?: 'local'}"
          IMAGE_TAG = "${DOCKER_IMAGE}:${TAG}"
          sh "docker build -t ${IMAGE_TAG} ."
        }
      }
    }

    stage('Push Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_CRED_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
          sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
          sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest || true"
          sh "docker push ${DOCKER_IMAGE}:latest || true"
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: "${KUBE_CONFIG_CRED_ID}", variable: 'KUBECONFIG_FILE')]) {
          sh '''
            mkdir -p $HOME/.kube
            cp $KUBECONFIG_FILE $HOME/.kube/config
            kubectl -n ${KUBE_NAMESPACE} get ns || kubectl apply -f k8s/namespace.yaml
            # Adjust image in deployment to use new tag
            kubectl set image deployment/student-marks-app student-marks-app=${DOCKER_IMAGE}:${BUILD_NUMBER} -n ${KUBE_NAMESPACE} || kubectl apply -f k8s/app-deployment.yaml -n ${KUBE_NAMESPACE}
            kubectl apply -f k8s/app-service.yaml -n ${KUBE_NAMESPACE}
            kubectl rollout status deployment/student-marks-app -n ${KUBE_NAMESPACE} --timeout=120s
          '''
        }
      }
    }

    stage('Integration Tests (Newman)') {
      steps {
       
        sh '''
          # attempt to get load balancer IP, fall back to minikube service url
          SERVICE_IP=$(kubectl -n ${KUBE_NAMESPACE} get svc student-marks-service -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)
          if [ -z "$SERVICE_IP" ]; then
            SERVICE_URL=$(minikube service student-marks-service -n ${KUBE_NAMESPACE} --url)
          else
            SERVICE_URL="http://${SERVICE_IP}"
          fi
          echo "Base URL: $SERVICE_URL"
          # update postman_env.json baseUrl (assumes file exists)
          jq --arg url "$SERVICE_URL" '(.values[] | select(.key=="baseUrl") ).value = $url' postman_env.json > tmp_env.json && mv tmp_env.json postman_env.json
          docker run --rm -v $PWD:/etc/newman -t postman/newman:alpine newman run /etc/newman/postman_collection.json -e /etc/newman/postman_env.json --reporters cli,junit
        '''
      }
    }
  }

  post {
    success { echo "Pipeline finished successfully" }
    failure { echo "Pipeline failed — check logs" }
    always { sh 'docker image prune -f || true' }
  }
}
