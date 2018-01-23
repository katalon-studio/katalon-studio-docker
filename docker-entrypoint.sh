#!/bin/bash
set -eo pipefail

service xvfb start

exec katalon "$@"
