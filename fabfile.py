# -*- coding: utf-8 -*-
from fabric.api import task, run, local

VERSION = '1.0.3'
CONTAINER_NAME = 'optilab-bi-app-web'
IMAGE_NAME = 'optilab-bi-app-web%s' % CONTAINER_NAME

@task
def run():
    local('grunt watch')

@task
def build():
        
        local('docker build -t %s:%s --rm .' % (CONTAINER_NAME, VERSION))
            
        local('docker tag %s:%s %s:latest' % (CONTAINER_NAME, VERSION, CONTAINER_NAME))
@task
def push():
    'Contrói container docker de produção e realiza upload: call_build=True'

    int_VERSION = int(VERSION.replace('.', ''))

    # if int_VERSION != 100 and int_VERSION > 1:
    #     local('docker pull andrenalevaiko/%s:latest' % CONTAINER_NAME)
    #     local('docker tag andrenalevaiko/%s:latest andrenalevaiko/%s:backup' % (CONTAINER_NAME, CONTAINER_NAME))
    #     local('docker push andrenalevaiko/%s:backup' % CONTAINER_NAME)

    local('docker tag %s:%s andrenalevaiko/%s:%s' % (CONTAINER_NAME, VERSION, CONTAINER_NAME, VERSION))
    local('docker tag %s:%s andrenalevaiko/%s:latest' % (CONTAINER_NAME,VERSION, CONTAINER_NAME))
    local('docker push andrenalevaiko/%s:%s' % (CONTAINER_NAME, VERSION))
    local('docker push andrenalevaiko/%s:latest' % CONTAINER_NAME)