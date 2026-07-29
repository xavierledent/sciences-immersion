#!/usr/bin/env bash
set -e

# Run this file from the workspace root: bash setup_project.sh
root="$(pwd)"

languages=("en" "nl")
years=("year1" "year2")
sections=("vocabulary.html" "practice.html" "resources.html" "explorations.html")

chapters_en=(
  "bio1"
  "chem1"
  "phys1"
  "chem2"
  "phys2"
  "bio2"
)

chapters_nl=(
  "01-bio-ecosystemen"
  "02-chemie-natuurlijke-hulpbronnen-grondstoffen"
  "03-fysica-natuurlijke-energiebronnen"
  "04-chemie-mengsels-zuivere-stoffen"
  "05-fysica-energie-uitzetting-faseovergangen"
  "06-bio-voortplanting-preventie"
)

printf "Creating project structure in %s\n" "$root"

for lang in "${languages[@]}"; do
  for year in "${years[@]}"; do
    if [ "$lang" = "en" ]; then
      chapters=("${chapters_en[@]}")
    else
      chapters=("${chapters_nl[@]}")
    fi

    for chapter in "${chapters[@]}"; do
      dir="$root/$lang/$year/$chapter"
      mkdir -p "$dir"

      for section in "${sections[@]}"; do
        file="$dir/$section"
        if [ ! -e "$file" ]; then
          touch "$file"
        fi
      done
    done
  done
 done

if [ ! -e "$root/index.html" ]; then
  cat > "$root/index.html" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Science Immersion Site</title>
</head>
<body>
  <h1>Science Immersion Site</h1>
  <p>This root file is a placeholder. Use it later to build the language/year selector for GitHub Pages.</p>
</body>
</html>
EOF
fi

printf "Done. Created folders and files for English and Dutch, years 1 and 2, and 4 sections per chapter.\n"
