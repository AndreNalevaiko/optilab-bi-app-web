# -*- coding: utf-8 -*-
from fabric.api import task, run, local

VERSION = '1.4.1'
CONTAINER_NAME = 'optilab-bi-app-web'
IMAGE_NAME = 'optilab-bi/%s' % CONTAINER_NAME

@task
def run():
    local('grunt watch')
