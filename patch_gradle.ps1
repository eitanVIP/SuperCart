$file = 'android/app/build.gradle'
$lines = Get-Content $file

$startIndex = -1
$depth = 0
$endIndex = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($startIndex -eq -1 -and $lines[$i].Trim() -eq 'android {') {
        $startIndex = $i
        $depth = 1
        continue
    }
    if ($startIndex -ne -1) {
        $depth += ([regex]::Matches($lines[$i], '{')).Count
        $depth -= ([regex]::Matches($lines[$i], '}')).Count
        if ($depth -eq 0) {
            $endIndex = $i
            break
        }
    }
}

if ($endIndex -eq -1) {
    Write-Host "[ERROR] Could not find top-level 'android {' block closing brace"
    exit 1
}

$insertBlock = @(
    '    externalNativeBuild {',
    '        cmake {',
    '            buildStagingDirectory "C:/rn-native-builds/SuperCart"',
    '        }',
    '    }'
)

$newLines = $lines[0..($endIndex - 1)] + $insertBlock + $lines[$endIndex..($lines.Count - 1)]
Set-Content -Path $file -Value $newLines

Write-Host "Successfully injected buildStagingDirectory into build.gradle."