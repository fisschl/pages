$image = "registry.cn-shanghai.aliyuncs.com/fisschl/pages:latest"

docker build -t $image .
docker push $image
