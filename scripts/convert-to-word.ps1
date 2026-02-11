# Script PowerShell para convertir Markdown a Word
# Requiere Pandoc instalado

$markdownFile = Join-Path $PSScriptRoot "..\docs\PROYECTO_TASK_MASTER_COMPLETO.md"
$outputFile = Join-Path $PSScriptRoot "..\docs\Proyecto Task Master.docx"

Write-Host "🔄 Convirtiendo Markdown a Word...`n" -ForegroundColor Cyan

try {
    # Verificar si pandoc está instalado
    $pandocVersion = pandoc --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pandoc encontrado`n" -ForegroundColor Green
        
        # Convertir usando pandoc
        $referenceDoc = Join-Path $PSScriptRoot "..\docs\reference.docx"
        if (Test-Path $referenceDoc) {
            pandoc $markdownFile -o $outputFile --reference-doc=$referenceDoc
        } else {
            pandoc $markdownFile -o $outputFile
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Conversión completada exitosamente!" -ForegroundColor Green
            Write-Host "📄 Archivo creado: $outputFile" -ForegroundColor Yellow
        } else {
            throw "Error en la conversión"
        }
    } else {
        Write-Host "⚠️  Pandoc no está instalado.`n" -ForegroundColor Yellow
        Write-Host "📝 Instrucciones para instalar Pandoc:" -ForegroundColor Cyan
        Write-Host "   winget install --id JohnMacFarlane.Pandoc" -ForegroundColor White
        Write-Host "   O: choco install pandoc" -ForegroundColor White
        Write-Host "`n💡 Alternativa: Usa herramientas online o copia manualmente" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
