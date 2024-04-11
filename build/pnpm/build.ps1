$image = "registry.cn-shanghai.aliyuncs.com/fisschl/pnpm:latest"

docker build -t $image .
docker push $image
