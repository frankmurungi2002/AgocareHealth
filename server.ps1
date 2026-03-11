# Simple HTTP Server in PowerShell
$port = 8000
$root = Split-Path $MyInvocation.MyCommand.Path

Add-Type -AssemblyName System.Web

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server started at http://localhost:$port/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $url = $request.Url.LocalPath
        if ($url -eq "/" -or $url -eq "") {
            $url = "/html/index.html"
        }

        $filePath = Join-Path $root $url.TrimStart("/")

        if (Test-Path $filePath -PathType Leaf) {
            # Set Content-Type based on file extension
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".svg"  { "image/svg+xml" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif"  { "image/gif" }
                ".ico"  { "image/x-icon" }
                ".webp" { "image/webp" }
                ".woff" { "font/woff" }
                ".woff2"{ "font/woff2" }
                ".ttf"  { "font/ttf" }
                ".eot"  { "application/vnd.ms-fontobject" }
                ".pdf"  { "application/pdf" }
                ".xml"  { "application/xml" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $contentType

            $fileStream = [System.IO.File]::OpenRead($filePath)
            $response.ContentLength64 = $fileStream.Length
            $fileStream.CopyTo($response.OutputStream)
            $fileStream.Close()
            Write-Host "[OK] Served: $url" -ForegroundColor Green
        } else {
            $response.StatusCode = 404
            Write-Host "[404] Not Found: $url" -ForegroundColor Red
        }

        $response.Close()
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}
