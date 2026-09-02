import subprocess
import os

def run(cmd):
    return subprocess.check_output(cmd, shell=True).decode('utf-8').strip()

commits = run("git log --reverse --format=%H").split()
if not commits:
    exit()

cutoff = 1788287340
offset = 175000

new_commits = {}

for commit in commits:
    raw = subprocess.check_output(f"git cat-file commit {commit}", shell=True)
    lines = raw.split(b'\n')
    new_lines = []
    
    for line in lines:
        if line.startswith(b'parent '):
            parent = line.split()[1].decode('utf-8')
            if parent in new_commits:
                new_lines.append(b'parent ' + new_commits[parent].encode('utf-8'))
            else:
                new_lines.append(line)
        elif line.startswith(b'author '):
            parts = line.split(b' ')
            tz = parts[-1]
            ts = int(parts[-2])
            if ts > cutoff:
                ts -= offset
            parts[-2] = str(ts).encode('utf-8')
            new_lines.append(b' '.join(parts))
        elif line.startswith(b'committer '):
            parts = line.split(b' ')
            tz = parts[-1]
            ts = int(parts[-2])
            if ts > cutoff:
                ts -= offset
            parts[-2] = str(ts).encode('utf-8')
            new_lines.append(b' '.join(parts))
        else:
            new_lines.append(line)
            
    new_raw = b'\n'.join(new_lines)
    
    p = subprocess.Popen(["git", "hash-object", "-t", "commit", "-w", "--stdin"], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    new_hash, _ = p.communicate(new_raw)
    new_hash = new_hash.decode('utf-8').strip()
    
    new_commits[commit] = new_hash
    print(f"Rewrote {commit[:7]} -> {new_hash[:7]}")

current_branch = run("git branch --show-current")
if current_branch:
    last_commit = commits[-1]
    new_last_commit = new_commits[last_commit]
    run(f"git update-ref refs/heads/{current_branch} {new_last_commit}")
    print("Branch updated!")
