#!/bin/bash -e

echo $CLASPRC > ~/.clasprc.json;
echo $CLASPCONF > .clasp.json;
clasp push
