[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

try {
    $payload = [Console]::In.ReadToEnd()
    $converter = Join-Path -Path $PSScriptRoot -ChildPath "readme_to_html.py"

    if (Test-Path -LiteralPath $converter -PathType Leaf) {
        $payload | & py -3 $converter 2>$null | Out-Null
    }
}
catch {
    # Hook failures are intentionally silent and must not stop the agent.
}

exit 0
