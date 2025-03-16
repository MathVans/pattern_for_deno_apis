-- Função que será reutilizada por todos os triggers
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para a tabela de clientes
DROP TRIGGER IF EXISTS update_customer_timestamp ON deno_customers;
CREATE TRIGGER update_customer_timestamp
BEFORE UPDATE ON deno_customers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger para a tabela de endereços
DROP TRIGGER IF EXISTS update_address_timestamp ON deno_addresses;
CREATE TRIGGER update_address_timestamp
BEFORE UPDATE ON deno_addresses
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger para a tabela de papéis/roles
DROP TRIGGER IF EXISTS update_role_timestamp ON deno_roles;
CREATE TRIGGER update_role_timestamp
BEFORE UPDATE ON deno_roles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();