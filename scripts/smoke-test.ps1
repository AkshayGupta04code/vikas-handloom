# Smoke test for auth/security. Usage: ./scripts/smoke-test.ps1 -AdminPassword <pw> [-Base http://localhost:8080]
param([string]$AdminPassword = $env:ADMIN_PASSWORD, [string]$Base = "http://localhost:8080", [string]$AdminUser = "admin")
$ErrorActionPreference = "Continue"
$script:fail = 0
function Req($method, $path, $token, $body) {
  $h = @{}; if ($token) { $h.Authorization = "Bearer $token" }
  try {
    $p = @{ Method = $method; Uri = "$Base$path"; Headers = $h; ContentType = "application/json" }
    if ($body) { $p.Body = ($body | ConvertTo-Json -Depth 5) }
    $r = Invoke-RestMethod @p; return @{ code = 200; body = $r }
  } catch { return @{ code = [int]$_.Exception.Response.StatusCode; body = $null } }
}
function Check($name, $cond) { if ($cond) { "PASS  $name" } else { "FAIL  $name"; $script:fail++ } }

$a = Req POST /api/auth/login $null @{ username = $AdminUser; password = $AdminPassword }
Check "admin login" ($a.code -eq 200); $at = $a.body.token
Check "no token -> 401 on products" ((Req GET /api/products $null).code -eq 401)
Check "bad password -> 401" ((Req POST /api/auth/login $null @{ username = $AdminUser; password = "wrong" }).code -eq 401)
$g = Req POST /api/admin/users/generate $at @{ label = "smoke"; validDays = 1; usageMinutes = 60 }
Check "admin generates credentials" ($g.code -eq 200); $c = $g.body[0]
$cl = Req POST /api/auth/login $null @{ username = $c.username; password = $c.password }
Check "customer login" ($cl.code -eq 200); $ct = $cl.body.token
Check "customer reads products" ((Req GET /api/products $ct).code -eq 200)
Check "customer blocked from admin users API" ((Req GET /api/admin/users $ct).code -eq 403)
Check "customer blocked from admin product create" ((Req POST /api/admin/products $ct @{ name = "x"; categoryId = 1 }).code -eq 403)
Check "admin can list users" ((Req GET /api/admin/users $at).code -eq 200)
$id = $c.user.id
$null = Req POST "/api/admin/users/$id/revoke" $at
Check "revoked account: live JWT rejected immediately" ((Req GET /api/products $ct).code -eq 401)
Check "revoked account cannot log in" ((Req POST /api/auth/login $null @{ username = $c.username; password = $c.password }).code -eq 403)
$null = Req POST "/api/admin/users/$id/enable" $at
$cl2 = Req POST /api/auth/login $null @{ username = $c.username; password = $c.password }
Check "re-enabled account can log in" ($cl2.code -eq 200)
$lo = Req POST /api/auth/logout $cl2.body.token
Check "logout" ($lo.code -eq 200)
Check "token invalid after logout" ((Req GET /api/products $cl2.body.token).code -eq 401)
# expiry
$soon = (Get-Date).ToUniversalTime().AddSeconds(6).ToString("yyyy-MM-ddTHH:mm:ssZ")
$g2 = Req POST /api/admin/users/generate $at @{ label = "expiry"; validUntil = $soon }
$e = $g2.body[0]
$el = Req POST /api/auth/login $null @{ username = $e.username; password = $e.password }
Check "short-lived customer logs in" ($el.code -eq 200)
Start-Sleep 8
Check "expired session rejected by backend (JWT also expired)" ((Req GET /api/products $el.body.token).code -eq 401)
Check "expired account cannot log in again" ((Req POST /api/auth/login $null @{ username = $e.username; password = $e.password }).code -eq 403)
$rs = Req POST "/api/admin/users/$($e.user.id)/reset" $at
Check "admin reset credentials" ($rs.code -eq 200)
"`nFailures: $script:fail"; exit $script:fail
