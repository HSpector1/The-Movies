"""Classify one Bash tool command for lane-guard.sh.

stdin: the command text. Exit codes: 0 = no heavy tool in command position; 1 = a heavy
tool (tsc, vitest, vite-node, vite build, playwright, a heavy npm script) is run directly;
3 = every heavy-looking segment is a single lane-run-r8.sh invocation, which does its own
preflight and lock. Any other exit (parse failure) makes the hook refuse the command.

Over-approximation is deliberate: a token in command position after shell wrappers
(bash -c, eval, env, nice, nohup, caffeinate, time, timeout, VAR=... prefixes) counts.
Tool names inside ordinary arguments (grep -n vitest package.json) do not.
"""
import re
import sys

HEAVY_TOOLS = {'tsc', 'vitest', 'vite-node', 'playwright'}
# npm scripts that compile, test, generate, build, serve or play; everything in
# package.json except the read-only audits. Unknown scripts are treated as heavy.
LIGHT_NPM_SCRIPTS = {'audit:repo-hygiene', 'audit:3d-assets', 'audit:browser-deps', 'audit:studio-packaged'}
LANE = re.compile(r'^(?:bash|sh)\s+\S*lane-run-r8\.sh\s+\S+\s+/\S+\s+\S')
WRAPPER = re.compile(
    r'^(?:[A-Za-z_][A-Za-z0-9_]*=\S*|time(?:\s+-p)?|env(?:\s+-i)?|nice(?:\s+-n\s*-?\d+)?|nohup|exec|'
    r'caffeinate(?:\s+-[a-z]+)*(?:\s+-t\s+\d+)?|timeout\s+\d+[smh]?|(?:bash|sh|zsh)\s+-[a-z]*c|eval|xargs(?:\s+-[a-zA-Z0-9]+)*)'
    r'(?:\s+|$)')


def basename(token: str) -> str:
    token = token.strip('\'"`')
    token = token.rsplit('/', 1)[-1]
    return re.sub(r'\.(?:m?js|cjs)$', '', token)


def classify_segment(segment: str) -> str:
    segment = segment.strip().lstrip('{').strip()
    if not segment:
        return 'light'
    if LANE.match(segment):
        return 'lane'
    # Peel shell wrappers and leading quotes until a real command word remains.
    while True:
        segment = segment.lstrip().lstrip('\'"`').lstrip()
        match = WRAPPER.match(segment)
        if not match or match.end() == 0:
            break
        segment = segment[match.end():]
    tokens = segment.split()
    if not tokens:
        return 'light'
    head = basename(tokens[0])
    rest = tokens[1:]
    if head in HEAVY_TOOLS:
        return 'heavy'
    if head == 'vite' and rest and rest[0].strip('\'"') == 'build':
        return 'heavy'
    if head == 'npx':
        for token in rest:
            if token.startswith('-'):
                continue
            name = basename(token)
            if name in HEAVY_TOOLS or (name == 'vite' and 'build' in rest):
                return 'heavy'
            return 'light'
        return 'light'
    if head == 'node':
        for token in rest:
            if token.startswith('-'):
                continue
            return 'heavy' if basename(token) in HEAVY_TOOLS else 'light'
        return 'light'
    if head == 'npm':
        args = [token.strip('\'"') for token in rest if not token.startswith('-')]
        if not args:
            return 'light'
        if args[0] in {'t', 'tst', 'test'}:
            return 'heavy'
        if args[0] in {'run', 'run-script', 'rum', 'urn'}:
            if len(args) < 2:
                return 'light'
            return 'light' if args[1] in LIGHT_NPM_SCRIPTS else 'heavy'
        return 'light'
    return 'light'


def main() -> int:
    command = sys.stdin.read()
    verdict = 'light'
    for segment in re.split(r'[;&|\n()]+|\$\(', command):
        kind = classify_segment(segment)
        if kind == 'heavy':
            return 1
        if kind == 'lane':
            verdict = 'lane'
    return 3 if verdict == 'lane' else 0


if __name__ == '__main__':
    sys.exit(main())
