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
                powershell '''
                    npm install
                    npm test
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    TAG = env.BUILD_NUMBER
                    IMAGE_TAG = "${DOCKER_IMAGE}:${TAG}"
                }

                powershell """
                    docker build -t ${IMAGE_TAG} .
                """
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${DOCKER_CRED_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    powershell """
                        echo $Env:DOCKER_PASS | docker login -u $Env:DOCKER_USER --password-stdin
                        docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                        docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest
                        docker push ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: "${KUBE_CONFIG_CRED_ID}", variable: 'KCFG')]) {
                    powershell """
                        mkdir \$HOME\\.kube -Force
                        copy \$Env:KCFG \$HOME\\.kube\\config -Force

                        kubectl get ns ${KUBE_NAMESPACE}
                        if (\$LASTEXITCODE -ne 0) {
                            kubectl create namespace ${KUBE_NAMESPACE}
                        }

                        kubectl apply -f k8s\\mongo-deployment.yaml -n ${KUBE_NAMESPACE}
                        kubectl apply -f k8s\\mongo-service.yaml -n ${KUBE_NAMESPACE}

                        kubectl apply -f k8s\\app-deployment.yaml -n ${KUBE_NAMESPACE}
                        kubectl apply -f k8s\\app-service.yaml -n ${KUBE_NAMESPACE}

                        kubectl set image deployment/student-marks-app student-marks-app=${DOCKER_IMAGE}:${BUILD_NUMBER} -n ${KUBE_NAMESPACE}

                        kubectl rollout status deployment/student-marks-app -n ${KUBE_NAMESPACE}
                    """
                }
            }
        }

        stage('Integration Tests (Postman Newman)') {
            steps {
                powershell """
                    docker run --rm -v ${WORKSPACE}:/etc/newman postman/newman:alpine `
                        run /etc/newman/postman_collection.json `
                        --reporters cli
                """
            }
        }

    }

    post {
        always {
            powershell "docker image prune -f"
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed. Check logs."
        }
    }
}
