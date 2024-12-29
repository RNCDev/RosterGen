# Get the current directory
$currentDirectory = Get-Location

# Get all files and directories recursively, excluding the .git directory and its contents
Get-ChildItem -Path $currentDirectory -Recurse -Force | Where-Object { $_.FullName -notmatch "\\.git\\?" } | ForEach-Object {
    # Construct the relative path starting from the current directory
    $_.FullName.Substring($currentDirectory.Path.Length + 1) 
} | Out-File -FilePath "dir_structure.txt"