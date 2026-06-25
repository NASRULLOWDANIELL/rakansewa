$p = 'frontend\src\index.css'
$a = Get-Content $p
$a[0..732] | Set-Content $p -Encoding UTF8
Write-Host "Done. Lines kept: $($a[0..732].Count)"
