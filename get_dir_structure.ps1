# Get the current directory
$currentDirectory = Get-Location

# Get all files recursively, including hidden and system files
Get-ChildItem -Path $currentDirectory -Recurse -Force | ForEach-Object {
    # Construct the relative path starting from the current directory
    $_.FullName.Substring($currentDirectory.Path.Length + 1) 
} | Out-File -FilePath "dir_structure.txt"