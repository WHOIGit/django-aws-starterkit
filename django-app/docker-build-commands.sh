#!/bin/sh
docker buildx build -f compose/production/django/Dockerfile -t eandrewswhoi/django-aws-starterkit:latest --platform linux/amd64 --push .
