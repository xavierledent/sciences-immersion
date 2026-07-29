$ErrorActionPreference = 'Stop'

# Run this file from the workspace root in PowerShell: .\setup_project.ps1
$root = Convert-Path .

$languages = @('en','nl')
$years = @('year1','year2')
$sections = @('vocabulary.html','practice.html','resources.html','explorations.html')

$chapters_en = @(
    'bio1',
    'chem1',
    'phys1',
    'chem2',
    'phys2',
    'bio2'
)

$chapters_nl = @(
    '01-bio-ecosystemen',
    '02-chemie-natuurlijke-hulpbronnen-grondstoffen',
    '03-fysica-natuurlijke-energiebronnen',
    '04-chemie-mengsels-zuivere-stoffen',
    '05-fysica-energie-uitzetting-faseovergangen',
    '06-bio-voortplanting-preventie'
)

Write-Host "Creating project structure in $root"

foreach ($lang in $languages) {
    foreach ($year in $years) {
        $chapters = if ($lang -eq 'en') { $chapters_en } else { $chapters_nl }

        foreach ($chapter in $chapters) {
            $dir = Join-Path -Path $root -ChildPath "$lang\$year\$chapter"
            if (-not (Test-Path $dir)) {
                New-Item -ItemType Directory -Path $dir | Out-Null
            }

            foreach ($section in $sections) {
                $file = Join-Path -Path $dir -ChildPath $section
                if (-not (Test-Path $file)) {
                    New-Item -ItemType File -Path $file | Out-Null
                }
            }
        }
    }
}

$indexFile = Join-Path -Path $root -ChildPath 'index.html'
if (-not (Test-Path $indexFile)) {
    @"
<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <title>Science Immersion Site</title>
</head>
<body>
  <h1>Science Immersion Site</h1>
  <p>This root file is a placeholder. Use it later to build the language/year selector for GitHub Pages.</p>
</body>
</html>
"@ | Set-Content -Path $indexFile -Encoding UTF8
}

Write-Host "Done. Created folders and files for English and Dutch, years 1 and 2, and 4 sections per chapter."
