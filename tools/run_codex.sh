#!/bin/sh
# usage: sh tools/run_codex.sh <job-name> <prompt-file> [image ...]
# Starts `codex exec` (gpt-6-astra, ultra) detached; images are attached to the first prompt (-i).
# Writes .codex-jobs/<job>.log and, when finished, .codex-jobs/<job>.done (exit code).
set -e
cd "$(dirname "$0")/.."
JOB="$1"; PROMPT="$2"; shift 2
IMGS=""
for f in "$@"; do [ -f "$f" ] && IMGS="$IMGS -i '$f'"; done
rm -f ".codex-jobs/$JOB.done"
nohup sh -c "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex exec -C '$PWD' $IMGS -m gpt-6-astra -c model_reasoning_effort='\"ultra\"' -s workspace-write - < '$PROMPT' > '.codex-jobs/$JOB.log' 2>&1; echo \$? > '.codex-jobs/$JOB.done'" > /dev/null 2>&1 &
echo "started $JOB (pid $!) with $# image(s)"
