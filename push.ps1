function PushWithRetry {
    while ($true) {
        try {
            git push
            Write-Host "Git push successful." -ForegroundColor Green
            break
        }
        catch {
            Write-Warning "Push failed. Retrying ..."
        }
    }
}

PushWithRetry
