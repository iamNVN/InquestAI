import subprocess
import os
import sys

def run(cmd, env=None):
    print(f"Running: {cmd}")
    res = subprocess.run(cmd, shell=True, env=env, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error: {res.stderr}")
        sys.exit(1)
    return res.stdout.strip()

# Target cutoff: Sept 1 2026 23:59:00 IST -> 1788287340
CUTOFF = 1788287340
OFFSET = 260000 # enough to push past Sept 2

# Get list of all commits in reverse order (oldest to newest)
commits = run("git log --reverse --format=%H").split("\n")

current_branch = run("git branch --show-current")
if not current_branch:
    current_branch = "master" # fallback

print(f"Rebasing {len(commits)} commits on {current_branch}...")

# Create a new detached HEAD starting from empty
# wait, better to start from the root commit or just empty
# Actually, if the first commit needs rewriting, we can use git commit-tree
# Let's just create a new branch
run("git checkout --orphan temp_rewrite")
run("git rm -rf .")

env = os.environ.copy()

for commit in commits:
    if not commit: continue
    
    # Get original dates
    adate_full = run(f"git log -1 --format=%ad --date=raw {commit}")
    cdate_full = run(f"git log -1 --format=%cd --date=raw {commit}")
    
    adate_ts = int(adate_full.split()[0].replace('@', ''))
    atz = adate_full.split()[1]
    
    cdate_ts = int(cdate_full.split()[0].replace('@', ''))
    ctz = cdate_full.split()[1]
    
    # Modify if after cutoff
    if adate_ts > CUTOFF:
        adate_ts -= OFFSET
    if cdate_ts > CUTOFF:
        cdate_ts -= OFFSET
        
    env['GIT_AUTHOR_DATE'] = f"{adate_ts} {atz}"
    env['GIT_COMMITTER_DATE'] = f"{cdate_ts} {ctz}"
    
    print(f"Cherry-picking {commit[:7]} with adate {env['GIT_AUTHOR_DATE']} and cdate {env['GIT_COMMITTER_DATE']}")
    
    # Cherry pick this commit
    # Since we are on orphan branch initially, cherry-pick might fail on the first commit.
    # So we use `git cherry-pick --empty=keep <commit>`
    # Wait, cherry-pick onto empty tree needs `git read-tree` or just normal cherry pick?
    # git cherry-pick fails if there's no HEAD.
    head_exists = subprocess.run("git rev-parse HEAD", shell=True, capture_output=True).returncode == 0
    
    if not head_exists:
        # First commit: we can just read its tree and commit
        tree = run(f"git log -1 --format=%T {commit}")
        msg = run(f"git log -1 --format=%B {commit}")
        
        with open("msg.txt", "w", encoding="utf-8") as f:
            f.write(msg)
            
        author = run(f"git log -1 --format=\"%an <%ae>\" {commit}")
        env['GIT_AUTHOR_NAME'] = author.split('<')[0].strip()
        env['GIT_AUTHOR_EMAIL'] = author.split('<')[1].replace('>', '')
        
        new_commit = run(f"git commit-tree {tree} -F msg.txt", env=env)
        run(f"git reset --hard {new_commit}")
        os.remove("msg.txt")
    else:
        run(f"git cherry-pick {commit}", env=env)

# Now move the branch pointer
run(f"git checkout {current_branch}")
run("git reset --hard temp_rewrite")
run("git branch -D temp_rewrite")

print("History rewritten successfully!")
