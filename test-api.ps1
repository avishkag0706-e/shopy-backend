# test-api.ps1
# Quick manual tests for the Blog API using PowerShell.
# Run with:  powershell -File test-api.ps1
# (Make sure the server is running first:  npm run dev)

$base = "http://localhost:5000"

# 1. Register two users so we can test ownership
$aliceJson = '{"name":"Alice Johnson","email":"alice@example.com","password":"password123"}'
try   { $alice = (Invoke-WebRequest "$base/api/auth/register" -Method Post -Body $aliceJson -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json }
catch { $login = '{"email":"alice@example.com","password":"password123"}'
        $alice = (Invoke-WebRequest "$base/api/auth/login" -Method Post -Body $login -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json }

$bobJson = '{"name":"Bob Smith","email":"bob@example.com","password":"password123"}'
try   { $bob = (Invoke-WebRequest "$base/api/auth/register" -Method Post -Body $bobJson -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json }
catch { $login = '{"email":"bob@example.com","password":"password123"}'
        $bob = (Invoke-WebRequest "$base/api/auth/login" -Method Post -Body $login -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json }

$aliceH = @{ Authorization = "Bearer $($alice.token)" }
$bobH   = @{ Authorization = "Bearer $($bob.token)" }

function Try-Request($label, $url, $method, $body, $headers) {
  Write-Host "--- $label ---" -ForegroundColor Cyan
  try {
    $r = Invoke-WebRequest $url -Method $method -Body $body -Headers $headers `
           -ContentType "application/json" -UseBasicParsing
    Write-Host "  $($r.StatusCode): $($r.Content)"
    return $r.Content   # return only the body so it can be used by the caller
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "  $code : $($reader.ReadToEnd())" -ForegroundColor Yellow
    return $null
  }
}

# 2. Protected route without a token must fail
$null = Try-Request "create post WITHOUT token (expect 401)" "$base/api/posts" "Post" '{"title":"x","content":"y"}' $null

# 3. Alice creates a post
$created = Try-Request "Alice creates a post (expect 201)" "$base/api/posts" "Post" `
  '{"title":"My First Blog Post","content":"Hello world! This is the content of my first post."}' $aliceH
$postId = ($created | ConvertFrom-Json)._id

# 4. Public reads
$null = Try-Request "list all posts (public)" "$base/api/posts" "Get" $null $null
$null = Try-Request "get one post (public)" "$base/api/posts/$postId" "Get" $null $null

# 5. Ownership rules
$null = Try-Request "Bob edits Alice's post (expect 403)" "$base/api/posts/$postId" "Put" `
  '{"title":"Hacked title","content":"Hacked content"}' $bobH
$null = Try-Request "Alice edits her own post (expect 200)" "$base/api/posts/$postId" "Put" `
  '{"title":"My First Blog Post (edited)"}' $aliceH
$null = Try-Request "Bob deletes Alice's post (expect 403)" "$base/api/posts/$postId" "Delete" $null $bobH

# 6. Unknown id
$null = Try-Request "get missing post (expect 404)" "$base/api/posts/000000000000000000000000" "Get" $null $null

# ---------------------------------------------------------------- comments
$c1 = Try-Request "Alice comments (expect 201)" "$base/api/posts/$postId/comments" "Post" `
  '{"content":"Nice article, thanks for sharing!"}' $aliceH
$null = Try-Request "Bob comments (expect 201)" "$base/api/posts/$postId/comments" "Post" `
  '{"content":"I learned a lot from this post."}' $bobH
$commentId = ($c1 | ConvertFrom-Json)._id

$null = Try-Request "comment WITHOUT token (expect 401)" "$base/api/posts/$postId/comments" "Post" `
  '{"content":"anonymous"}' $null
$null = Try-Request "read comments (public)" "$base/api/posts/$postId/comments" "Get" $null $null
$null = Try-Request "Bob deletes Alice's comment (expect 403)" "$base/api/comments/$commentId" "Delete" $null $bobH
$null = Try-Request "Alice deletes her own comment (expect 200)" "$base/api/comments/$commentId" "Delete" $null $aliceH

# 7. Finally check that only Alice's own post can be removed by Alice
$null = Try-Request "Alice deletes her own post (expect 200)" "$base/api/posts/$postId" "Delete" $null $aliceH
$null = Try-Request "post is gone now (expect 404)" "$base/api/posts/$postId" "Get" $null $null

Write-Host "`nALL TESTS DONE" -ForegroundColor Green
