# Fix mojibake and harmonize h1 for year1 files
$map = @{
 'en\\year1\\bio1' = @{n=1; title='Bio 1 : Ecosystems'}
 'en\\year1\\chem1' = @{n=2; title='Chemistry 1 : Natural resources and raw materials'}
 'en\\year1\\phys1' = @{n=3; title='Physics 1 : Natural energy resources'}
 'en\\year1\\chem2' = @{n=4; title='Chemistry 2 : Mixtures and pure substances'}
 'en\\year1\\phys2' = @{n=5; title='Physics 2 : Energy, expansion and changes of state'}
 'en\\year1\\bio2' = @{n=6; title='Bio 2 : Human reproduction and prevention'}
 'nl\\year1\\01-bio-ecosystemen' = @{n=1; title='Bio 1 : Ecosystemen'}
 'nl\\year1\\02-chemie-natuurlijke-hulpbronnen-grondstoffen' = @{n=2; title='Chemie 1 : Natuurlijke hulpbronnen en grondstoffen'}
 'nl\\year1\\03-fysica-natuurlijke-energiebronnen' = @{n=3; title='Fysica 1 : Natuurlijke energiebronnen'}
 'nl\\year1\\04-chemie-mengsels-zuivere-stoffen' = @{n=4; title='Chemie 2 : Mengsels en zuivere stoffen'}
 'nl\\year1\\05-fysica-energie-uitzetting-faseovergangen' = @{n=5; title='Fysica 2 : Energie, uitzetting en faseovergangen'}
 'nl\\year1\\06-bio-voortplanting-preventie' = @{n=6; title='Bio 2 : Voortplanting en preventie'}
}

$reps = @{
 'Ã©'='é'; 'Ã¨'='è'; 'Ãª'='ê'; 'Ã«'='ë'; 'Ã '='à'; 'Ã¹'='ù'; 'Ã´'='ô'; 'Ã®'='î'; 'Ã¶'='ö'; 'Ã§'='ç';
 'â€¢'='•'; 'â€”'='—'; 'â€“'='–'; 'â€¦'='…'; 'â€˜'='‘'; 'â€™'='’'; 'â€œ'='"'; 'â€'='"';
 'â†’'='→'; 'â†'='←'; 'â†'='←';
 'AlÃ©atoire'='Aléatoire'; 'FranÃ§ais'='Français'; 'Une espÃ¨ce'='Une espèce';
 'biocÃ©nose'='biocénose'; 'Ã©cosystÃ¨me'='écosystème'; 'chaÃ®ne'='chaîne'; 'rÃ©seau'='réseau';
 'dÃ©composeur'='décomposeur'; 'matiÃ¨re'='matière'; 'modÃ¨le'='modèle'; 'prÃ©dation'='prédation';
 'prÃ©dateur'='prédateur'; 'hÃ´te'='hôte'; 'compÃ©tition'='compétition'; 'biodiversitÃ©'='biodiversité';
 'sÃ©lection'='sélection'; 'nÃ©nuphar'='nénuphar'; 'ðŸ”Š'='🔊'
}

$files = Get-ChildItem -Recurse -Filter '*.html' | Where-Object { $_.FullName -match '\\(en|nl)\\year1\\' }
foreach ($f in $files) {
  $rel = $f.FullName.Substring((Get-Location).Path.Length + 1)
  Write-Host "Processing: $rel"
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  # try decode as UTF8 first
  $text = $null
  try { $text = [System.Text.Encoding]::UTF8.GetString($bytes) } catch { $text = $null }

  # if decoded text contains mojibake markers, re-decode as Windows-1252
  if ($text -and ($text -match 'Ã|â|ð')) {
    $text = [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
  } elseif (-not $text) {
    $text = [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
  }

  $orig = $text
  # If the decoded text still contains mojibake markers, try re-encoding trick:
  if ($text -match 'Ã|â|ð') {
    try {
      $tmpBytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($text)
      $fixed = [System.Text.Encoding]::UTF8.GetString($tmpBytes)
      if ($fixed -ne $text) { $text = $fixed }
    } catch { }
  }
  foreach ($k in $reps.Keys) { $text = $text -replace [regex]::Escape($k), $reps[$k] }

  # ensure meta charset present and set to UTF-8
  if ($text -match '<meta[^>]*charset=') {
    $text = [regex]::Replace($text, '<meta[^>]*charset=[\"\'\']?[^\"\' >]+[\"\'\']?[^>]*>', '<meta charset="UTF-8" />', 1, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  } else {
    $text = $text -replace '(<head[^>]*>)', "$1`r`n  <meta charset=\"UTF-8\" />"
  }

  foreach ($key in $map.Keys) {
    if ($rel -like "*$key*") {
      $entry = $map[$key]
      $newH1 = "Chapter $($entry.n) - $($entry.title)"
      if ($text -match '<h1>.*?</h1>') {
        $text = [regex]::Replace($text, '<h1>.*?</h1>', "<h1>$newH1</h1>", 1, [System.Text.RegularExpressions.RegexOptions]::Singleline)
      } else {
        $text = $text -replace '(<header[^>]*>\s*)', "$1`r`n      <h1>$newH1</h1>`r`n"
      }
      break
    }
  }

  if ($text -ne $orig) {
    # write UTF-8 without BOM
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($f.FullName, $text, $utf8NoBom)
    Write-Host "Rewrote: $rel"
  } else {
    Write-Host "No changes for: $rel"
  }
}
Write-Host 'Script finished.'
