#!/bin/bash
# Rewrite history to move commits back 2 days if they are after Sept 1 2026 23:59:59

git filter-branch -f --env-filter '
  # Extract timestamp and timezone
  ADATE=$(echo $GIT_AUTHOR_DATE | awk "{print \$1}" | tr -d "@")
  ATZ=$(echo $GIT_AUTHOR_DATE | awk "{print \$2}")
  CDATE=$(echo $GIT_COMMITTER_DATE | awk "{print \$1}" | tr -d "@")
  CTZ=$(echo $GIT_COMMITTER_DATE | awk "{print \$2}")
  
  # 1788287340 is 2026-09-01 23:59:00 IST
  if [ "$ADATE" -gt 1788287340 ]; then
    NEW_ADATE=$(($ADATE - 175000))
    export GIT_AUTHOR_DATE="@${NEW_ADATE} ${ATZ}"
  fi
  
  if [ "$CDATE" -gt 1788287340 ]; then
    NEW_CDATE=$(($CDATE - 175000))
    export GIT_COMMITTER_DATE="@${NEW_CDATE} ${CTZ}"
  fi
' -- --all
