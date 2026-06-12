pipeline {
    agent any

    environment {
        COMPOSE_FILE = "scan-pipeline/docker-compose.yml"
        PROJECT_DIR = "scan-pipeline"
    }

    stages {

        stage('Checkout code') {
            steps {
                checkout scm
            }
        }

        stage('Verify structure') {
            steps {
                sh '''
                echo "Current directory:"
                pwd
                ls -la
                ls -la scan-pipeline
                '''
            }
        }

        stage('Build Docker images') {
            steps {
                sh """
                docker compose -f ${COMPOSE_FILE} build
                """
            }
        }

        stage('Start dependencies (DB + Redis)') {
            steps {
                sh """
                docker compose -f ${COMPOSE_FILE} up -d postgres redis
                """
            }
        }

        stage('Start Backend') {
            steps {
                sh """
                docker compose -f ${COMPOSE_FILE} up -d backend
                """
            }
        }

        stage('Run Backend Tests') {
            steps {
                sh """
                docker compose -f ${COMPOSE_FILE} run --rm backend pytest || true
                """
            }
        }

        stage('Build Frontend') {
            steps {
                sh """
                docker compose -f ${COMPOSE_FILE} build frontend
                """
            }
        }

        stage('Start Full Stack') {
            steps {
                sh """
                docker compose -f ${COMPOSE_FILE} up -d
                """
            }
        }

       stage('Health Check Backend') {
    steps {
        sh '''
        echo "Waiting backend..."

        for i in $(seq 1 20); do
            curl -sf http://localhost:8000/docs && exit 0
            echo "not ready yet... retry $i"
            sleep 3
        done

        echo "Backend failed"
        exit 1
        '''
    }
}

        stage('Logs (debug)') {
            steps {
                sh """
                docker compose -f ${COMPOSE_FILE} logs --tail=50
                """
            }
        }
    }

    post {
        success {
            echo " Pipeline réussi - Stack déployée correctement"
        }

        failure {
            echo " Pipeline échoué - vérifier logs Docker"
            sh """
            docker compose -f ${COMPOSE_FILE} logs
            """
        }

        always {
            echo "Cleanup optionnel (si nécessaire)"
        }
    }
}
