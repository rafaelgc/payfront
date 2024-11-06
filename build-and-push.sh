aws ecr get-login-password --region eu-west-3 | sudo docker login --username AWS --password-stdin 906876370565.dkr.ecr.eu-west-3.amazonaws.com
sudo docker build -t 906876370565.dkr.ecr.eu-west-3.amazonaws.com/payfront -f ./Dockerfile.prod .
sudo docker push 906876370565.dkr.ecr.eu-west-3.amazonaws.com/payfront