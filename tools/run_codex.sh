#!/bin/sh
# usage: sh tools/run_codex.sh <job-name> <prompt-file>
# Starts `codex exec` (gpt-6-astra, ultra) detached; writes .codex-jobs/<job>.log and, when finished, .codex-jobs/<job>.done (exit code).
set -e
cd "$(dirname "$0")/.."
JOB="$1"; PROMPT="$2"
rm -f ".codex-jobs/$JOB.done"
nohup sh -c "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex exec -C '$PWD' -m gpt-6-astra -c model_reasoning_effort='\"ultra\"' -s workspace-write - < '$PROMPT' > '.codex-jobs/$JOB.log' 2>&1; echo \$? > '.codex-jobs/$JOB.done'" > /dev/null 2>&1 &
echo "started $JOB (pid $!)"
