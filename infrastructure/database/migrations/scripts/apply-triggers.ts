import { load } from "@std/dotenv";
import { Client } from "pg";

await load({ export: true });

/**
 * Extrai nomes de triggers automaticamente do arquivo SQL
 */
async function extractTriggerNames(): Promise<string[]> {
  try {
    const triggersSql = await Deno.readTextFile(
      './infrastructure/database/migrations/triggers/triggers.sql'
    );
    console.log("🚀 ~ extractTriggerNames ~ triggersSql:", triggersSql)
    
    // Regex para extrair nomes de trigger (pattern CREATE TRIGGER nome_trigger)
    const triggerRegex = /CREATE\s+TRIGGER\s+(\w+)/gi;
    const matches = [...triggersSql.matchAll(triggerRegex)];
    
    return matches.map(match => match[1].toLowerCase());
  } catch (error) {
    console.error("Erro ao ler arquivo de triggers:", error);
    return [];
  }
}

/**
 * Verifica e aplica triggers automaticamente
 */
async function checkAndApplyTriggers(): Promise<void> {
  const client = new Client({
    connectionString: Deno.env.get("DATABASE_URL")!,
  });
  
  try {
    await client.connect();
    
    // Obter nomes de triggers do arquivo SQL
    const expectedTriggers = await extractTriggerNames();
    
    if (expectedTriggers.length === 0) {
      console.log("⚠️ Nenhum trigger encontrado no arquivo SQL");
      return;
    }
    
    console.log(`🔍 Triggers esperados: ${expectedTriggers.join(", ")}`);
    
    // Consultar triggers existentes no banco
    const result = await client.query(`
      SELECT trigger_name 
      FROM information_schema.triggers
      WHERE trigger_schema = current_schema()
    `);
    
    const installedTriggers = result.rows.map((row: { trigger_name: string; }) => row.trigger_name.toLowerCase());
    console.log(`✓ Triggers instalados: ${installedTriggers.join(", ") || "nenhum"}`);
    
    // Verificar quais triggers estão faltando
    const missingTriggers = expectedTriggers.filter(t => !installedTriggers.includes(t));
    
    if (missingTriggers.length > 0) {
      console.log(`⚠️ Triggers faltantes: ${missingTriggers.join(", ")}`);
      
      // Aplicar todos os triggers
      const triggersSql = await Deno.readTextFile(
        './infrastructure/database/migrations/triggers/triggers.sql'
      );
      
      await client.query(triggersSql);
      console.log("✅ Triggers aplicados com sucesso");
    } else {
      console.log("✅ Todos os triggers já estão instalados");
    }
  } catch (error) {
    console.error("❌ Erro ao verificar/aplicar triggers:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Executar função principal
await checkAndApplyTriggers();