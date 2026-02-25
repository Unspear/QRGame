New-Item -Path ".\temp" -ItemType Directory

foreach($line in Get-Content .\repos.txt) {
    $filename = $line.Split([IO.Path]::GetInvalidFileNameChars()) -join '_'
    New-Item -Path ".\temp\$($filename)" -ItemType Directory
    git clone --depth 1 $line ".\temp\$($filename)"
}
# Source - https://stackoverflow.com/a/57847546
# Posted by mklement0, modified by community. See post 'Timeline' for change history
# Retrieved 2026-02-24, License - CC BY-SA 4.0
$targetDir = Convert-Path './temp' # Get the current (target) directory's full path.

Get-ChildItem -LiteralPath $targetDir -Directory | # Loop over child dirs.
Get-ChildItem -Recurse -File -Filter *.lua | # Loop over all *.txt files in subtrees of child dirs.
Move-Item -Destination { # Move to target dir.
  # Construct the full target path from the target dir.
  # and the relative sub-path with path separators replaced with "_" chars.
  Join-Path $targetDir ($_.Fullname.Substring($targetDir.Length + 1) -replace '[/\\]', '_') 
}

# Delete old folders
Get-ChildItem -LiteralPath $targetDir -Directory | Remove-Item -Recurse -Force

# Remove
foreach($string in Get-Content .\remove.txt) {
    Get-ChildItem -LiteralPath $targetDir | Where-Object {$_.Name -like "*$string*"} | foreach ($_) {remove-item $_.fullname}
}
