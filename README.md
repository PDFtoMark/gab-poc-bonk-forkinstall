# gab-poc-bonk-forkinstall

Reproduction of the cloudflare/cloudflare-os `bonk.yml` issue_comment job:
privileged `issue_comment` + checkout of `refs/pull/<n>/head` (i.e. fork PR code)
+ `setup-vp` with `run-install: true`, which executes the PR head's own
package.json lifecycle scripts before the fork-safety logic inside ask-bonk runs.
