/**
 * Script para convertir Markdown a Word (.docx)
 * Requiere: npm install -g pandoc
 * O usar: npm install markdown-pdf (alternativa)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function convertMarkdownToWord() {
  const markdownFile = path.join(__dirname, '../docs/PROYECTO_TASK_MASTER_COMPLETO.md');
  const outputFile = path.join(__dirname, '../docs/Proyecto Task Master.docx');

  console.log('🔄 Convirtiendo Markdown a Word...');
  console.log(`📄 Archivo fuente: ${markdownFile}`);
  console.log(`📄 Archivo destino: ${outputFile}`);

  try {
    // Verificar si pandoc está instalado
    try {
      await execAsync('pandoc --version');
      console.log('✅ Pandoc encontrado');

      // Convertir usando pandoc
      const command = `pandoc "${markdownFile}" -o "${outputFile}" --reference-doc="${path.join(__dirname, '../docs/reference.docx')}" 2>&1 || pandoc "${markdownFile}" -o "${outputFile}"`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('Warning')) {
        console.error('⚠️ Advertencias:', stderr);
      }

      console.log('✅ Conversión completada exitosamente!');
      console.log(`📄 Archivo creado: ${outputFile}`);
    } catch (pandocError) {
      console.log('⚠️ Pandoc no está instalado. Usando método alternativo...');
      
      // Método alternativo: usar markdown-pdf o simplemente copiar
      console.log('\n📋 Instrucciones manuales:');
      console.log('1. Instala Pandoc: https://pandoc.org/installing.html');
      console.log('2. O usa una herramienta online como: https://www.markdowntoword.com/');
      console.log('3. O copia el contenido de PROYECTO_TASK_MASTER_COMPLETO.md a Word manualmente');
      
      // Crear un archivo de instrucciones
      const instructions = `
# Instrucciones para convertir Markdown a Word

## Opción 1: Usar Pandoc (Recomendado)

1. Instala Pandoc desde: https://pandoc.org/installing.html
2. Ejecuta este comando:
   pandoc "docs/PROYECTO_TASK_MASTER_COMPLETO.md" -o "docs/Proyecto Task Master.docx"

## Opción 2: Usar herramienta online

1. Abre: https://www.markdowntoword.com/
2. Sube el archivo: docs/PROYECTO_TASK_MASTER_COMPLETO.md
3. Descarga el archivo .docx generado
4. Reemplaza: docs/Proyecto Task Master.docx

## Opción 3: Copiar y pegar

1. Abre docs/PROYECTO_TASK_MASTER_COMPLETO.md
2. Copia todo el contenido
3. Pégalo en Word
4. Ajusta el formato según necesites
      `;

      fs.writeFileSync(
        path.join(__dirname, '../docs/INSTRUCCIONES_CONVERSION.txt'),
        instructions
      );

      console.log('\n📝 Se creó un archivo con instrucciones: docs/INSTRUCCIONES_CONVERSION.txt');
    }
  } catch (error) {
    console.error('❌ Error durante la conversión:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  convertMarkdownToWord();
}

module.exports = { convertMarkdownToWord };
