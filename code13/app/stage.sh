if branch=$(git rev-parse --abbrev-ref HEAD 2> /dev/null | tr / _); then
if [[ "$branch" == "HEAD" ]]; then
    branch='detached*'
fi
    git_branch="$branch"
else
    git_branch=""
fi

# Note that we replace / with _ in the branch because I can't be bothered to fight sed escaping of / right now

git_commit_count=$(git rev-list --count ${git_branch})
git_describe=$(git describe --always)

rm -f settings.staging.generated.json

sed < settings.json \
"s/__MGB_GIT_BRANCH__WILL_GO_HERE__/${git_branch}/" | \
sed "s/__MGB_GIT_BRANCH_COMMIT_COUNT__WILL_GO_HERE__/${git_commit_count}/; " | \
sed "s/__MGB_GIT_DESCRIBE__WILL_GO_HERE__/${git_describe}/;" | \
sed 's/mygamebuilder.com/staging.mygamebuilder.com/g' > settings.staging.generated.json

if [ -f settings.staging.generated.json ]; then
  echo doing it...
  DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy staging.mygamebuilder.com --settings settings.staging.generated.json
else
  echo No generated staging file...
fi