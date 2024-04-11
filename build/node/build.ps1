$image = "registry.cn-shanghai.aliyuncs.com/fisschl/node:latest"

docker build -t $image .
docker push $image
