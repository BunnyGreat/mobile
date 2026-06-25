$root = Get-Location
$lines = @()
Get-ChildItem -Recurse -Force | Sort-Object FullName | ForEach-Object {
    if ($_.FullName -match '\\.git(\\|$)' -or $_.FullName -match '\\node_modules(\\|$)') {
        return
    }
    $rel = $_.FullName.Substring($root.Path.Length + 1).TrimStart('\\')
    $depth = ($rel -split '\\').Count - 1
    $indent = '  ' * $depth
    if ($_.PSIsContainer) {
        $lines += "$indent- $rel/"
    } else {
        $lines += "$indent- $rel"
    }
}
Set-Content -Path FILE_STRUCTURE.md -Value ("# Project File Structure", "", $lines) -Encoding UTF8
