# PowerShell script to convert JSON files to MongoDB format

$fakeDataPath = "e:\FromD\LearnWeb\Ecommerce\back_end\fakeData"
$files = @(
    "products.json",
    "orders.json", 
    "payments.json",
    "cartItems.json",
    "reviews.json",
    "wishlists.json",
    "contacts.json",
    "sessions.json",
    "bannerHeros.json",
    "blogCategories.json",
    "posts.json",
    "orderStatusHistory.json",
    "shippingProviders.json",
    "coupons.json"
)

function ConvertToMongoFormat($jsonObject) {
    if ($jsonObject -is [System.Array]) {
        for ($i = 0; $i -lt $jsonObject.Count; $i++) {
            $jsonObject[$i] = ConvertToMongoFormat $jsonObject[$i]
        }
    } elseif ($jsonObject -is [PSCustomObject]) {
        $properties = $jsonObject.PSObject.Properties.Name
        foreach ($prop in $properties) {
            if ($prop -eq "_id" -and $jsonObject.$prop -is [string]) {
                $jsonObject.$prop = @{ '$oid' = $jsonObject.$prop }
            } elseif ($prop -like "*Id" -and $jsonObject.$prop -is [string] -and $jsonObject.$prop -ne $null -and $jsonObject.$prop -ne "" -and $jsonObject.$prop -ne "null") {
                $jsonObject.$prop = @{ '$oid' = $jsonObject.$prop }
            } elseif (($prop -eq "createdAt" -or $prop -eq "updatedAt" -or $prop -eq "birthday" -or $prop -eq "lastLoginAt" -or $prop -eq "publishedAt" -or $prop -eq "startDate" -or $prop -eq "endDate" -or $prop -eq "orderDate" -or $prop -eq "paymentDate" -or $prop -eq "estimatedDelivery" -or $prop -eq "actualDelivery" -or $prop -eq "expiresAt") -and $jsonObject.$prop -is [string] -and $jsonObject.$prop -ne $null -and $jsonObject.$prop -ne "") {
                $jsonObject.$prop = @{ '$date' = $jsonObject.$prop }
            } elseif ($jsonObject.$prop -is [PSCustomObject] -or $jsonObject.$prop -is [System.Array]) {
                $jsonObject.$prop = ConvertToMongoFormat $jsonObject.$prop
            }
        }
    }
    return $jsonObject
}

foreach ($file in $files) {
    $filePath = Join-Path $fakeDataPath $file
    if (Test-Path $filePath) {
        Write-Host "Converting $file..."
        $content = Get-Content $filePath -Raw | ConvertFrom-Json
        $converted = ConvertToMongoFormat $content
        $converted | ConvertTo-Json -Depth 20 | Out-File $filePath -Encoding UTF8
        Write-Host "Completed $file"
    }
}

Write-Host "All files converted successfully!"
