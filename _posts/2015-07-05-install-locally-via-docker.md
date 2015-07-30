---
layout: post
title: Install Locally Via Docker
image: /public/images/blog/local_install_docker.jpg
subtitle: We have released several docker containers to simplify the local install process
tags:
  - Yi Qiao
---

Often people need to run iobio apps locally. Two common reaons are to work with sensitive data that can not leave your organizations network or to have more control of deployment and access. This can be a complicated process since it requires the installation of the multiple web services that support an iobio web app. To make this easier, We have created several docker images so that the process is greatly simplified and can now be completed with just a few commands. Depending on your particular needs and infrastructure design, docker based installation can be done in several modes. In the following sessions, each of these modes are discussed in respect to particular apps.

## bam.iobio

If you have a local directory, or locally mounted network directory, which contains bam files you would like to visualize inside bam.iobio, you can spin up the whole stack of bam.iobio via docker-compose. First create a directory and inside which create a docker-compose.yaml that looks something like this:


```yaml
data:
  image: nginx
  volumes: /mnt/storage:/usr/share/nginx/html:ro
bamiobio:
  image: qiaoy/iobio-bundle.bam-iobio
  links:
    - data
  ports:
    - "8000:80"
  environment:
    PUB_HOSTNAME: bam.iobio.local
    PUB_HTTP_PORT: 8000
```

or using a shell script without docker-compose


```sh
#!/bin/bash
docker run --name data \
    -v /mnt/storage:/usr/share/nginx/html:ro \
    -d nginx

docker run --name bamiobio \
    --link data:data -p 8000:80 \
    -e PUB_HOSTNAME=bam.iobio.local \
    -e PUB_HTTP_PORT=8000 \
    -d qiaoy/iobio-bundle.bam-iobio
```


If your files are already accessibly over http, or you are planning on using the local file feature only, you can omit the nginx container and the linking, i.e.:


```yaml
bamiobio:
  image: qiaoy/iobio-bundle.bam-iobio
  ports:
    - "8000:80"
  environment:
    PUB_HOSTNAME: bam.iobio.local
    PUB_HTTP_PORT: 8000
```

or using a shell script without docker-compose

```sh
#!/bin/bash
docker run \
    --name bamiobio -p 8000:80 \
    -e PUB_HOSTNAME=bam.iobio.local \
    -e PUB_HTTP_PORT=8000 \
    -d qiaoy/iobio-bundle.bam-iobio
```

Some explanations:
  
  * `volumes: /mnt/storage:/usr/share/nginx/html:ro` maps the local directory `/mnt/storage` into the www-root of the nginx service, so that files inside the directory can be accessed via http from within the bam.iobio bundle container

  * `ports: -"8000:80"` defines port mapping of 8000 on the host to 80 inside the container. The web app is always served on port 80 inside the container. You can, however, choose a different port (e.g. 80) on the host side, but make sure you also change the `PUB_HTTP_PORT`

  * `PUB_HOSTNAME: bam.iobio.local` defines a public accessible hostname to the host that is serving the web app. The content of this field, along with `PUB_HTTP_PORT`, will be used to modify the javascript inside bam.iobio so that the client knows where to connect. Note that this hostname / port combination needs to be also valid from within the container, which is usually the case if you provide the Full-Qualified Domain Name of the host server. We have, however, witnessed weird network topologies that the ip address of hostname is not accessible from within the host. See below for special cases

  * `PUB_HTTP_PORT: 8000` is the port mapped on the host side. If you change the `ports: "8000:80"` line, you need to make sure that they match up with this environment variable

With the file in place, you can spin up the stack with

```bash
$ docker-compose up
```

and navigate to http://${PUB_HOSTNAME}:${PUB_HTTP_PORT}/

To visualize files in `/mnt/storage`, e.g. `/mnt/storage/project1/patient1/diagnosis_tumor.bam`, click on "choose bam url" from the main page, and give it `http://data/project1/patient1/diagnosis_tumor.bam` (note that the file needs to be indexed first, i.e. the file `/mnt/storage/project1/patient1/diagnosis_tumor.bam.bai` needs to exist).

### Special cases
#### Trying to run with `localhost` being the `PUB_HOSTNAME`
The meaning of localhost differs between from within the container and from without. When it is outside of the container, localhost means the docker host machine, and the port to the reverse proxy inside the container is the `PUB_HTTP_PORT`; when inside the container, localhost means the virtual ethernet interface private to the container, and the port to the reverse proxy is always `80`. Thus if you use `localhost` as the `PUB_HOSTNAME`, and `PUB_HTTP_PORT` some value other than `80`, the client app running inside the browser will be able to make the first hop of the connection, but the iobio service will not be able to make the second because `${PUB_HOSTNAME}:${PUB_HTTP_PORT}` does not correspond to a valid service address from within the container. **WORKAROUND**: always use `PUB_HTTP_PORT=80` if you want to use `localhost` as the `PUB_HOSTNAME`
#### Different IP address between from inside the host machine and from outside
We have a high performance server hosted at a server center, with a hostname `server.iobio` (of course fake). From our workstations, the hostname resolves to IP address `x.x.x.x`, whereas the address attached to the actual ethernet interface is `y.y.y.y`. Moreover, from within the container, the hostname resolves to `y.y.y.y`, which is unreachable from inside the container for some reason. So pretty much the only way to access the services within the container is to use `http://127.0.0.1:80/`. **WORKAROUND**: Use `80` for `PUB_HTTP_PORT`, and add a segment to the docker-compose.yml that looks like

```yaml
bamiobio:
  ...
  extra_hosts:
    - "server.iobio:127.0.0.1"
```

This ensures that when the client connects to the service, `http://server.iobio/` resolves to `http://x.x.x.x/`, but when a service connects to another service, `http://server.iobio` resolves to `http://127.0.0.1`. Because within the container the reverse proxy always listens on port 80, `PUB_HTTP_PORT` has to be 80 as well.

## vcf.iobio
The bundle image is made in a very similar way as bam.iobio, thus it is only necessary to change the image name in the `docker-compose.yml` file or the shell script. 

```yaml
data:
  image: nginx
  volumes: /mnt/storage:/usr/share/nginx/html:ro
bamiobio:
  image: qiaoy/iobio-bundle.vcf-iobio
  links:
    - data
  ports:
    - "8000:80"
  environment:
    PUB_HOSTNAME: vcf.iobio.local
    PUB_HTTP_PORT: 8000
```

The vcf files need to be bgzipped and indexed by tabix(now part of [htslib](http://www.htslib.org)) for vcf.iobio to load. The discussion on special cases for bam.iobio also applies here.