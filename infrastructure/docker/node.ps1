$image = "registry.cn-shanghai.aliyuncs.com/fisschl/node:latest"

docker pull node:lts
docker tag node:lts $image
docker push $image
