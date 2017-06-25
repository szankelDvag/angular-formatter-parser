#!/bin/bash

# npm publish with goodies
# prerequisites:
# `npm install -g trash conventional-recommended-bump conventional-changelog conventional-github-releaser conventional-commits-detector json`
# `np` with optional argument `patch`/`minor`/`major`/`<version>`
# defaults to conventional-recommended-bump
# and optional argument preset `angular`/ `jquery` ...
# defaults to conventional-commits-detector



# rebuilds and test the latest verstion of the repository (a succeeded travis build is precondition)

# checks the status of the last build of the current repository
# --no-interactive disables the interactive mode
# source: https://github.com/travis-ci/travis.rb/blob/master/README.md
travis status --no-interactive
# deletes the node_modules folder
trash node_modules
# pulls the latest version
git pull --rebase
# installs the node dependencies
npm install
# run unit tests
npm test
# copy the src/package.json
# we copy it to have the initial state saved.
# we bump the version update the changelog
# after doing this we use the real package.json and do another version bump
# there to have change log and version bump in separate commits

# create changelog

Copy-Item .\src\package.json "src\_package.json"
# Detect what commit message convention your repository is using
# source: https://github.com/conventional-changelog/conventional-commits-detector/blob/master/README.md
# $preset stores the output of conventional-commits-detector which is angular
$preset = (conventional-commits-detector)
# echo prints a value to screen
# ensures that a convention was detected
echo $preset
# Detect the recommended bump type by the conventional-commit standard
# source: https://github.com/conventional-changelog-archived-repos/conventional-recommended-bump/blob/master/README.md
# $bump stores the recommended bump type
$bump = (conventional-recommended-bump -p angular)
# echo prints a value to screen
# ensures that a bump type was detected
echo $bump
# npm version $bump bumps the version specified in $bump and write the new data back to package.json
# If you run npm version in a git repo, it will also create a version commit and tag.
# This behavior is disabled by --no-git-tag-version
# the var $bump specifies the segment of the version code to bump
npm --no-git-tag-version version $bump
# conventional-changelog creates a chagnelog markdown from commits
# -i Read the CHANGELOG from this file
# CHANGELOG.md it the name of the file to read from
# -s Outputting to the infile so you don't need to specify the same file as outfile
# -p Name of the preset you want to use. In this case it is angular that is stored in $preset
conventional-changelog -i CHANGELOG.md -s -p $preset
# add CHANGELOG.md to the commit
