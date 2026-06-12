pipeline {
    agent any

    environment {
        COMPOSE_FILE = "scan-pipeline/docker-compose.yml"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                sh "docker compose -f ${COMPOSE_FILE} build"
            }
        }

        stage('Run Tests') {
            parallel {

                stage('Backend Tests') {
                    steps {
                        sh "docker compose -f ${COMPOSE_FILE} run --rm backend pytest"
                    }
                }

                stage('Frontend Build Test') {
                    steps {
                        sh """
                        docker compose -f ${COMPOSE_FILE} run --rm frontend npm install
                        docker compose -f ${COMPOSE_FILE} run --rm frontend npm run build
                        """
                    }
                }
            }
        }

        stage('Deploy Stack') {
            steps {
                sh "docker compose -f ${COMPOSE_FILE} up -d"
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                echo "Waiting for backend..."

                for i in $(seq 1 30); do
                    if curl -sf http://localhost:8000/docs > /dev/null; then
                        echo "Backend is healthy"
                        exit 0
                    fi

                    echo "Retry $i..."
                    sleep 3
                done

                echo "Backend health check failed"
                exit 1
                '''
            }
        }
    }

    post {

        success {
            echo "SUCCESS: Application deployed successfully"
        }

        failure {
            echo "FAILURE: Deployment failed"

            sh """
            docker compose -f ${COMPOSE_FILE} ps || true
            docker compose -f ${COMPOSE_FILE} logs --tail=200 || true
            """
        }

        always {
            sh """
            docker compose -f ${COMPOSE_FILE} ps || true
            """
        }
    }
}
